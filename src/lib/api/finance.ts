/**
 * `finance` app endpoints — `/api/finance/<resource>/`.
 *
 * ⚠️ As of the current deployment the finance router is **not** served by
 * `eid-backend-4mrm.onrender.com` (every `/api/finance/*` path returns 404),
 * even though it exists on the `Dev` branch locally. Calls made through these
 * resources will therefore surface an `ApiError` with `code === "not-found"`.
 */
import { createCrudResource } from "./resources";
import type {
  Creditor,
  Department,
  DepartmentBudget,
  FiscalYear,
  Liability,
  MonthlyRevenueTarget,
  RevenueRecord,
} from "./types";

export const creditors = createCrudResource<Creditor>("finance/creditors");

export const departments = createCrudResource<Department>("finance/departments");

export const departmentBudgets =
  createCrudResource<DepartmentBudget>("finance/department-budgets");

export const fiscalYears = createCrudResource<FiscalYear>("finance/fiscal-years");

export const liabilities = createCrudResource<Liability>("finance/liabilities");

export const monthlyRevenueTargets =
  createCrudResource<MonthlyRevenueTarget>("finance/monthly-revenue-targets");

export const revenueRecords =
  createCrudResource<RevenueRecord>("finance/revenue-records");

export const financeApi = {
  creditors,
  departments,
  departmentBudgets,
  fiscalYears,
  liabilities,
  monthlyRevenueTargets,
  revenueRecords,
} as const;

export type FinanceApi = typeof financeApi;

export type FinanceResource = keyof FinanceApi;
