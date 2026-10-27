/**
 * Enrollment endpoint wrapper + live-data hook.
 *
 * Follows the same layering as `studentRetention.api.ts`: the shared axios
 * instance lives in `src/api/axios.ts`, the typed endpoints in
 * `src/api/academics.api.ts`, and each page only re-exports what it needs.
 */
import { useEffect, useState } from "react";

import {
  academicsApi,
  type AcademicDashboardFilters,
  type EnrollmentCampusData,
  type EnrollmentDashboardData,
  type EnrollmentSchoolData,
  type EnrollmentStageData,
} from "../../api/academics.api";
import type {
  Aggregate,
  SchoolSelection,
} from "./admissionsEnrollment.types";

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

/** `/academics/schools/` primary keys — verified against the live API. */
const backendSchoolIds: Record<string, number> = {
  "kibuli-nursery": 7,
  "kibuli-primary": 8,
  "kibuli-secondary": 9,
  "buwaate-nursery": 10,
  "buwaate-primary": 11,
  "kansanga-gis": 12,
};

// Accepts the unfiltered "all" selection too: it simply has no backend id.
export const backendSchoolIdFor = (
  schoolId: SchoolSelection,
): number | undefined => backendSchoolIds[schoolId];

export interface EnrollmentDashboardState {
  data: EnrollmentDashboardData | null;
  error: string | null;
  isPending: boolean;
}

export function useEnrollmentDashboard(
  filters: AcademicDashboardFilters = {},
): EnrollmentDashboardState {
  const { campus, school, term } = filters;

  const [state, setState] = useState<EnrollmentDashboardState>({
    data: null,
    error: null,
    isPending: true,
  });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setState((current) => ({ ...current, isPending: true, error: null }));

    fetchEnrollmentDashboard({ campus, school, term }, controller.signal)
      .then((data) => {
        if (active) {
          setState({ data, error: null, isPending: false });
        }
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) {
          return;
        }

        setState({
          data: null,
          error: error instanceof Error ? error.message : "Unknown error",
          isPending: false,
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [campus, school, term]);

  return state;
}

/**
 * Backend fields that exist -> `Aggregate`. Anything the dashboard endpoint
 * does not expose stays at zero / empty instead of showing seeded numbers.
 */
export function aggregateFromDashboard(
  data: EnrollmentDashboardData,
): Aggregate {
  const stage = (id: string) =>
    data.pipeline.find((entry) => entry.stage === id)?.count ?? 0;

  const accepted = stage("accepted");
  const learners = data.summary.total_active_enrolment;

  return {
    learners,
    boys: data.gender.boys,
    girls: data.gender.girls,

    day: 0,
    boarding: 0,
    capacity: data.summary.capacity,
    opening: 0,
    newLearners: data.summary.new_students ?? 0,
    continuing: data.summary.continuing_students ?? 0,
    withdrawn: 0,

    applicants: stage("applied"),
    shortlisted: stage("qualified"),
    interviewed: stage("interviewed"),
    accepted,
    reported: stage("enrolled"),

    retentionRate: 0,
    withdrawalRate: 0,
    utilization: data.summary.capacity_utilisation ?? 0,
    conversionRate: data.summary.admissions_conversion ?? 0,
    noShowRate: 0,

    byAge: [],
    byNationality: [],
    byReligion: [],
  };
}