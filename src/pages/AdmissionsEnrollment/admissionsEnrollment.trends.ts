/**
 * Trend series for the enrolment page.
 *
 * `/academics/enrollment/dashboard/` answers for a single term, so there is no
 * ready-made series to plot. These helpers re-aggregate the cohort model the
 * rest of the page already uses, once per period, so every chart agrees with
 * the KPI cards and the drill-down underneath it — and honours the campus,
 * section, school, class and stream filters.
 */
import {
  aggregate,
  filteredRows,
  previousYearFor,
} from "./admissionsEnrollment.data";
import type { Filters, TermId, YearId } from "./admissionsEnrollment.types";

export type TrendGrain = "term" | "year";

export const trendGrains: ReadonlyArray<{ id: TrendGrain; label: string }> = [
  { id: "term", label: "By term" },
  { id: "year", label: "By year" },
];

/** How many periods each grain plots. Kept short so labels stay readable. */
const termPoints = 6;
const yearPoints = 5;

export interface EnrollmentTrendPoint {
  id: string;
  /** Short axis label: `T2` for a term, `25/26` for a year. */
  label: string;
  /** Second axis line, or an empty string when the label says it all. */
  subLabel: string;
  /** Spoken description used by tooltips and screen readers. */
  description: string;

  learners: number;
  boys: number;
  girls: number;
  newLearners: number;
  continuing: number;
  withdrawn: number;
  retentionRate: number;
}

interface Period {
  year: YearId;
  term: TermId;
}

/** Terms run in this order inside an academic year. `full` is not a period. */
const termOrder: TermId[] = ["t1", "t2", "t3"];

/** `2026/27` -> `26/27`, short enough to sit under a bar. */
const shortYear = (year: YearId) => year.slice(2);

const termNumber = (term: TermId) => Number(term.slice(1));

const termDescription = (period: Period) =>
  `Term ${termNumber(period.term)}, ${period.year}`;

/** The period immediately before `period`, or null once the model runs out. */
function stepBack(period: Period): Period | null {
  const index = termOrder.indexOf(period.term);

  if (index > 0) {
    return { year: period.year, term: termOrder[index - 1] };
  }

  const previousYear = previousYearFor(period.year);

  return previousYear ? { year: previousYear, term: "t3" } : null;
}

/**
 * A whole-year filter has no term of its own, so anchor the series on the last
 * term the year actually ran rather than inventing an average period.
 */
function anchorTerm(filters: Filters): TermId {
  return filters.term === "full" ? "t3" : filters.term;
}

function pointFor(filters: Filters, period: Period): EnrollmentTrendPoint {
  const totals = aggregate(
    filteredRows({ ...filters, year: period.year, term: period.term }),
  );

  return {
    id: `${period.year}-${period.term}`,
    label: `T${termNumber(period.term)}`,
    subLabel: shortYear(period.year),
    description: termDescription(period),

    learners: totals.learners,
    boys: totals.boys,
    girls: totals.girls,
    newLearners: totals.newLearners,
    continuing: totals.continuing,
    withdrawn: totals.withdrawn,
    retentionRate: totals.retentionRate,
  };
}

function yearPointFor(filters: Filters, year: YearId): EnrollmentTrendPoint {
  const totals = aggregate(filteredRows({ ...filters, year, term: "full" }));

  return {
    id: year,
    label: shortYear(year),
    subLabel: "",
    description: `Academic year ${year}`,

    learners: totals.learners,
    boys: totals.boys,
    girls: totals.girls,
    newLearners: totals.newLearners,
    continuing: totals.continuing,
    withdrawn: totals.withdrawn,
    retentionRate: totals.retentionRate,
  };
}

/**
 * Trailing periods ending at the filter's own period, so the rightmost column
 * is always the term the KPI cards describe.
 */
export function enrollmentTrend(
  filters: Filters,
  grain: TrendGrain,
): EnrollmentTrendPoint[] {
  if (grain === "year") {
    const points: EnrollmentTrendPoint[] = [];
    let year: YearId | null = filters.year;

    while (year && points.length < yearPoints) {
      points.push(yearPointFor(filters, year));
      year = previousYearFor(year);
    }

    return points.reverse();
  }

  const periods: Period[] = [];
  let period: Period | null = {
    year: filters.year,
    term: anchorTerm(filters),
  };

  while (period && periods.length < termPoints) {
    periods.push(period);
    period = stepBack(period);
  }

  return periods.reverse().map((entry) => pointFor(filters, entry));
}

/** Change between the first and last point of a series, in percentage points. */
export function trendDelta(points: EnrollmentTrendPoint[]): number | null {
  if (points.length < 2) {
    return null;
  }

  const first = points[0];
  const last = points[points.length - 1];

  if (first.learners === 0) {
    return null;
  }

  return ((last.learners - first.learners) / first.learners) * 100;
}
