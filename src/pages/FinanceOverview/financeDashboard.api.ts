import api from "../../api/axios";

/**
 * `GET /finance/dashboard/` — one figure per school for each finance card, for the chosen
 * dates (1 January to today unless `start` and `end` say otherwise). What is owed is as of
 * the end date. Monthly spending covers all costs, school or shared.
 */

export interface DashboardFigures {
  revenue: number;
  /** fees paid against the bills in the range (newer backends) */
  revenue_collected?: number;
  /** collected as a % of fees billed (newer backends) */
  collected_percent?: number | null;
  liabilities: { owed: number; due_30_days: number; overdue: number };
  budget: { budget: number; spent: number; used_percent: number | null };
  expenses: number;
  procurement: { spend: number; not_yet_paid: number };
}

export interface DashboardSchool extends DashboardFigures {
  id: number;
  name: string;
  campus: string;
}

export interface DashboardMonth {
  month: string;
  label: string;
  total: number;
  departments: { name: string; amount: number }[];
}

export interface DashboardPurchaseMonth {
  month: string;
  label: string;
  purchased: number;
  not_yet_paid: number;
  /** every school, 0 where it bought nothing; `id` matches `schools` */
  schools: { id: number; purchased: number; not_yet_paid: number }[];
}

export interface FinanceDashboard {
  period: { start: string; end: string };
  schools: DashboardSchool[];
  /** items that belong to no school; the Executive Overview still reads this */
  group: DashboardFigures;
  totals: DashboardFigures;
  /** all spending per month, school or shared (newer backends) */
  expenses_by_month?: DashboardMonth[];
  /** school purchases per month, January to the end date (newer backends) */
  procurement_by_month?: DashboardPurchaseMonth[];
}

/**
 * Where the figures came from:
 *   "api"     the backend answered with at least one school
 *   "empty"   the backend answered but has no schools yet
 *   "offline" the backend could not be reached
 */
export type DashboardSource = "api" | "empty" | "offline";

export interface FinanceDashboardResult {
  data: FinanceDashboard | null;
  source: DashboardSource;
}

export interface DashboardRange {
  /** YYYY-MM-DD */
  start?: string;
  /** YYYY-MM-DD */
  end?: string;
}

export async function getFinanceDashboard(range: DashboardRange = {}): Promise<FinanceDashboardResult> {
  const params = {
    ...(range.start ? { start: range.start } : {}),
    ...(range.end ? { end: range.end } : {}),
  };
  try {
    const { data } = await api.get<FinanceDashboard>("/finance/dashboard/", { params });
    return { data, source: data.schools.length ? "api" : "empty" };
  } catch {
    return { data: null, source: "offline" };
  }
}
