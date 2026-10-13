/**
 * Sample data and derived figures for the Expense Management page.
 *
 * This module is the single source of truth for every number the page shows.
 * Components never hard-code values — they import the constants from here and
 * call the helper functions. That matters because the page presents the same
 * spend in three different cuts (headline KPIs, by category, by department),
 * and going through one module is what keeps those three views agreeing.
 *
 * All money values are plain numbers of **UGX millions**; run them through
 * `formatUgx` or `formatMillions` only when rendering.
 */

import { campusOptions } from "../../lib/organisation";

import type {
  DepartmentSpend,
  DistributionSlice,
  FilterControl,
  Requisition,
  SummaryMetric,
} from "./expenseManagement.types";

/* ---------------------------------------------------------------- Formatting */

/** Formats an amount held in UGX millions, e.g. 540 -> "UGX 540.0M". */
export const formatUgx = (millions: number) => `UGX ${millions.toFixed(1)}M`;

/**
 * Formats an amount held in UGX millions without the currency prefix or a
 * trailing zero, e.g. 240 -> "240M" and 38.5 -> "38.5M".
 *
 * Used where several figures sit on one line — the bar labels in the
 * departmental chart — and "UGX" repeated seven times would be noise.
 */
export const formatMillions = (millions: number) => `${millions}M`;

/* ----------------------------------------------------------- Filter options */

/**
 * The filter rail on the left of the page, in top-to-bottom order.
 *
 * Campus is the only cut the page offers: every card below reports the same
 * "All Campuses" position, and narrowing to a single campus is what the
 * control is for. The campus list is imported from `src/lib/organisation.ts`
 * rather than typed out here — that shared module is the repo-wide source for
 * campus names, so this page and the other dashboard pages can never disagree
 * about how a campus is spelled. `campusOptions[0]` is "All Campuses".
 */
export const filterControls: FilterControl[] = [
  {
    id: "campus",
    label: "Campus",
    value: campusOptions[0],
    options: campusOptions,
  },
];

/* ------------------------------------------------------------ Headline KPIs */

/**
 * The three figures across the top of the page.
 *
 * `pending-approvals` (65.5M) is a subset of `total-ytd`, not a fourth slice of
 * it: it is money already committed but not yet released. It is therefore
 * shown beside the total rather than added into it, which is also why the
 * three do not sum to anything meaningful.
 */
export const summaryMetrics: SummaryMetric[] = [
  {
    id: "total-ytd",
    label: "Total YTD Expenditure",
    amount: 540.0,
    tone: "blue",
  },
  {
    id: "campus-opex",
    label: "Campus Operational Spend",
    amount: 380.0,
    tone: "green",
  },
  {
    id: "pending-approvals",
    label: "Pending Expense Approvals",
    amount: 65.5,
    tone: "amber",
  },
];

/* ------------------------------------------------------ Expense distribution */

/**
 * The four categories the donut splits total spend into, largest first.
 *
 * These add up to 540.0M — the same figure the "Total YTD Expenditure" KPI
 * shows — which is the point of the card: a reader must be able to tally the
 * legend and land on the headline number.
 */
export const expenseDistribution: DistributionSlice[] = [
  {
    id: "salaries",
    label: "Salaries & Allowances",
    amount: 280.0,
    tone: "navy",
  },
  {
    id: "utilities",
    label: "Utilities & Maintenance",
    amount: 115.0,
    tone: "blue",
  },
  {
    id: "materials",
    label: "Instructional Materials",
    amount: 90.0,
    tone: "sky",
  },
  {
    id: "cocurricular",
    label: "Co-curricular & Ops",
    amount: 55.0,
    tone: "mist",
  },
];

/**
 * Total spend across the four distribution categories, in UGX millions.
 *
 * Equals the "Total YTD Expenditure" KPI (540.0M) by design, and is what the
 * donut's centre label shows.
 */
export const totalDistribution = expenseDistribution.reduce(
  (sum, slice) => sum + slice.amount,
  0,
);

/** Share of total spend, as a percentage (e.g. 51.8 for salaries). */
export const distributionShare = (millions: number) =>
  (millions / totalDistribution) * 100;

/* ---------------------------------------- Departmental budget vs. actual */

/**
 * Budget and actual spend per department, in the order the chart plots them.
 *
 * The order is budget size descending, so the grouped bars step down the card
 * and it reads as a ranking without needing a sort control.
 */
export const departmentSpend: DepartmentSpend[] = [
  { id: "academics", department: "Academics", budget: 240, actual: 110 },
  { id: "boarding", department: "Boarding", budget: 145, actual: 55 },
  { id: "admin-hr", department: "Admin & HR", budget: 98, actual: 52 },
  { id: "transport", department: "Transport", budget: 57, actual: 43 },
  { id: "ict", department: "ICT / Tech", budget: 51, actual: 34 },
  { id: "sports", department: "Sports", budget: 38.5, actual: 21.5 },
  { id: "health", department: "Health", budget: 26, actual: 19 },
];

/** Total budgeted spend across every department, in UGX millions (655.5M). */
export const totalDepartmentBudget = departmentSpend.reduce(
  (sum, row) => sum + row.budget,
  0,
);

/** Total actual spend across every department, in UGX millions (334.5M). */
export const totalDepartmentActual = departmentSpend.reduce(
  (sum, row) => sum + row.actual,
  0,
);

/**
 * The largest single departmental budget, in UGX millions.
 *
 * Bars are scaled against this rather than against the sum of all budgets, so
 * the widest bar always fills its track completely. Scaling against the total
 * would leave every bar under half full and hard to compare by eye.
 */
export const peakDepartmentBudget = Math.max(
  ...departmentSpend.map((row) => row.budget),
);

/* -------------------------------------- Requisitions pending approval */

/**
 * The highest-value requisitions still waiting on a signature.
 *
 * Ordered by amount descending so the biggest commitment is read first. Every
 * one of these sits inside `total-ytd` already — the money is committed, which
 * is why the table is headed "pending approval" rather than "requested".
 */
export const pendingRequisitions: Requisition[] = [
  {
    id: "po-2028-089",
    code: "PO-2028-089",
    description: "UNEB Exam Registration & Stationery Materials",
    amount: 32.5,
    campus: "Kibuli Main",
    status: "Pending CFO Clearance",
    tone: "attention",
  },
  {
    id: "po-2028-092",
    code: "PO-2028-092",
    description: "Quarterly Generator Diesel Bulk Purchase (Shell Uganda)",
    amount: 18.0,
    campus: "Buwaate",
    status: "Pending Procurement Verification",
    tone: "review",
  },
  {
    id: "po-2028-095",
    code: "PO-2028-095",
    description: "Sports Complex Grass & Facilities Renovation",
    amount: 15.0,
    campus: "All Campuses",
    status: "Queued for Board Approval",
    tone: "queued",
  },
];
