/**
 * Shape definitions for the Expense Management page.
 *
 * Only data *shapes* live here — no sample values. All concrete figures are in
 * `expenseManagement.data.ts`, so a future API swap only needs to produce
 * objects that satisfy these interfaces.
 *
 * Convention used throughout this page: money is stored as a plain number of
 * **UGX millions** (e.g. `412` means "UGX 412M"), never as a formatted string.
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
  /** Small uppercase caption above the value, e.g. `"Select Campus"`. */
  label: string;
  /** Option selected on first render. */
  value: string;
  /** Every selectable option, with the "All ..." default first. */
  options: string[];
}

/**
 * Colour family for an overhead KPI card.
 *
 * The tone drives the `--tone` custom property that CSS uses for the card's
 * left accent bar. Because the value is a union (not `string`), TypeScript
 * rejects a typo such as `"gren"` at the call site.
 */
export type OverheadTone = "blue" | "green" | "amber" | "violet";

/** One overhead category — a single KPI card and a single table row. */
export interface Overhead {
  /** Stable key, e.g. `"rent"`. Also used to pick the card icon. */
  id: string;
  /** Display name, e.g. `"Rent & Facilities"`. */
  label: string;
  /** Actual spend for the year, in UGX millions. */
  amount: number;
  /**
   * Budgeted spend for the year, in UGX millions.
   *
   * Budget is the *source of truth* and variance is always derived from it via
   * `overheadVariance()`. Storing a pre-computed variance percentage as well
   * would let the two drift apart, so the field is deliberately absent.
   */
  budget: number;
  tone: OverheadTone;
}

/** One month on the spend-trend line chart. */
export interface SpendPoint {
  /** Stable key, e.g. `"jul"`. */
  id: string;
  /** Short month label shown along the x-axis, e.g. `"Jul"`. */
  label: string;
  /** Actual spend for the month, in UGX millions. */
  actual: number;
  /** Budgeted spend for the month, in UGX millions. */
  budget: number;
}

/** One campus in the "Spend by Campus" bar list. */
export interface CampusSpendRow {
  /** Stable key, e.g. `"primary-kibuli"`. */
  id: string;
  /** Campus name, shortened for the bar label. */
  campus: string;
  /** Actual spend for the year, in UGX millions. */
  amount: number;
}