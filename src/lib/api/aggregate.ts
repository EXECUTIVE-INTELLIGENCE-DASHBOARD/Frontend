/**
 * Arithmetic helpers for backend rows.
 *
 * The backend's `DecimalField`s arrive as strings (`"17500000.00"`) and the
 * dashboard needs aggregates (totals, shares, per-group splits) that no
 * endpoint currently computes. These helpers are the frontend-side answer to
 * that gap; if aggregation endpoints are added later, they become dead code
 * and can be deleted without touching call sites.
 */
import type {
  Decimal,
  Liability,
  LiabilityStatus,
  ProcurementTransaction,
  RevenueRecord,
  SettlementStatus,
} from "./types";

/** Parse a DRF decimal string (or number) into a finite number, defaulting to 0. */
export function toNumber(value: Decimal | number | null | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (value === null || value === undefined || value === "") return 0;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Round to a fixed number of decimal places. */
export function roundTo(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return 0;

  /* Scale through the exponential form so halves round half-up.
     Multiplying first (1.005 * 100 = 100.49999999999999) would drop them. */
  const shifted = Number(`${value}e${decimals}`);
  if (!Number.isFinite(shifted)) return value;

  return Number(`${Math.round(shifted)}e-${decimals}`);
}

/** Sum a numeric projection of a list. */
export function sumBy<TRow>(
  rows: readonly TRow[],
  pick: (row: TRow) => Decimal | number | null | undefined,
): number {
  return rows.reduce((total, row) => total + toNumber(pick(row)), 0);
}

/** Sum a numeric projection, keeping only rows that match a predicate. */
export function sumWhere<TRow>(
  rows: readonly TRow[],
  matches: (row: TRow) => boolean,
  pick: (row: TRow) => Decimal | number | null | undefined,
): number {
  return sumBy(
    rows.filter((row) => matches(row)),
    pick,
  );
}

/** Bucket rows by a string key. */
export function groupRows<TRow, TKey extends string>(
  rows: readonly TRow[],
  key: (row: TRow) => TKey,
): Record<TKey, TRow[]> {
  const groups = {} as Record<TKey, TRow[]>;

  for (const row of rows) {
    const bucket = key(row);
    (groups[bucket] ??= []).push(row);
  }

  return groups;
}

/** Total a numeric projection per group. */
export function groupSum<TRow, TKey extends string>(
  rows: readonly TRow[],
  key: (row: TRow) => TKey,
  pick: (row: TRow) => Decimal | number | null | undefined,
): Record<TKey, number> {
  const groups = groupRows(rows, key);
  const totals = {} as Record<TKey, number>;

  for (const [bucket, bucketRows] of Object.entries(groups) as [
    TKey,
    TRow[],
  ][]) {
    totals[bucket] = sumBy(bucketRows, pick);
  }

  return totals;
}

/** Count rows per group. */
export function groupCount<TRow, TKey extends string>(
  rows: readonly TRow[],
  key: (row: TRow) => TKey,
): Record<TKey, number> {
  const groups = groupRows(rows, key);
  const counts = {} as Record<TKey, number>;

  for (const [bucket, bucketRows] of Object.entries(groups) as [
    TKey,
    TRow[],
  ][]) {
    counts[bucket] = bucketRows.length;
  }

  return counts;
}

/** A part-to-whole ratio clamped to 0..1 (never `NaN`, never negative). */
export function share(part: number, whole: number): number {
  if (!Number.isFinite(part) || !Number.isFinite(whole) || whole <= 0) return 0;
  return Math.min(Math.max(part / whole, 0), 1);
}

/** A part-to-whole percentage with one decimal place. */
export function percentage(part: number, whole: number): number {
  return roundTo(share(part, whole) * 100, 1);
}

/** Distinct values of a projection, in first-seen order. */
export function uniqueValues<TRow, TValue>(
  rows: readonly TRow[],
  pick: (row: TRow) => TValue,
): TValue[] {
  const seen = new Set<TValue>();

  for (const row of rows) seen.add(pick(row));

  return [...seen];
}

/* ------------------------------------------------------------------ */
/* Domain shorthands — the shapes the dashboard pages actually need.   */
/* ------------------------------------------------------------------ */

export interface LiabilityTotals {
  total: number;
  paid: number;
  outstanding: number;
  overdue: number;
  dueSoon: number;
  byStatus: Record<LiabilityStatus, number>;
  byCategory: Record<string, number>;
}

/** Roll liability rows up into the KPI numbers the Liabilities page shows. */
export function liabilityTotals(
  rows: readonly Liability[],
): LiabilityTotals {
  const byStatus: Record<LiabilityStatus, number> = {
    current: 0,
    due_soon: 0,
    overdue: 0,
    paid: 0,
  };

  for (const row of rows) {
    const status = row.status in byStatus ? row.status : "current";
    byStatus[status] += toNumber(row.amount);
  }

  const total = sumBy(rows, (row) => row.amount);

  return {
    total,
    paid: byStatus.paid,
    outstanding: roundTo(total - byStatus.paid, 2),
    overdue: byStatus.overdue,
    dueSoon: byStatus.due_soon,
    byStatus,
    byCategory: groupSum(rows, (row) => row.category, (row) => row.amount),
  };
}

export interface RevenueTotals {
  billed: number;
  realized: number;
  /** `billed_amount - realized_amount`; the model's `arrears_amount` property. */
  arrears: number;
  collectionRate: number;
  byStream: Record<string, number>;
}

/** Roll revenue rows up into billed / collected / arrears figures. */
export function revenueTotals(
  rows: readonly RevenueRecord[],
): RevenueTotals {
  const billed = sumBy(rows, (row) => row.billed_amount);
  const realized = sumBy(rows, (row) => row.realized_amount);

  return {
    billed,
    realized,
    arrears: roundTo(billed - realized, 2),
    collectionRate: percentage(realized, billed),
    byStream: groupSum(rows, (row) => row.stream, (row) => row.realized_amount),
  };
}

export interface ProcurementTotals {
  total: number;
  byStatus: Record<SettlementStatus, number>;
  byCategory: Record<string, number>;
  byVendor: Record<string, number>;
}

/** Roll procurement transactions up into paid / committed / outstanding. */
export function procurementTotals(
  rows: readonly ProcurementTransaction[],
): ProcurementTotals {
  const byStatus: Record<SettlementStatus, number> = {
    paid: 0,
    committed: 0,
    outstanding: 0,
  };

  for (const row of rows) {
    const status = row.status in byStatus ? row.status : "outstanding";
    byStatus[status] += toNumber(row.amount);
  }

  return {
    total: sumBy(rows, (row) => row.amount),
    byStatus,
    byCategory: groupSum(rows, (row) => row.category, (row) => row.amount),
    byVendor: groupSum(rows, (row) => String(row.vendor), (row) => row.amount),
  };
}
