
import {
  academicsApi,
  type RetentionDashboardData,
  type AcademicDashboardFilters,
} from "../../api/academics.api";

export type {
  RetentionDashboardData,
  AcademicDashboardFilters,
};

export async function fetchStudentRetention(
  filters: AcademicDashboardFilters = {},
): Promise<RetentionDashboardData> {
  return academicsApi.getRetentionDashboard(filters);
}
