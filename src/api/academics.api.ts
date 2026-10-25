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
export interface PerformanceDashboardFilters {
  campus?: string;
  school?: number;
  level?: string;
  term?: number;
  class_level?: string;
}

export interface PerformanceTerm {
  id: number;
  label: string;
}

export interface PerformanceSummary {
  syllabus_coverage: number | null;
  topics_covered: number;
  topics_planned: number;
  student_performance: number | null;
  students_passing: number;
  students_assessed: number;
  average_mark: number | null;
  average_grade: string | null;
}

export interface GradeCount {
  grade: string;
  students: number;
  share: number | null;
}

export interface GradeDistribution {
  level: string;
  level_display: string;
  students: number;
  grades: GradeCount[];
}

export interface NationalExamDivision {
  division: string;
  label: string;
  candidates: number;
}

export interface NationalExamSummary {
  exam: string;
  label: string;
  year: number;
  sat: number;
  passed: number;
  pass_rate: number | null;
  divisions: NationalExamDivision[];
}

export interface SubjectPerformance {
  id: number;
  subject: string;
  code: string;
  level: string;
  level_display: string;
  category: string;
  average_mark: number | null;
  pass_rate: number | null;
  previous_pass_rate: number | null;
  results: number;
}

export interface TestResult {
  id: number;
  subject: string;
  level: string;
  level_display: string;
  test_1_average: number | null;
  test_2_average: number | null;
  test_1_pass_rate: number | null;
  test_2_pass_rate: number | null;
  students_assessed: number;
}

export interface PerformanceDashboardData {
  term: PerformanceTerm;
  compared_with: PerformanceTerm | null;
  summary: PerformanceSummary;
  grade_distribution: GradeDistribution[];
  national_exams: NationalExamSummary[];
  subjects: SubjectPerformance[];
  tests: TestResult[];
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
  getPerformanceDashboard: async (
    filters: PerformanceDashboardFilters = {},
  ): Promise<PerformanceDashboardData> => {
    const response = await api.get<PerformanceDashboardData>(
      "/academics/performance/dashboard/",
      { params: filters },
    );

    return response.data;
  },
};
