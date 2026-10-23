/**
 * Wire types for the GreenHill EID Django REST Framework backend.
 *
 * Every type here mirrors the Django model that the matching
 * `ModelSerializer(fields = "__all__")` exposes, so the field names are the
 * ones the API actually returns — not a frontend-friendly rename.
 *
 * Two conventions matter:
 *  1. `DecimalField` is serialised by DRF as a **string** (`"17500000.00"`).
 *     Use `toNumber()` from `./aggregate` before doing any maths.
 *  2. Foreign keys are serialised as the **primary key number**, not as a
 *     nested object, because no serializer overrides them.
 */

/** A `DecimalField` inside a JSON body. Always parse with `toNumber()`. */
export type Decimal = string;

/** An ISO-8601 `date` (`"2026-10-01"`). */
export type IsoDate = string;

/** An ISO-8601 `datetime` (`"2026-10-01T09:12:44.123456Z"`). */
export type IsoDateTime = string;

/** `CharField(choices=...)` value carried over the wire. */
export type Choice = string;

/**
 * DRF's paginated envelope. Not currently enabled on the backend (lists come
 * back as plain arrays) but `unwrapList()` tolerates both, so enabling
 * `PAGE_SIZE` later will not break the frontend.
 */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/* ------------------------------------------------------------------ */
/* academics app — /api/academics/...                                  */
/* ------------------------------------------------------------------ */

/** `/api/academics/students/` — `academics.models.Student`. */
export interface Student {
  id: number;
  name: string;
  date_of_birth: string;
  gender: Choice;
  created_on: IsoDateTime | null;
  nationality: string;
  lin: string;
  email: string;
  address: string;
  phone: string;
  guardian_name: string;
  relation: string;
  guardian_contact: string;
}

/**
 * `/api/academics/academics/` — `academics.models.Academic`.
 * Named `AcademicRecord` here so it never collides with page components.
 */
export interface AcademicRecord {
  id: number;
  /** FK → `Student.id`. */
  name: number;
  subjects: string;
  syllabus: string;
  created_on: IsoDateTime | null;
  outcome: string;
}

/** `/api/academics/sections/` — `academics.models.Section`. */
export interface SectionRecord {
  id: number;
  /** FK → `Student.id`. */
  name: number;
  grade_levels: string;
  streams: string;
  allocation: string;
}

/** `/api/academics/grade-results/` — `academics.models.GradeResult`. */
export interface GradeResult {
  id: number;
  /** FK → `Student.id`. */
  name: number;
  marks: string;
  rankings: string;
  transcript: string;
  report_cards: string;
}

/** `/api/academics/homework/` — `academics.models.Homework`. */
export interface HomeworkRecord {
  id: number;
  /** FK → `Student.id`. */
  name: number;
  task: string;
  grade: string;
  submission: string;
}

/** `/api/academics/attendance/` — `academics.models.Attendance`. */
export interface AttendanceRecord {
  id: number;
  /** FK → `Student.id`. */
  name: number;
  student_attendance: string;
  grade: string;
  staff_attendance: string;
  period: string;
}

/** `/api/academics/curricular/` — `academics.models.Curricular`. */
export interface Curricular {
  id: number;
  name: string;
  club: string;
  society: string;
}

/** `/api/academics/events/` — `academics.models.Events`. */
export interface StudentEvent {
  id: number;
  /** FK → `Curricular.id`. */
  name: number;
  competition: string;
  achievement: string;
  total_female: number;
  total_male: number;
  period: string;
}

/** `/api/academics/staff/` — `academics.models.Staff`. */
export interface StaffMember {
  id: number;
  name: string;
  contact: string;
  email: string;
}

/* ------------------------------------------------------------------ */
/* finance app — /api/finance/...                                      */
/* ------------------------------------------------------------------ */

/** `finance.models.ExpenseCategory` (a `TextChoices`, not a model). */
export type ExpenseCategory =
  | "salaries"
  | "utilities_maintenance"
  | "instructional_materials"
  | "cocurricular_ops";

/** `finance.models.CreditorType`. */
export type CreditorType =
  | "lender"
  | "statutory_tax"
  | "trade_payable"
  | "insurer"
  | "utility"
  | "statutory_remittance"
  | "fleet_fuel"
  | "it_comms";

