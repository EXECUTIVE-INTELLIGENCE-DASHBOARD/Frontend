import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import api from "../../api/axios";
import type { AcademicFilterValues } from "../filters/academicFilters.types";

interface DashboardParams {
  school?: number;
  campus?: string;
  level?: string;
  term?: number;
  year?: string;
}

interface PerformanceDashboard {
  term?: {
    id?: number;
    number?: number;
    label?: string;
  };
  compared_with?: {
    id?: number;
    label?: string;
  } | null;
  summary?: {
    syllabus_coverage: number | null;
    topics_covered: number;
    topics_planned: number;
    student_performance: number | null;
    students_passing: number;
    students_assessed: number;
    average_mark: number | null;
    average_grade: string | null;
  };
  grade_distribution?: {
    level: string;
    level_display: string;
    students: number;
    grades: {
      grade: string;
      students: number;
      share: number | null;
    }[];
  }[];
  classes?: {
    class_level?: string;
    class_level_display?: string;
    level?: string;
    level_display?: string;
    test_1_average?: number | string | null;
    test_2_average?: number | string | null;
  }[];
  by_class?: {
    class_level?: string;
    class_level_display?: string;
    level?: string;
    level_display?: string;
    test_1_average?: number | string | null;
    test_2_average?: number | string | null;
  }[];
  subjects?: {
    id?: number;
    subject?: string;
    name?: string;
    code?: string;
    level?: string;
    level_display?: string;
    category?: string;
    average_mark?: number | string | null;
    pass_rate?: number | string | null;
    previous_pass_rate?: number | string | null;
    previous_average_mark?: number | string | null;
    results?: unknown[];
  }[];
  [key: string]: unknown;
}

const REFRESH_INTERVAL = 30_000;

export function buildAcademicDashboardParams(
  filters: AcademicFilterValues,
): DashboardParams {
  const params: DashboardParams = {};
  const school = filters.school.trim();
  const campus = filters.campus.trim();
  const section = filters.section.trim().toLowerCase();
  const term = filters.term.trim();
  const year = filters.year.trim();

  if (
    school &&
    school !== "All Schools" &&
    /^\d+$/.test(school) &&
    Number(school) > 0
  ) {
    params.school = Number(school);
  }

  if (campus && campus !== "All Campuses") {
    params.campus = campus;
  }

  if (section && section !== "all" && section !== "all sections") {
    params.level = section;
  }

  if (term && /^\d+$/.test(term) && Number(term) > 0) {
    params.term = Number(term);
  }

  if (year && /^\d{4}$/.test(year)) {
    params.year = year;
  }

  return params;
}

export function useAcademicPerformanceDashboard(
  filters: AcademicFilterValues,
  enabled = true,
) {
  const { school, campus, section, term, year } = filters;
  const params = useMemo(
    () => buildAcademicDashboardParams(filters),
    [school, campus, section, term, year],
  );

  return useQuery({
    queryKey: ["academic-performance-dashboard", params],
    queryFn: async ({ signal }): Promise<PerformanceDashboard> => {
      const response = await api.get<PerformanceDashboard>(
        "/academics/performance/dashboard/",
        { params, signal },
      );

      return response.data;
    },
    refetchInterval: REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
    retry: false,
    enabled,
  });
}
