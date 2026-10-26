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
/* ---------- Employee records ---------- */

export interface HrEmployee {
  id: number;
  staff_number: string;
  full_name: string;
  unit: number;
  unit_name: string;
  job_title: string;
  employment_type: string;
  hire_date: string | null;
  is_active: boolean;
}

export interface HrEmployeeFilters {
  campus?: string;
  unit?: number;
  is_active?: boolean;
}

export async function getHrEmployees(
  filters: HrEmployeeFilters = {},
): Promise<HrEmployee[]> {
  const response = await api.get<HrEmployee[] | { results?: HrEmployee[] }>(
    "/operations/hr/employees/",
    {
      params: filters,
    },
  );

  const data = response.data;

  return Array.isArray(data) ? data : (data.results ?? []);
}
