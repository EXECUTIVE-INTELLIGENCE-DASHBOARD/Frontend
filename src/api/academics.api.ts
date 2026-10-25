
import api from "./axios";

// Retention dashboard types

export interface RetentionSummary {
  eligible_to_return: number;
  total_re_enrolled: number;
  re_enrolment_rate: number | null;
  at_risk: number;
}

export interface NationalityRetention {
  nationality: string;
  campus: string;
  campus_display: string;
  eligible: number;
  re_enrolled: number;
  retention_rate: number | null;
}

export interface WithdrawalReason {
  reason: string;
  label: string;
  count: number;
  share: number | null;
}

export interface RetentionDashboardData {
  term: { id: number; label: string };
  academic_year: string;
  compared_with: { id: number; label: string } | null;
  summary: RetentionSummary;
  by_nationality: NationalityRetention[];
  withdrawals_total: number;
  withdrawal_reasons: WithdrawalReason[];
}

// Enrollment dashboard types

export interface EnrollmentStageData {
  stage: string;
  label: string;
  count: number;
  rate: number | null;
}

export interface EnrollmentCampusData {
  campus: string;
  campus_display: string;
  boys: number;
  girls: number;
  total: number;
}

export interface EnrollmentSchoolData {
  id: number;
  name: string;
  campus: string;
  enrolled: number;
  capacity: number;
  minimum_enrolment: number;
  below_minimum: boolean;
}

export interface EnrollmentDashboardData {
  term: { id: number; label: string } | null;
  summary: {
    total_active_enrolment: number;
    admissions_conversion: number | null;
    capacity: number;
    capacity_utilisation: number | null;
  };
  gender: {
    boys: number;
    girls: number;
    boys_pct: number | null;
    girls_pct: number | null;
  };
  campuses: EnrollmentCampusData[];
  schools: EnrollmentSchoolData[];
  pipeline: EnrollmentStageData[];
}

// Shared academic dashboard filters

export interface AcademicDashboardFilters {
  campus?: string;
  school?: number;
  term?: number;
}

// Co-curricular dashboard types

export interface CoCurricularDashboardFilters
  extends AcademicDashboardFilters {
  category?: string;
  activity?: number;
  student?: number;
  level?: string;
  class_level?: string;
}

export interface CoCurricularTerm {
  id: number;
  label: string;
}

export interface CoCurricularActivityRow {
  id: number;
  name: string;
  category: string;
  category_display: string;
  school: string;
  participants: number;
}

export interface CoCurricularCategoryRow {
  category: string;
  label: string;
  participants: number;
  records: number;
}

export interface CoCurricularClassRow {
  class_level: string;
  stream: string;
  active_learners: number;
  participants: number;
  participation_rate: number | null;
}

export interface CoCurricularDashboardSummary {
  activities_offered: number;
  participation_records: number;
  unique_participants: number;
  active_learners: number;
  participation_rate: number | null;
  activities_per_participant: number | null;
}

export interface CoCurricularDashboardData {
  term: CoCurricularTerm | null;
  summary: CoCurricularDashboardSummary;
  activities: CoCurricularActivityRow[];
  by_category: CoCurricularCategoryRow[];
  by_class: CoCurricularClassRow[];
}

export interface CoCurricularOutcomesData {
  term: CoCurricularTerm | null;
  activities: Record<string, unknown>[];
  academic_comparison: Record<string, unknown> | null;
}

// Academic API methods

export const academicsApi = {
  getRetentionDashboard: async (
    filters: AcademicDashboardFilters = {},
    signal?: AbortSignal,
  ): Promise<RetentionDashboardData> => {
    const response = await api.get<RetentionDashboardData>(
      "/academics/retention/dashboard/",
      { params: filters, signal },
    );

    return response.data;
  },

  getEnrollmentDashboard: async (
    filters: AcademicDashboardFilters = {},
    signal?: AbortSignal,
  ): Promise<EnrollmentDashboardData> => {
    const response = await api.get<EnrollmentDashboardData>(
      "/academics/enrollment/dashboard/",
      { params: filters, signal },
    );

    return response.data;
  },

  getCoCurricularDashboard: async (
    filters: CoCurricularDashboardFilters = {},
    signal?: AbortSignal,
  ): Promise<CoCurricularDashboardData> => {
    const response = await api.get<CoCurricularDashboardData>(
      "/academics/co-curricular/dashboard/",
      { params: filters, signal },
    );

    return response.data;
  },

  getCoCurricularOutcomes: async (
    filters: CoCurricularDashboardFilters = {},
    signal?: AbortSignal,
  ): Promise<CoCurricularOutcomesData> => {
    const response = await api.get<CoCurricularOutcomesData>(
      "/academics/co-curricular/outcomes/",
      { params: filters, signal },
    );

    return response.data;
  },
};
