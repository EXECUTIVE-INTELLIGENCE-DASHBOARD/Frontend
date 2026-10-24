
import {
  academicsApi,
  type RetentionDashboardData,
  type AcademicDashboardFilters,
} from "../../api/academics.api";

export type {
  RetentionDashboardData,
  AcademicDashboardFilters,
};

/**
 * The retention dashboard rejects the dashboard's own campus slugs — asking for
 * `?campus=kibuli` answers
 * `{"campus":["\"kibuli\" is not a valid choice."]}` because the backend wants
 * the full labels ("Greenhill Academy kibuli", …). Campus selection is applied
 * locally to `by_nationality` instead, which already carries a campus per row,
 * so the filter stays instant and never trips a 400.
 */
export async function fetchStudentRetention(
  filters: AcademicDashboardFilters = {},
  signal?: AbortSignal,
): Promise<RetentionDashboardData> {
  return academicsApi.getRetentionDashboard(filters, signal);
}

