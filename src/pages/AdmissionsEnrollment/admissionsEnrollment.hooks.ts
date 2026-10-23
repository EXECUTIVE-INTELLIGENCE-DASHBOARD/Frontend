/**
 * React Query bindings for the enrollment dashboard.
 *
 * Kept from the original Student Enrollment page so the live endpoint stays
 * connected while the Admissions & Enrolment surface is still seeded with
 * static data. Nothing imports this yet — it is the integration point.
 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchEnrollmentDashboard } from "./admissionsEnrollment.api";

/** Live figures refresh every 30 s, matching the other academic dashboards. */
const POLL_MS = 30_000;

export interface EnrollmentCampusOption {
  value: string;
  label: string;
}

/**
 * Reads the enrollment dashboard for one campus ("" means every campus).
 *
 * The unfiltered query always runs so the campus picker has options even when
 * a single campus is selected.
 */
export function useEnrollmentDashboard(campus = "") {
  const live = {
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  } as const;

  const all = useQuery({
    queryKey: ["enrollment-dashboard", ""],
    queryFn: ({ signal }) => fetchEnrollmentDashboard({}, signal),
    ...live,
  });

  const one = useQuery({
    queryKey: ["enrollment-dashboard", campus],
    queryFn: ({ signal }) => fetchEnrollmentDashboard({ campus }, signal),
    enabled: campus !== "",
    ...live,
  });

  const campusOptions = useMemo<EnrollmentCampusOption[]>(
    () =>
      (all.data?.campuses ?? []).map((record) => ({
        value: record.campus,
        label: record.campus_display,
      })),
    [all.data],
  );

  const active = campus ? one : all;

  return {
    data: active.data,
    campusOptions,
    isLoading: active.isLoading,
    error: active.error as Error | null,
    refetch: active.refetch,
  };
}
