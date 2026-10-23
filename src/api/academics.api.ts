
import api from "./axios";

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

export interface AcademicDashboardFilters {
  campus?: string;
  school?: number;
  term?: number;
}

export const academicsApi = {
  getRetentionDashboard: async (
    filters: AcademicDashboardFilters = {},
  ): Promise<RetentionDashboardData> => {
    const response = await api.get<RetentionDashboardData>(
      "/academics/retention/dashboard/",
      { params: filters },
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
};
