import api from "../../api/axios";

/* ---------- Workforce dashboard ---------- */

export interface HrWorkforceUnit {
  id: number;
  name: string;
  staff_category: string;
  staff_category_display: string;
  campus: string;
  location: string;
  headcount: number;
  full_time?: number;
  part_time?: number;
  attendance_rate: number | null;
  on_leave?: number;
  absences: Record<string, number>;
}

export interface HrWorkforceSummary {
  total_staff: number;
  teaching_staff: number;
  non_teaching_staff: number;
  students?: number;
  staffing_ratio: number | null;
  staffing_ratio_display: string | null;
  workforce_attendance_rate: number | null;
}

export interface HrWorkforceDashboard {
  start: string;
  end: string;
  summary: HrWorkforceSummary;
  units: HrWorkforceUnit[];
}

export interface HrWorkforceFilters {
  campus?: string;
  start?: string;
  end?: string;
}

export async function getHrWorkforceDashboard(
  filters: HrWorkforceFilters = {},
): Promise<HrWorkforceDashboard> {
  const params = {
    ...(filters.campus ? { campus: filters.campus } : {}),
    ...(filters.start ? { start: filters.start } : {}),
    ...(filters.end ? { end: filters.end } : {}),
  };

  const response = await api.get<HrWorkforceDashboard>(
    "/operations/hr/dashboard/",
    { params },
  );

  return response.data;
}

/* ---------- Establishment ---------- */

export interface HrEstablishmentDepartment {
  id: number;
  department: string;
  staff_category: string;
  staff_category_display: string;
  filled_positions: number;
  approved_posts: number | null;
  vacant_positions: number | null;
  over_establishment: number | null;
}

export interface HrEstablishmentSummary {
  approved_posts: number | null;
  filled_positions: number;
  vacant_positions: number | null;
  vacancy_rate: number | null;
  departments_without_approved_posts: number;
}

export interface HrEstablishmentResponse {
  date: string;
  summary: HrEstablishmentSummary;
  departments: HrEstablishmentDepartment[];
}

export async function getHrEstablishment(): Promise<HrEstablishmentResponse> {
  const response = await api.get<HrEstablishmentResponse>(
    "/operations/hr/establishment/",
  );

  return response.data;
}

/* ---------- Exits and turnover ---------- */

export interface HrExitSummary {
  staff_exits: number;
  voluntary_exits: number;
  average_headcount: number;
  turnover_rate: number;
  voluntary_rate: number;
}

export interface HrExitRecord {
  id?: number;
  staff_number?: string;
  full_name?: string;
  campus?: string;
  job_title?: string;
  employment_type?: string;
  hire_date?: string | null;
  exit_date?: string | null;
  exit_reason?: string | null;
  exit_reason_display?: string | null;
  exit_reason_source?: string | null;
  unit_name?: string;
  is_active?: boolean;
}

export interface HrExitBreakdown {
  departments?: Array<Record<string, unknown>>;
  by_reason?: Array<Record<string, unknown>>;
  by_campus?: Array<Record<string, unknown>>;
  by_month?: Array<Record<string, unknown>>;
  completeness?: {
    with_reason: number;
    without_reason: number;
    leavers_without_exit_date: number;
  };
}

export interface HrExitsResponse {
  start: string;
  end: string;
  total_exits: number;
  summary: HrExitSummary;
  departments?: HrExitBreakdown["departments"];
  by_reason?: HrExitBreakdown["by_reason"];
  by_campus?: HrExitBreakdown["by_campus"];
  by_month?: HrExitBreakdown["by_month"];
  completeness?: HrExitBreakdown["completeness"];
}

export async function getHrExits(): Promise<HrExitsResponse> {
  const response = await api.get<HrExitsResponse>("/operations/hr/exits/");

  return response.data;
}

/* ---------- Existing employee records ---------- */

export interface HrEmployee {
  id: number;
  unit_name?: string;
  exit_reason_display?: string;
  staff_number?: string;
  full_name: string;
  campus?: string;
  job_title?: string;
  employment_type?: string;
  hire_date?: string | null;
  is_active?: boolean;
  exit_date?: string | null;
  exit_reason?: string | null;
  exit_reason_source?: string | null;
  unit?: number | null;
  school?: number | null;
}

export interface HrEmployeesResponse {
  results?: HrEmployee[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export async function getHrEmployees(search?: string): Promise<HrEmployee[]> {
  const response = await api.get<HrEmployee[] | HrEmployeesResponse>(
    "/operations/hr/employees/",
    {
      params: search ? { search } : {},
    },
  );

  const data = response.data;

  return Array.isArray(data) ? data : (data.results ?? []);
}
