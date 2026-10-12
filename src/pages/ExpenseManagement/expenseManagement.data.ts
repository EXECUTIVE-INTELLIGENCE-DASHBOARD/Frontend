/**
 * Sample data and derived figures for the Expense Management page.
 *
 * This module is the single source of truth for every number the page shows.
 * Components never hard-code values — they import the constants from here and
 * call the helper functions. That matters because the page presents the same
 * spend in three different cuts (by category, by month, by campus), and going
 * through one module is what keeps those three views agreeing with each other.
 *
 * All money values are plain numbers of **UGX millions**; run them through
 * `formatUgx` only when rendering.
 */

import { campusOptions } from "../../lib/organisation";

import type {
  CampusSpendRow,
  FilterControl,
  Overhead,
  SpendPoint,
} from "./expenseManagement.types";

/* ----------------------------------------------------------- Filter options */

/**
 * Departments available in the Department dropdown. `departmentOptions[0]` is
 * the default selection, which is why "All Departments" must stay first.
 */
export const departmentOptions = [
  "All Departments",
  "Academics",
  "Administration",
  "Finance",
  "Facilities",
  "Human Resources",
  "ICT",
  "Marketing & Admissions",
  "Catering & Boarding",
  "Transport",
];

/** Cost-centre codes available in the Cost Centre dropdown. */
export const costCentreOptions = [
  "All Cost Centres",
  "CC-100 Teaching",
  "CC-200 Facilities",
  "CC-300 Welfare",
  "CC-400 Admin",
  "CC-500 Transport",
  "CC-600 Marketing",
];

/**
 * The filter rail on the left of the page, in top-to-bottom order.
 *
 * Campus comes first because it is the broadest cut of the data. Note that the
 * campus list is imported from `src/lib/organisation.ts` rather than typed out
 * here — that shared module is the repo-wide source for campus names, so this
 * page and the other dashboard pages can never disagree about how a campus is
 * spelled. `campusOptions[0]` is "All Campuses".
 */
export const filterControls: FilterControl[] = [
  {
    id: "campus",
    label: "Select Campus",
    value: campusOptions[0],
    options: campusOptions,
  },
  {
    id: "department",
    label: "Department",
    value: departmentOptions[0],
    options: departmentOptions,
  },
  {
    id: "cost-centre",
    label: "Cost Centre",
    value: costCentreOptions[0],
    options: costCentreOptions,
  },
];

/* ------------------------------------------------ Overheads (the four KPIs) */

/**
 * The four overhead categories that drive the KPI cards and the variance
 * table. Actual spend across all four is 601.3M; total budget is 592.2M.
 */
export const overheads: Overhead[] = [
  {
    id: "rent",
    label: "Rent & Facilities",
    amount: 96.4,
    budget: 94.1,
    tone: "blue",
  },
  {
    id: "wages",
    label: "Wages & Salaries",
    amount: 412.0,
    budget: 404.7,
    tone: "green",
  },
  {
    id: "utilities",
    label: "Utilities",
    amount: 58.7,
    budget: 61.2,
    tone: "amber",
  },
  {
    id: "marketing",
    label: "Marketing & Admissions",
    amount: 34.2,
    budget: 32.2,
    tone: "violet",
  },
];

/* ------------------------------------------------------- Derived figures */

/** Formats an amount held in UGX millions, e.g. 412 -> "UGX 412.0M". */
export const formatUgx = (millions: number) => `UGX ${millions.toFixed(1)}M`;

/**
 * Total actual overhead spend across every category, in UGX millions.
 *
 * Used as the centre of the composition donut and as the denominator of
 * `overheadShare`. Currently 601.3M.
 */
export const totalOverheads = overheads.reduce(
  (sum, overhead) => sum + overhead.amount,
  0,
);

/**
 * Total budgeted overhead spend across every category, in UGX millions.
 *
 * The comparison figure for the "total" row of the variance table. Currently
 * 592.2M.
 */
export const totalOverheadBudget = overheads.reduce(
  (sum, overhead) => sum + overhead.budget,
  0,
);

/** Share of total overhead spend, as a percentage (e.g. 68.5 for wages). */
export const overheadShare = (millions: number) =>
  (millions / totalOverheads) * 100;

/**
 * Movement against budget for one category, as a percentage.
 *
 * Positive means over budget, negative means under budget. Every variance
 * shown on the page — on the KPI cards and in the table — comes from here, so
 * the two can never disagree.
 */
export const overheadVariance = (overhead: Overhead) =>
  ((overhead.amount - overhead.budget) / overhead.budget) * 100;

