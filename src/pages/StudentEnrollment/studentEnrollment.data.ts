import type {
  CampusRecord,
  EnrollmentSummary,
  TierFigure,
  TierId,
  TierLegendItem,
} from "./studentEnrollment.types";

export const academicYearLabel = "AY 2026/27";
export const allCampusesLabel = "All Campuses";

/*
 * Sample data until the enrolment API exists.
 *
 * From the design: the campus totals and the boys/girls split
 * (1,250 + 850 + 700 = 2,800 students, 1,430 boys, 1,370 girls).
 *
 * Placeholders chosen to add up to the design's headline figures: capacity,
 * admissions conversion and the tier split of each campus. Together they give
 * 91.2% capacity utilisation, 84.5% admissions conversion (weighted by
 * enrolment) and 450 / 1,450 / 650 / 250 students across the four tiers.
 */
export const campuses: CampusRecord[] = [
  {
    id: "kibuli",
    name: "Kibuli Main",
    boys: 640,
    girls: 610,
    capacity: 1340,
    admissionsConversion: 85.8,
    tiers: { nursery: 90, primary: 620, olevel: 400, alevel: 140 },
  },
  {
    id: "buwaate",
    name: "Buwaate",
    boys: 430,
    girls: 420,
    capacity: 940,
    admissionsConversion: 84.4,
    tiers: { nursery: 60, primary: 430, olevel: 250, alevel: 110 },
  },
  {
    id: "annex",
    name: "Annex Preschool",
    boys: 360,
    girls: 340,
    capacity: 790,
    admissionsConversion: 82.3,
    tiers: { nursery: 300, primary: 400, olevel: 0, alevel: 0 },
  },
];

export const campusOptions: string[] = [
  allCampusesLabel,
  ...campuses.map((campus) => campus.name),
];

const tierLabels: { id: TierId; label: string }[] = [
  { id: "nursery", label: "Nursery" },
  { id: "primary", label: "Primary" },
  { id: "olevel", label: "O-Level" },
  { id: "alevel", label: "A-Level" },
];

export const tierLegend: TierLegendItem[] = [
  { label: "Core (Primary)", tone: "primary" },
  { label: "Secondary / Prep", tone: "olevel" },
  { label: "Sixth Form (A-L)", tone: "alevel" },
];

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);

export const formatNumber = (value: number) => value.toLocaleString("en-US");

export const formatPercent = (value: number) => `${value.toFixed(1)}%`;

/*
 * Picks a tidy chart axis with at most four steps, so a peak of 640 gives
 * 0 to 800 in steps of 200 and a peak of 1,450 gives 0 to 1,600 in steps of
 * 400, the same as the design.
 */
const AXIS_STEPS = [10, 20, 50, 100, 200, 400, 500, 1000, 2000];

export function axisFor(peak: number) {
  const step =
    AXIS_STEPS.find((candidate) => Math.ceil(peak / candidate) <= 4) ?? 2000;
  const top = Math.max(1, Math.ceil(peak / step)) * step;
  const ticks: number[] = [];

  for (let value = 0; value <= top; value += step) {
    ticks.push(value);
  }

  return { top, step, ticks };
}

export function recordsFor(campus: string): CampusRecord[] {
  const match = campuses.filter((record) => record.name === campus);

  return match.length > 0 ? match : campuses;
}

export function summaryFor(campus: string): EnrollmentSummary {
  const records = recordsFor(campus);
  const isAll = records.length === campuses.length;

  const boys = sum(records.map((record) => record.boys));
  const girls = sum(records.map((record) => record.girls));
  const total = boys + girls;
  const capacity = sum(records.map((record) => record.capacity));

  const conversion =
    sum(
      records.map(
        (record) => record.admissionsConversion * (record.boys + record.girls),
      ),
    ) / total;

  const tiers: TierFigure[] = tierLabels.map(({ id, label }) => {
    const value = sum(records.map((record) => record.tiers[id]));

    return { id, label, value, share: (value / total) * 100 };
  });

  const scope = records.map((record) => record.name).join(", ");

  return {
    records,
    isAll,
    total,
    boys,
    girls,
    boysShare: (boys / total) * 100,
    girlsShare: (girls / total) * 100,
    conversion,
    utilization: (total / capacity) * 100,
    tiers,
    scopeText: isAll
      ? `Aggregate ${formatNumber(total)} students`
      : `${scope} ${formatNumber(total)} students`,
  };
}
