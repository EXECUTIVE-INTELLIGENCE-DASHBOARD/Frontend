import api from "../../api/axios";
import type {
  FiscalYear,
  ProcurementCategory,
  ProcurementTransaction,
  SettlementStatus,
  Vendor,
} from "../../lib/api/types";

export interface ProcurementSchool {
  id: number;
  name: string;
  campus_display: string;
}

export type ProcurementTransactionRow = ProcurementTransaction & {
  school?: number | null;
};

export interface ProcurementTransactionPayload {
  vendor: number;
  fiscal_year: number;
  category: ProcurementCategory;
  status: SettlementStatus;
  amount: string;
  currency: string;
  transaction_date: string;
  reference_number: string;
  description: string;
  school?: number | null;
}

export interface ProcurementRequestsData {
  transactions: ProcurementTransactionRow[];
  vendors: Vendor[];
  fiscalYears: FiscalYear[];
  schools: ProcurementSchool[];
  errors: string[];
}

async function loadList<T>(
  label: string,
  path: string,
  signal: AbortSignal,
  errors: string[],
): Promise<T[]> {
  try {
    const response = await api.get<T[]>(path, { signal });
    return response.data;
  } catch (error) {
    if (!signal.aborted) {
      console.error(`Failed to load procurement ${label}:`, error);
      errors.push(`Could not load ${label}.`);
    }

    return [];
  }
}

export async function getProcurementRequestsData(
  signal: AbortSignal,
): Promise<ProcurementRequestsData> {
  const errors: string[] = [];
  const [transactions, vendors, fiscalYears, schools] = await Promise.all([
    loadList<ProcurementTransactionRow>(
      "transactions",
      "/procurement/procurement-transactions/",
      signal,
      errors,
    ),
    loadList<Vendor>(
      "vendors",
      "/procurement/vendors/",
      signal,
      errors,
    ),
    loadList<FiscalYear>("fiscal years", "/fiscal-years/", signal, errors),
    loadList<ProcurementSchool>(
      "schools",
      "/academics/schools/",
      signal,
      errors,
    ),
  ]);

  return { transactions, vendors, fiscalYears, schools, errors };
}

export async function createProcurementTransaction(
  payload: ProcurementTransactionPayload,
): Promise<ProcurementTransactionRow> {
  const response = await api.post<ProcurementTransactionRow>(
    "/procurement/procurement-transactions/",
    payload,
  );

  return response.data;
}

export async function updateProcurementTransactionStatus(
  id: number,
  status: SettlementStatus,
): Promise<ProcurementTransactionRow> {
  const response = await api.patch<ProcurementTransactionRow>(
    `/procurement/procurement-transactions/${id}/`,
    { status },
  );

  return response.data;
}
