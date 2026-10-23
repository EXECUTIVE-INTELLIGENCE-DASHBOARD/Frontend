/**
 * Enrollment endpoint wrapper.
 *
 * Follows the same layering as `studentRetention.api.ts`: the shared axios
 * instance lives in `src/api/axios.ts`, the typed endpoints in
 * `src/api/academics.api.ts`, and each page only re-exports what it needs.
 *
 * Not wired to the dashboard yet — the page still renders the seeded dataset
 * in `admissionsEnrollment.data.ts`. Hook it up via
 * `useEnrollmentDashboard()` when the backend shape covers the drill-down.
 */
import {
  academicsApi,
  type AcademicDashboardFilters,
  type EnrollmentCampusData,
  type EnrollmentDashboardData,
  type EnrollmentSchoolData,
  type EnrollmentStageData,
} from "../../api/academics.api";

export type {
  AcademicDashboardFilters,
  EnrollmentCampusData,
  EnrollmentDashboardData,
  EnrollmentSchoolData,
  EnrollmentStageData,
};

export async function fetchEnrollmentDashboard(
  filters: AcademicDashboardFilters = {},
  signal?: AbortSignal,
): Promise<EnrollmentDashboardData> {
  const data = await academicsApi.getEnrollmentDashboard(filters, signal);

  return data;
}