/** `finance.models.LiabilityCategory`. */
export type LiabilityCategory =
  | "current_payables"
  | "accrued_expenses_tax"
  | "long_term_debt";

/** `finance.models.LiabilityStatus`. */
export type LiabilityStatus = "current" | "due_soon" | "overdue" | "paid";

/** `finance.models.RevenueStream`. */
export type RevenueStream =
  | "tuition"
  | "extracurricular"
  | "admission_registration"
  | "transport"
  | "donations"
  | "alumni";

/** `/api/finance/fiscal-years/` — `finance.models.FiscalYear`. */
export interface FiscalYear {
  id: number;
  /** `CharField(max_length=9)`, e.g. `"2025/2026"`. */
  year: string;
  /** 1–4, enforced by a check constraint. */
  quarter: number;
}

/** `/api/finance/departments/` — `finance.models.Department`. */
export interface Department {
  id: number;
  name: string;
}

/** `/api/finance/department-budgets/` — `finance.models.DepartmentBudget`. */
export interface DepartmentBudget {
  id: number;
  /** FK → `Department.id`. */
  department: number;
  /** FK → `FiscalYear.id`. */
  fiscal_year: number;
  budget_amount: Decimal;
}

/** `/api/finance/creditors/` — `finance.models.Creditor`. */
export interface Creditor {
  id: number;
  name: string;
  reference_number: string;
  creditor_type: CreditorType;
}

/** `/api/finance/liabilities/` — `finance.models.Liability`. */
export interface Liability {
  id: number;
  /** FK → `Creditor.id`. */
  creditor: number;
  category: LiabilityCategory;
  status: LiabilityStatus;
  amount: Decimal;
  currency: string;
  due_date: IsoDate;
  issued_date: IsoDate;
  paid_date: IsoDate | null;
  description: string;
}

/**
 * `/api/finance/revenue-records/` — `finance.models.RevenueRecord`.
 *
 * The model exposes an `arrears_amount` *property*, which `fields = "__all__"`
 * does **not** serialise. Compute it with `billed - realized`.
 */
export interface RevenueRecord {
  id: number;
  /** FK → `FiscalYear.id`. */
  fiscal_year: number;
  stream: RevenueStream;
  billed_amount: Decimal;
  realized_amount: Decimal;
  currency: string;
  billing_date: IsoDate;
}

/** `/api/finance/monthly-revenue-targets/` — `finance.models.MonthlyRevenueTarget`. */
export interface MonthlyRevenueTarget {
  id: number;
  /** FK → `FiscalYear.id`. */
  fiscal_year: number;
  /** A `DateField` — first of the month. */
  month: IsoDate;
  target_amount: Decimal;
  realized_amount: Decimal | null;
  currency: string;
}

/* ------------------------------------------------------------------ */
/* procurement app — /api/procurement/...                              */
/* ------------------------------------------------------------------ */

/** `procurement.models.ProcurementCategory`. */
export type ProcurementCategory = "works" | "services" | "goods";

/** `procurement.models.SettlementStatus`. */
export type SettlementStatus = "paid" | "committed" | "outstanding";

/** `/api/procurement/vendors/` — `procurement.models.Vendor`. */
export interface Vendor {
  id: number;
  name: string;
  primary_category: ProcurementCategory;
}

/** `/api/procurement/procurement-transactions/` — `procurement.models.ProcurementTransaction`. */
export interface ProcurementTransaction {
  id: number;
  /** FK → `Vendor.id`. */
  vendor: number;
  /** FK → `finance.FiscalYear.id`. */
  fiscal_year: number;
  category: ProcurementCategory;
  status: SettlementStatus;
  amount: Decimal;
  currency: string;
  transaction_date: IsoDate;
  reference_number: string;
  description: string;
}

/* ------------------------------------------------------------------ */
/* core app — /api/health/, /api/auth/...                              */
/* ------------------------------------------------------------------ */

/** `/api/health/` — `{"status": "ok"}`. */
export interface HealthStatus {
  status: string;
}

/** The `user` object inside `/api/auth/me/`. */
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
}

/** `/api/auth/me/` — returns `401 {"authenticated": false}` when signed out. */
export interface AuthState {
  authenticated: boolean;
  user?: AuthUser;
}

/** Locally held OIDC session descriptor. */
export interface Session {
  user: AuthUser | null;
  isAuthenticated: boolean;
}
