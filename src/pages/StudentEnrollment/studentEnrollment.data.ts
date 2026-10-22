
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import api from "../../api/axios";

import type {
  CampusRecord,
  EnrollmentSummary,
} from "./studentEnrollment.types";

export interface EnrollmentCampus {
  campus: string;
  campus_display: string;
  boys: number;
  girls: number;
  total: number;
}

export interface EnrollmentStage {
  stage: string;
  label: string;
  count: number;
  rate: number | null;
}

export interface EnrollmentDashboard {
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
  campuses: EnrollmentCampus[];
  schools: {
    id: number;
    name: string;
    campus: string;
    enrolled: number;
    capacity: number;
    minimum_enrolment: number;
    below_minimum: boolean;
  }[];
  pipeline: EnrollmentStage[];
}

const ENROLLMENT_ENDPOINT = "/academics/enrollment/dashboard/";

export async function fetchEnrollmentDashboard(
  campus = "",
  signal?: AbortSignal,
): Promise<EnrollmentDashboard> {
  const response = await api.get<EnrollmentDashboard>(
    ENROLLMENT_ENDPOINT,
    {
      params: campus ? { campus } : {},
      signal,
    },
  );

  return response.data;
}

const POLL_MS = 30_000;

export function useEnrollmentDashboard(campus: string) {
  const live = {
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  } as const;

  const all = useQuery({
    queryKey: ["enrollment-dashboard", ""],
    queryFn: ({ signal }) => fetchEnrollmentDashboard("", signal),
    ...live,
  });

  const one = useQuery({
    queryKey: ["enrollment-dashboard", campus],
    queryFn: ({ signal }) => fetchEnrollmentDashboard(campus, signal),
    enabled: campus !== "",
    ...live,
  });

  const campusOptions = useMemo(
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

export const allCampusesLabel = "All Campuses";

export const formatNumber = (value: number) =>
  value.toLocaleString("en-US");

export const formatPercent = (value: number | null | undefined) =>
  value == null ? "—" : `${value.toFixed(1)}%`;

const AXIS_STEPS = [10, 20, 50, 100, 200, 400, 500, 1000, 2000];

export function axisFor(peak: number) {
  const step =
    AXIS_STEPS.find((candidate) => Math.ceil(peak / candidate) <= 4) ?? 2000;

  const top = Math.max(1, Math.ceil(peak / step)) * step;
  const ticks: number[] = [];

  for (let value = 0; value <= top; value += step) {
    ticks.push(value);
  }

  return { top, step, ticks };
}

export function funnelWidths(pipeline: EnrollmentStage[]): number[] {
  const first = pipeline[0]?.count || 0;
  let previous = 100;

  return pipeline.map((stage, index) => {
    if (index === 0) return 100;

    const natural = first ? (stage.count / first) * 100 : 0;
    previous = Math.min(previous, Math.max(natural, 28));

    return previous;
  });
}

export function toSummary(
  apiData: EnrollmentDashboard,
  scopeLabel: string | null,
): EnrollmentSummary {
  const records: CampusRecord[] = apiData.campuses.map((campus) => ({
    id: campus.campus,
    name: campus.campus_display,
    boys: campus.boys,
    girls: campus.girls,
    capacity: 0,
    admissionsConversion: 0,
    tiers: {
      nursery: 0,
      primary: 0,
      olevel: 0,
      alevel: 0,
    },
  }));

  const total = apiData.summary.total_active_enrolment;
  const { boys, girls, boys_pct, girls_pct } = apiData.gender;

  return {
    records,
    isAll: scopeLabel === null,
    total,
    boys,
    girls,
    boysShare: boys_pct ?? 0,
    girlsShare: girls_pct ?? 0,
    conversion: apiData.summary.admissions_conversion ?? 0,
    utilization: apiData.summary.capacity_utilisation ?? 0,
    tiers: [],
    scopeText:
      scopeLabel === null
        ? `Aggregate ${formatNumber(total)} students`
        : `${scopeLabel} ${formatNumber(total)} students`,
  };
}
