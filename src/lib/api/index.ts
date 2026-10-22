/**
 * Public surface of the frontend API layer.
 *
 * Everything the backend exposes is reachable from here:
 *
 *   import { apiClient, financeApi, useLiabilities, liabilityTotals } from "../lib/api";
 *
 * Layering, bottom to top:
 *   client.ts     axios instance, CSRF header, error normalisation
 *   errors.ts     ApiError + DRF error-body parsing
 *   resources.ts  generic CRUD wrappers + list unwrapping
 *   academics / finance / procurement / core   one export per endpoint
 *   queries.ts    React Query hooks + cache keys
 *   aggregate.ts  arithmetic over raw rows (the backend has no aggregates)
 */
export {
  apiClient,
  apiBaseUrl,
  apiUrl,
  defaultApiBaseUrl,
  readCookie,
} from "./client";

export {
  ApiError,
  extractDetail,
  extractFieldErrors,
  isOfflineError,
  toApiError,
  type ApiErrorCode,
  type ApiErrorInit,
  type ApiFieldErrors,
} from "./errors";

export {
  createCrudResource,
  toSearchParams,
  unwrapList,
  withQuery,
  type CrudResource,
  type QueryParams,
  type QueryValue,
  type RequestOptions,
} from "./resources";

export {
  academicsApi,
  students,
  academicRecords,
  sections,
  gradeResults,
  homework,
  attendance,
  curricular,
  events,
  staff,
  type AcademicsApi,
  type AcademicsResource,
} from "./academics";

export {
  financeApi,
  creditors,
  departments,
  departmentBudgets,
  fiscalYears,
  liabilities,
  monthlyRevenueTargets,
  revenueRecords,
  type FinanceApi,
  type FinanceResource,
} from "./finance";

export {
  procurementApi,
  vendors,
  procurementTransactions,
  type ProcurementApi,
  type ProcurementResource,
} from "./procurement";

export {
  coreApi,
  fetchCurrentUser,
  fetchHealth,
  signIn,
  signInUrl,
  signOut,
  type CoreRequestOptions,
} from "./core";

export {
  apiKeys,
  invalidateAllApi,
  invalidateApiGroup,
  useAcademicRecords,
  useApiCache,
  useAttendance,
  useCreditors,
  useCurricular,
  useDepartmentBudgets,
  useDepartments,
  useEvents,
  useFiscalYears,
  useGradeResults,
  useHealth,
  useHomework,
  useLiabilities,
  useMonthlyRevenueTargets,
  useProcurementTransactions,
  useRevenueRecords,
  useSections,
  useSession,
  useStaff,
  useStudents,
  useVendors,
  type ApiGroup,
} from "./queries";

export {
  groupCount,
  groupRows,
  groupSum,
  liabilityTotals,
  percentage,
  procurementTotals,
  revenueTotals,
  roundTo,
  share,
  sumBy,
  sumWhere,
  toNumber,
  uniqueValues,
  type LiabilityTotals,
  type ProcurementTotals,
  type RevenueTotals,
} from "./aggregate";

export type {
  AcademicRecord,
  AttendanceRecord,
  AuthState,
  AuthUser,
  Choice,
  Creditor,
  CreditorType,
  Curricular,
  Decimal,
  Department,
  DepartmentBudget,
  ExpenseCategory,
  FiscalYear,
  GradeResult,
  HealthStatus,
  HomeworkRecord,
  IsoDate,
  IsoDateTime,
  Liability,
  LiabilityCategory,
  LiabilityStatus,
  MonthlyRevenueTarget,
  Paginated,
  ProcurementCategory,
  ProcurementTransaction,
  RevenueRecord,
  RevenueStream,
  SectionRecord,
  Session,
  SettlementStatus,
  StaffMember,
  Student,
  StudentEvent,
  Vendor,
} from "./types";
