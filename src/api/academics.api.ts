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
  club?: string | null;
  category: string;
  category_display: string;
  school: string;
  girls: number;
  boys: number;
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
  total_clubs: number;
  events_held: number;
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
