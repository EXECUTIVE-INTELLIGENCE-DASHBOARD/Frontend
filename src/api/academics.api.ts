
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

export interface EnrollmentDashboardData {
  [key: string]: unknown;
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
  ): Promise<EnrollmentDashboardData> => {
    const response = await api.get<EnrollmentDashboardData>(
      "/academics/enrollment/dashboard/",
      { params: filters },
    );

    return response.data;
  },
};