/**
 * Budget variance with an explicit direction, e.g. "+2.4%" or "−4.1%".
 *
 * Uses a real minus sign (U+2212) rather than a hyphen so it lines up with the
 * digits and does not look like a dash.
 */
export const formatVariance = (percent: number) =>
  `${percent >= 0 ? "+" : "−"}${Math.abs(percent).toFixed(1)}%`;

/* ------------------------------------------------- Monthly spend trend */

/**
 * Actual vs budgeted spend for each month of the academic year (Jul → Jun).
 *
 * The twelve `actual` values deliberately add up to the same 601.3M as the
 * four `overheads` above, and the twelve `budget` values add up to 598.0M.
 * That is on purpose: a viewer who tallies the monthly chart must arrive at
 * the same figure the KPI cards show, otherwise the page looks untrustworthy.
 */
export const spendTrend: SpendPoint[] = [
  { id: "jul", label: "Jul", actual: 48.2, budget: 49.0 },
  { id: "aug", label: "Aug", actual: 49.0, budget: 48.0 },
  { id: "sep", label: "Sep", actual: 57.0, budget: 53.0 },
  { id: "oct", label: "Oct", actual: 50.8, budget: 51.0 },
  { id: "nov", label: "Nov", actual: 49.9, budget: 50.0 },
  { id: "dec", label: "Dec", actual: 44.3, budget: 46.0 },
  { id: "jan", label: "Jan", actual: 55.0, budget: 52.0 },
  { id: "feb", label: "Feb", actual: 50.4, budget: 51.0 },
  { id: "mar", label: "Mar", actual: 54.0, budget: 52.0 },
  { id: "apr", label: "Apr", actual: 49.2, budget: 50.0 },
  { id: "may", label: "May", actual: 47.8, budget: 49.0 },
  { id: "jun", label: "Jun", actual: 45.7, budget: 47.0 },
];

/**
 * Total actual spend across the monthly trend, in UGX millions.
 *
 * Equals `totalOverheads` (601.3M) by design — see the note on `spendTrend`.
 */
export const trendActualTotal = spendTrend.reduce(
  (sum, point) => sum + point.actual,
  0,
);

/**
 * Total budgeted spend across the monthly trend, in UGX millions.
 *
 * Shown in the chart caption next to the actual total. Currently 598.0M.
 */
export const trendBudgetTotal = spendTrend.reduce(
  (sum, point) => sum + point.budget,
  0,
);

/**
 * The month with the highest actual spend.
 *
 * `reduce` walks the list keeping the running maximum, so no sorting or index
 * bookkeeping is needed. Sep (57.0M) wins for the current figures.
 */
export const peakSpendMonth = spendTrend.reduce((peak, point) =>
  point.actual > peak.actual ? point : peak,
);

/* --------------------------------------------------- Spend by campus */

/**
 * Annual spend per campus — the same 601.3M total, split six ways.
 *
 * Campus names are shortened here ("Secondary Kibuli") because this list feeds
 * horizontal bar labels, where the full official name from
 * `src/lib/organisation.ts` would be too wide.
 */
export const campusSpend: CampusSpendRow[] = [
  { id: "nursery-kibuli", campus: "Nursery Kibuli", amount: 58.4 },
  { id: "primary-kibuli", campus: "Primary Kibuli", amount: 142.8 },
  { id: "secondary-kibuli", campus: "Secondary Kibuli", amount: 196.2 },
  { id: "nursery-buwaate", campus: "Nursery Buwaate", amount: 41.7 },
  { id: "primary-buwaate", campus: "Primary Buwaate", amount: 87.6 },
  { id: "international", campus: "International School", amount: 74.6 },
];

/**
 * Total actual spend across every campus, in UGX millions.
 *
 * Equals `totalOverheads` (601.3M) by design, so the campus bars reconcile
 * with the KPI cards and the monthly chart.
 */
export const totalCampusSpend = campusSpend.reduce(
  (sum, row) => sum + row.amount,
  0,
);

/**
 * The campus carrying the largest share of spend.
 *
 * Same reduce-as-running-maximum trick as `peakSpendMonth`. Secondary Kibuli
 * (196.2M) is the current leader.
 */
export const topCampus = campusSpend.reduce((top, row) =>
  row.amount > top.amount ? row : top,
);

/** Share of total campus spend, as a percentage (e.g. 32.6 for Secondary). */
export const campusShare = (millions: number) =>
  (millions / totalCampusSpend) * 100;