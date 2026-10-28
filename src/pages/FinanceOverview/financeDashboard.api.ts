import api from "../../api/axios";

/**
 * `GET /finance/dashboard/` — one figure per school for each finance card, for this
 * financial year so far. Items that belong to no school are the group's (GHL).
 */

export interface DashboardFigures {
  revenue: number;
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

export interface FinanceDashboard {
  period: { start: string; end: string };
  schools: DashboardSchool[];
  group: DashboardFigures;
  totals: DashboardFigures;
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

export async function getFinanceDashboard(): Promise<FinanceDashboardResult> {
  try {
    const { data } = await api.get<FinanceDashboard>("/finance/dashboard/");
    return { data, source: data.schools.length ? "api" : "empty" };
  } catch {
    return { data: null, source: "offline" };
  }
}
