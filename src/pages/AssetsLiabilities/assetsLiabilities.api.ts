import api from "../../api/axios";

/**
 * `GET /finance/position/`: what the schools own against what they owe, as at `end`
 * (default today) and compared with `start` (default 1 January), for all schools or one.
 */

export interface PositionPart {
  key: string;
  label: string;
  amount: number;
}

export interface PositionBreakdown {
  total: number;
  parts: PositionPart[];
}

export interface PositionFigures {
  cash: number;
  debtors: number;
  fixed: number;
  fixed_by_category: PositionPart[];
  creditors: number;
  tax: number;
  loan_current: number;
  loan_long: number;
  other_long_term: number;
  current_assets: number;
  current_liabilities: number;
  long_term_liabilities: number;
  assets: number;
  liabilities: number;
  net: number;
  current_ratio: number | null;
}

export interface PositionSchoolRow {
  id: number;
  name: string;
  campus: string;
  fixed: number;
  cash: number;
  debtors: number;
  assets: number;
  liabilities: number;
  net: number;
  current_ratio: number | null;
  net_change: number;
}

export interface FinancialPosition {
  period: { start: string; end: string };
  school: number | null;
  schools: { id: number; name: string; campus: string }[];
  at: PositionFigures;
  before: PositionFigures;
  trend: { date: string; assets: number; liabilities: number; net: number }[];
  by_school: PositionSchoolRow[];
  debtors: PositionBreakdown;
  debtor_sections: PositionBreakdown;
  asset_condition: PositionBreakdown;
}

export interface PositionQuery {
  /** one school's id; all schools when left out */
  school?: number;
  /** compare from, YYYY-MM-DD */
  start?: string;
  /** as at, YYYY-MM-DD */
  end?: string;
}

/** The position, or null when the server cannot be reached. */
export async function getFinancialPosition(query: PositionQuery = {}): Promise<FinancialPosition | null> {
  const params = Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined));
  try {
    const { data } = await api.get<FinancialPosition>("/finance/position/", { params });
    return data;
  } catch {
    return null;
  }
}
