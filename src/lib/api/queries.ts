/**
 * React Query bindings for the backend.
 *
 * `main.tsx` already mounts a `QueryClientProvider`, so these hooks are the
 * intended way for page components to read live data. Nothing is imported by a
 * page yet — pages still render `*.data.ts` sample data — so migrating a page
 * is a matter of swapping its sample constants for one of these hooks and
 * handling `isPending` / `error`.
 */
import {
  useQuery,
  useQueryClient,
  type QueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

import { academicsApi, type AcademicsResource } from "./academics";
import { financeApi, type FinanceResource } from "./finance";
import { procurementApi, type ProcurementResource } from "./procurement";
import { fetchCurrentUser, fetchHealth } from "./core";
import type { RequestOptions, QueryParams } from "./resources";
import type { AuthUser, HealthStatus } from "./types";

export type ApiGroup = "academics" | "finance" | "procurement" | "core";

/** Cache key factory. Params are part of the key so filtered lists cache apart. */
export const apiKeys = {
  all: ["api"] as const,
  health: () => [...apiKeys.all, "core", "health"] as const,
  session: () => [...apiKeys.all, "core", "session"] as const,
  resource: (group: ApiGroup, resource: string, params?: QueryParams) =>
    [...apiKeys.all, group, resource, params ?? null] as const,
};

/** Load a list of rows through React Query (cancellable on unmount/key change). */
function useListQuery<TRow>(
  queryKey: readonly unknown[],
  load: (options: RequestOptions) => Promise<TRow[]>,
  refetchInterval?: number,
): UseQueryResult<TRow[]> {
  return useQuery<TRow[]>({
    queryKey,
    queryFn: ({ signal }) => load({ signal }),
    refetchInterval,
  });
}

/* ------------------------------------------------------------------ */
/* core                                                                */
/* ------------------------------------------------------------------ */

/** `/api/health/` — use this as the "is the backend reachable?" probe. */
export function useHealth(): UseQueryResult<HealthStatus> {
  return useQuery<HealthStatus>({
    queryKey: apiKeys.health(),
    queryFn: ({ signal }) => fetchHealth({ signal }),
    staleTime: 60_000,
  });
}

/** `/api/auth/me/` — resolves to `null` when signed out rather than erroring. */
export function useSession(): UseQueryResult<AuthUser | null> {
  return useQuery<AuthUser | null>({
    queryKey: apiKeys.session(),
    queryFn: ({ signal }) => fetchCurrentUser({ signal }),
    staleTime: 5 * 60_000,
  });
}

/* ------------------------------------------------------------------ */
/* academics                                                           */
/* ------------------------------------------------------------------ */

export function useStudents(params?: QueryParams) {
  return useListQuery(apiKeys.resource("academics", "students", params), (o) =>
    academicsApi.students.list(params, o),
  );
}

export function useAcademicRecords(params?: QueryParams) {
  return useListQuery(
    apiKeys.resource("academics", "academicRecords", params),
    (o) => academicsApi.academicRecords.list(params, o),
  );
}

export function useSections(params?: QueryParams) {
  return useListQuery(apiKeys.resource("academics", "sections", params), (o) =>
    academicsApi.sections.list(params, o),
  );
}

export function useGradeResults(params?: QueryParams) {
  return useListQuery(
    apiKeys.resource("academics", "gradeResults", params),
    (o) => academicsApi.gradeResults.list(params, o),
  );
}

export function useHomework(params?: QueryParams) {
  return useListQuery(apiKeys.resource("academics", "homework", params), (o) =>
    academicsApi.homework.list(params, o),
  );
}

export function useAttendance(params?: QueryParams) {
  return useListQuery(
    apiKeys.resource("academics", "attendance", params),
    (o) => academicsApi.attendance.list(params, o),
  );
}

export function useCurricular(params?: QueryParams) {
  return useListQuery(
    apiKeys.resource("academics", "curricular", params),
    (o) => academicsApi.curricular.list(params, o),
  );
}

export function useEvents(params?: QueryParams) {
  return useListQuery(apiKeys.resource("academics", "events", params), (o) =>
    academicsApi.events.list(params, o),
  );
}

export function useStaff(params?: QueryParams) {
  return useListQuery(apiKeys.resource("academics", "staff", params), (o) =>
    academicsApi.staff.list(params, o),
  );
}

/* ------------------------------------------------------------------ */
/* finance                                                             */
/* ------------------------------------------------------------------ */

export function useCreditors(params?: QueryParams) {
  return useListQuery(apiKeys.resource("finance", "creditors", params), (o) =>
    financeApi.creditors.list(params, o),
  );
}

export function useDepartments(params?: QueryParams) {
  return useListQuery(apiKeys.resource("finance", "departments", params), (o) =>
    financeApi.departments.list(params, o),
  );
}

export function useDepartmentBudgets(params?: QueryParams) {
  return useListQuery(
    apiKeys.resource("finance", "departmentBudgets", params),
    (o) => financeApi.departmentBudgets.list(params, o),
  );
}

export function useFiscalYears(params?: QueryParams) {
  return useListQuery(apiKeys.resource("finance", "fiscalYears", params), (o) =>
    financeApi.fiscalYears.list(params, o),
  );
}

export function useLiabilities(params?: QueryParams) {
  return useListQuery(apiKeys.resource("finance", "liabilities", params), (o) =>
    financeApi.liabilities.list(params, o),
  );
}

export function useMonthlyRevenueTargets(params?: QueryParams) {
  return useListQuery(
    apiKeys.resource("finance", "monthlyRevenueTargets", params),
    (o) => financeApi.monthlyRevenueTargets.list(params, o),
  );
}

export function useRevenueRecords(params?: QueryParams) {
  return useListQuery(
    apiKeys.resource("finance", "revenueRecords", params),
    (o) => financeApi.revenueRecords.list(params, o),
  );
}

/* ------------------------------------------------------------------ */
/* procurement                                                         */
/* ------------------------------------------------------------------ */

export function useVendors(params?: QueryParams) {
  return useListQuery(apiKeys.resource("procurement", "vendors", params), (o) =>
    procurementApi.vendors.list(params, o),
    30_000,
  );
}

export function useProcurementTransactions(params?: QueryParams) {
  return useListQuery(
    apiKeys.resource("procurement", "procurementTransactions", params),
    (o) => procurementApi.procurementTransactions.list(params, o),
    30_000,
  );
}

/* ------------------------------------------------------------------ */
/* cache helpers                                                       */
/* ------------------------------------------------------------------ */

/** Drop every cached list for one app, e.g. after a write. */
export function invalidateApiGroup(
  client: QueryClient,
  group: ApiGroup,
): Promise<void> {
  return client.invalidateQueries({ queryKey: [...apiKeys.all, group] });
}

/** Invalidate everything the API layer cached. */
export function invalidateAllApi(client: QueryClient): Promise<void> {
  return client.invalidateQueries({ queryKey: apiKeys.all });
}

/** Convenience wrapper so components do not need to import `useQueryClient`. */
export function useApiCache() {
  const client = useQueryClient();

  return {
    client,
    invalidateAll: () => invalidateAllApi(client),
    invalidateGroup: (group: ApiGroup) => invalidateApiGroup(client, group),
  };
}

export type { AcademicsResource, FinanceResource, ProcurementResource };
