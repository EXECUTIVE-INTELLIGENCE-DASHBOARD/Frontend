import api from "../../api/axios";

export interface LiabilityRecord {
  id: number;
  creditor: number;
  category: "current_payables" | "accrued_expenses_tax" | "long_term_debt";
  status: "current" | "due_soon" | "overdue" | "paid";
  amount: string;
  paid_amount: string;
  outstanding_amount: string;
  currency: string;
  due_date: string;
  issued_date: string;
  paid_date: string | null;
  description: string;
  school: number | null;
}

export interface LiabilityCreditor {
  id: number;
  name: string;
  reference_number: string;
  creditor_type:
    | "lender"
    | "statutory_tax"
    | "trade_payable"
    | "insurer"
    | "utility"
    | "statutory_remittance"
    | "fleet_fuel"
    | "it_comms";
}

export interface LiabilityDashboardResponse {
  summary: {
    total_outstanding: number;
    due_within_30_days: number;
    overdue: number;
    liability_count: number;
    overdue_count: number;
  };
  by_category: Array<{
    category: LiabilityRecord["category"];
    currency: string;
    total: number;
    records: number;
  }>;
  by_status: Array<{
    status: LiabilityRecord["status"];
    currency: string;
    total: number;
    records: number;
  }>;
  top_creditors: Array<{
    creditor_id: number;
    creditor__name: string;
    currency: string;
    outstanding: number;
    liability_count: number;
  }>;
  as_of_date: string;
}

export interface FinanceSchool {
  id: number;
  name: string;
  campus: string;
  campus_display: string;
  level: string;
}

export interface SchoolFeesDashboard {
  summary: {
    fees_not_received: number;
  };
  breakdown: Array<{
    id: number;
    name: string;
    fees_not_received: number;
  }>;
}

export interface LoanRecord {
  id: number;
  loan_reference: string;
  principal_amount: string;
  outstanding_balance: string;
  annual_interest_rate: string;
  currency: string;
  start_date: string;
  maturity_date: string;
  next_installment_date: string | null;
  status: string;
  description: string;
  school: number | null;
  creditor: number;
}

export interface LoanRepayment {
  id: number;
  installment_total: string;
  installment_paid: string;
  installment_outstanding: string;
  installment_number: number;
  due_date: string;
  principal_due: string;
  interest_due: string;
  principal_paid: string;
  interest_paid: string;
  balance_after_payment: string;
  paid_date: string | null;
  status: string;
  loan: number;
}

export interface BankAccount {
  id: number;
  account_name: string;
  bank_name: string;
  account_reference: string;
  account_type: string;
  balance: string;
  currency: string;
  as_of_date: string;
  is_active: boolean;
  school: number | null;
}

export interface CashForecast {
  id: number;
  forecast_date: string;
  forecast_balance: string;
  actual_balance: string;
  currency: string;
  notes: string;
  school: number | null;
}

export interface LiabilitiesApiData {
  dashboard: LiabilityDashboardResponse;
  liabilities: LiabilityRecord[];
  creditors: LiabilityCreditor[];
  schools: FinanceSchool[];
  schoolFees: SchoolFeesDashboard;
  loans: LoanRecord[];
  repayments: LoanRepayment[];
  bankAccounts: BankAccount[];
  cashForecasts: CashForecast[];
}

function listFromResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "results" in data) {
    const results = (data as { results?: unknown }).results;
    if (Array.isArray(results)) return results as T[];
  }

  throw new Error("The liability API returned an invalid list response.");
}

async function getList<T>(path: string, signal: AbortSignal): Promise<T[]> {
  const response = await api.get<unknown>(path, { signal });
  return listFromResponse<T>(response.data);
}

export async function getLiabilitiesApiData(
  signal: AbortSignal,
): Promise<LiabilitiesApiData> {
  const [
    dashboardResponse,
    liabilities,
    creditors,
    schools,
    schoolFeesResponse,
    loans,
    repayments,
    bankAccounts,
    cashForecasts,
  ] = await Promise.all([
    api.get<LiabilityDashboardResponse>("/finance/liability/dashboard/", {
      signal,
    }),
    getList<LiabilityRecord>("/liabilities/", signal),
    getList<LiabilityCreditor>("/creditors/", signal),
    getList<FinanceSchool>("/academics/schools/", signal),
    api.get<SchoolFeesDashboard>("/finance/school-fees/dashboard/", {
      signal,
    }),
    getList<LoanRecord>("/loans/", signal),
    getList<LoanRepayment>("/loan-repayments/", signal),
    getList<BankAccount>("/bank-accounts/", signal),
    getList<CashForecast>("/cash-forecasts/", signal),
  ]);

  return {
    dashboard: dashboardResponse.data,
    liabilities,
    creditors,
    schools,
    schoolFees: schoolFeesResponse.data,
    loans,
    repayments,
    bankAccounts,
    cashForecasts,
  };
}
