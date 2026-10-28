import type { AxiosResponse } from "axios";

import api from "../../api/axios";
import type {
  AcademicDashboardFilters,
  EnrollmentDashboardData,
} from "../../api/academics.api";
import type { CampusOption, SectionOption } from "../../components/filters/CampusFilter";
import type {
  AttendanceRecord,
  Paginated,
} from "../../lib/api/types";
import type { FinanceDashboard } from "../FinanceOverview/financeDashboard.api";
import type { IncidentDashboardData } from "../operations/incidentSecurity.types";

export interface EstablishmentSummary {
  approved_posts: number;
  filled_positions: number;
  vacant_positions: number;
  vacancy_rate: number | null;
  departments_without_approved_posts: number;
}

export interface EstablishmentDepartment {
  id: number;
  department: string;
  staff_category: string;
  staff_category_display: string;
  filled_positions: number;
  vacant_positions: number | null;
  approved_posts: number | null;
  over_establishment: number;
}

export interface EstablishmentDashboard {
  date: string;
  summary: EstablishmentSummary;
  departments: EstablishmentDepartment[];
}

export interface ExecutiveOverviewFilters {
  campus: CampusOption;
  section: SectionOption;
}

export interface OverviewBudgetRow {
  id: string;
  label: string;
  spent: number;
  budget: number;
}

export interface OverviewAdmissionStage {
  id: string;
  label: string;
  count: number;
}

export interface ExecutiveOverviewData {
  enrolment: EnrollmentDashboardData | null;
  attendance: AttendanceRecord[] | null;
  establishment: EstablishmentDashboard | null;
  finance: FinanceDashboard | null;
  incidents: IncidentDashboardData | null;
  errors: string[];
  notices: string[];
}

const campusCodes: Record<CampusOption, string | undefined> = {
  "All Campuses": undefined,
  "Kibuli Main Campus": "kibuli",
  "Buwaate Campus": "buwaate",
  "Annex / Preschool Branch": "gis",
};

const sectionCodes: Record<SectionOption, string | undefined> = {
  "All Sections": undefined,
  Nursery: "nursery",
  Primary: "primary",
  Secondary: "secondary",
  Preschool: "nursery",
};

const campusLabels: Record<string, string> = {
  kibuli: "Kibuli",
  buwaate: "Buwaate",
  gis: "GIS",
};

export function campusCodeFor(campus: CampusOption): string | undefined {
  return campusCodes[campus];
}

function listFromResponse<T>(data: T[] | Paginated<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

export function attendanceValue(value: string): number | null {
  const normalised = value.trim().toLowerCase();

  if (/^\d+(\.\d+)?%?$/.test(normalised)) {
    return Math.min(100, Math.max(0, Number.parseFloat(normalised)));
  }
  if (/^(n\/a|na|none|-+)$/.test(normalised)) return null;
  if (/^(p|present|y|yes|t|true)(?![a-z])/.test(normalised)) return 100;
  if (/^(a|absent|n|no|f|false)(?![a-z])/.test(normalised)) return 0;
  return null;
}

export function averageAttendance(records: AttendanceRecord[]): number | null {
  const values = records
    .map((record) => attendanceValue(record.student_attendance))
    .filter((value): value is number => value !== null);

  if (values.length === 0) return null;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function staffingHealth(
  establishment: EstablishmentDashboard | null,
): number | null {
  const { approved_posts, filled_positions } = establishment?.summary ?? {};

  if (
    approved_posts === undefined ||
    approved_posts <= 0 ||
    filled_positions === undefined
  ) {
    return null;
  }

  return Math.min(100, (filled_positions / approved_posts) * 100);
}

export function admissionStages(
  enrollment: EnrollmentDashboardData | null,
): { total: number; stages: OverviewAdmissionStage[] } | null {
  if (!enrollment) return null;

  const pipeline = enrollment.pipeline;

  return {
    total: pipeline[0]?.count ?? 0,
    stages: pipeline.map((stage, index) => ({
      id: stage.stage,
      label: stage.label,
      count: Math.max(0, stage.count - (pipeline[index + 1]?.count ?? 0)),
    })),
  };
}

export function budgetByCampus(
  finance: FinanceDashboard | null,
  campus?: string,
): OverviewBudgetRow[] {
  if (!finance) return [];

  const rows = new Map<string, OverviewBudgetRow>();
  for (const school of finance.schools) {
    if (campus && school.campus !== campus) continue;

    const row = rows.get(school.campus) ?? {
      id: school.campus,
      label: campusLabels[school.campus] ?? school.campus,
      spent: 0,
      budget: 0,
    };
    row.spent += school.budget.spent;
    row.budget += school.budget.budget;
    rows.set(school.campus, row);
  }

  if (!campus && (finance.group.budget.budget > 0 || finance.group.budget.spent > 0)) {
    rows.set("group", {
      id: "group",
      label: "Group",
      spent: finance.group.budget.spent,
      budget: finance.group.budget.budget,
    });
  }

  return Array.from(rows.values());
}

async function load<T>(
  source: string,
  request: Promise<AxiosResponse<T>>,
  signal: AbortSignal,
  errors: string[],
): Promise<T | null> {
  try {
    return (await request).data;
  } catch (error) {
    if (!signal.aborted) {
      console.error(`Executive overview ${source} request failed:`, error);
      errors.push(`Could not load ${source} data.`);
    }

    return null;
  }
}

export async function getExecutiveOverviewData(
  filters: ExecutiveOverviewFilters,
  signal: AbortSignal,
): Promise<ExecutiveOverviewData> {
  const campus = campusCodes[filters.campus];
  const level = sectionCodes[filters.section];
  const scopedParams: AcademicDashboardFilters & { level?: string } = {
    ...(campus ? { campus } : {}),
    ...(level ? { level } : {}),
  };
  const today = new Date();
  const end = formatDate(today);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);
  const start = formatDate(startDate);
  const errors: string[] = [];

  const [enrolment, attendanceRecords, establishment, finance, incidents] =
    await Promise.all([
      load(
        "enrolment",
        api.get<EnrollmentDashboardData>("/academics/enrollment/dashboard/", {
          params: scopedParams,
          signal,
        }),
        signal,
        errors,
      ),
      campus || level
        ? Promise.resolve(null)
        : load(
            "attendance",
            api.get<AttendanceRecord[] | Paginated<AttendanceRecord>>(
              "/academics/attendance/",
              { signal },
            ),
            signal,
            errors,
          ),
      load(
        "establishment",
        api.get<EstablishmentDashboard>("/operations/hr/establishment/", {
          params: scopedParams,
          signal,
        }),
        signal,
        errors,
      ),
      load(
        "finance",
        api.get<FinanceDashboard>("/finance/dashboard/", { signal }),
        signal,
        errors,
      ),
      load(
        "incidents",
        api.get<IncidentDashboardData>("/operations/incidents/dashboard/", {
          params: { ...scopedParams, start, end },
          signal,
        }),
        signal,
        errors,
      ),
    ]);

  return {
    enrolment,
    attendance:
      attendanceRecords === null ? null : listFromResponse(attendanceRecords),
    establishment,
    finance,
    incidents,
    errors,
    notices: [
      ...(campus || level
        ? ["Attendance records cannot be filtered by campus or section; the attendance metric is hidden for this selection."]
        : []),
      ...(level
        ? ["The budget endpoint has no section filter; the budget graph is hidden for this selection."]
        : []),
    ],
  };
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
