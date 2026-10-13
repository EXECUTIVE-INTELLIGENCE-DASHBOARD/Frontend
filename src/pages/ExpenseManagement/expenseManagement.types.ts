/**
 * Shape definitions for the Expense Management page.
 *
 * Only data *shapes* live here — no sample values. All concrete figures are in
 * `expenseManagement.data.ts`, so a future API swap only needs to produce
 * objects that satisfy these interfaces.
 *
 * Convention used throughout this page: money is stored as a plain number of
 * **UGX millions** (e.g. `540` means "UGX 540M"), never as a formatted string.
 * Keeping numbers numeric lets us sum, divide and compare them; formatting is
 * applied at the very last moment by `formatUgx` in the data module.
 */

/**
 * One dropdown in the filter rail on the left of the page.
 *
 * `value` is the currently selected option and always has to be one of
 * `options` — the first entry of each option list is the "All ..." default.
 */
export interface FilterControl {
  /** Stable key for React lists and CSS hooks, e.g. `"campus"`. */
  id: string;
  /** Small caption above the value, e.g. `"Campus"`. */
  label: string;
  /** Option selected on first render. */
  value: string;
  /** Every selectable option, with the "All ..." default first. */
  options: string[];
}

/**
 * Colour family for a headline KPI card.
 *
 * The tone drives the `--tone` custom property that CSS uses for the card's
 * left accent bar. Because the value is a union (not `string`), TypeScript
 * rejects a typo such as `"gren"` at the call site.
 */
export type MetricTone = "blue" | "green" | "amber";

/**
 * One headline figure in the KPI row at the top of the page.
 *
 * These three are summaries, not budgeted line items: total spend, the campus
 * share of it, and the value still sitting in the approvals queue. That is why
 * the shape carries no `budget` field — there is nothing to compare them to.
 */
export interface SummaryMetric {
  /** Stable key, e.g. `"total-ytd"`. Also used to pick the card icon. */
  id: string;
  /** Display name, e.g. `"Total YTD Expenditure"`. */
  label: string;
  /** Figure for the year to date, in UGX millions. */
  amount: number;
  tone: MetricTone;
}

/**
 * Colour family for a donut slice.
 *
 * This is a four-stop blue ramp (navy, blue, sky, mist) rather than the three
 * KPI tones: a ring with green and amber slices would look like it belonged to
 * three different charts, and the legend labels already carry the meaning. Hue
 * therefore only has to encode rank.
 */
export type SliceTone = "navy" | "blue" | "sky" | "mist";

/** One slice of the "Expense Distribution" donut. */
export interface DistributionSlice {
  /** Stable key, e.g. `"salaries"`. */
  id: string;
  /** Display name, e.g. `"Salaries & Allowances"`. */
  label: string;
  /** Spend in this category for the year, in UGX millions. */
  amount: number;
  tone: SliceTone;
}

/**
 * One department in the "Departmental Budget vs. Actual Expenditure" chart.
 *
 * Both figures are stored: the chart plots them side by side, and unlike the
 * KPI cards there is a genuine budget to compare against.
 */
export interface DepartmentSpend {
  /** Stable key, e.g. `"academics"`. */
  id: string;
  /** Department name shown beside the bars. */
  department: string;
  /** Budgeted spend for the department, in UGX millions. */
  budget: number;
  /** Actual spend for the department, in UGX millions. */
  actual: number;
}

/**
 * Tone of a requisition's status pill.
 *
 * `attention` is the loudest of the three and is reserved for the rows closest
 * to becoming a payment; `queued` is the quietest because nothing is expected
 * of anyone yet.
 */
export type ApprovalTone = "attention" | "review" | "queued";

/** One row of the "High-Value Requisitions Pending Approval" table. */
export interface Requisition {
  /** Stable key for React lists, e.g. `"po-2028-089"`. */
  id: string;
  /** Purchase-order reference shown in the first column. */
  code: string;
  /** What is being bought, and from whom. */
  description: string;
  /** Value of the requisition, in UGX millions. */
  amount: number;
  /** Campus the spend belongs to, e.g. `"Kibuli Main"`. */
  campus: string;
  /** Where the requisition currently sits in the approval chain. */
  status: string;
  tone: ApprovalTone;
}
