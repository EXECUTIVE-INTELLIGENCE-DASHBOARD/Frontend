import api from "../../api/axios";

/**
 * `GET /finance/alerts/`: what needs attention today (overdue tax, low cash cover, loan
 * instalments, cash below forecast), most urgent first. An alert keeps its id while the
 * situation lasts, so the bell can remember which ones were read.
 */

export type AlertSeverity = "critical" | "warning" | "info";

export interface FinanceAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  school: { id: number; name: string; campus: string };
  /** the screen to open, e.g. "liabilities-management" */
  page: string;
  /** the screens whose bell shows this alert */
  pages?: string[];
  /** YYYY-MM-DD: when it fell due or was noticed */
  date: string;
}

/** The alerts, or an empty list when the server cannot be reached. */
export async function getFinanceAlerts(): Promise<FinanceAlert[]> {
  try {
    const { data } = await api.get<FinanceAlert[]>("/finance/alerts/");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
