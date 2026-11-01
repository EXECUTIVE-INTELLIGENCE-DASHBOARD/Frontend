import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, ClipboardList, GraduationCap } from "lucide-react";

import type { AcademicFilterValues } from "../filters/academicFilters.types";
import {
  buildAcademicDashboardParams,
  useAcademicPerformanceDashboard,
} from "./useAcademicPerformanceDashboard";
import api from "../../api/axios";

import "./AcademicSummary.css";

interface AcademicSummaryProps {
  filters: AcademicFilterValues;
}

interface Assessment {
  id: number;
  kind: string;
  term: number;
  school: number;
  class_level: string;
}

const REFRESH_INTERVAL = 30_000;

function formatPercentage(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value)
    ? `${value.toFixed(1)}%`
    : "—";
}

function formatNumber(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString("en-US", {
        maximumFractionDigits: 1,
      })
    : "—";
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: { status?: number; data?: unknown };
      }
    ).response;

    if (response?.status === 404) {
      return "No academic data or term was found for these filters.";
    }

    if (response?.status === 400) {
      return "The selected filters were not accepted by the backend. Check the campus, section, and term values.";
    }

    if (response?.status) {
      return `Unable to load academic performance (HTTP ${response.status}).`;
    }
  }

  return "Unable to load academic performance. Check your connection and try again.";
}

export function AcademicSummary({ filters }: AcademicSummaryProps) {
  const params = useMemo(
    () => buildAcademicDashboardParams(filters),
    [filters.school, filters.campus, filters.section, filters.term, filters.year],
  );
  const assessmentParams = useMemo(() => {
    const assessmentFilters = { ...params };
    delete assessmentFilters.year;
    return assessmentFilters;
  }, [params]);

  const dashboardQuery = useAcademicPerformanceDashboard(filters);
  const summary = dashboardQuery.data?.summary;
  const assessmentsQuery = useQuery({
    queryKey: ["academic-assessments", assessmentParams],
    queryFn: async ({ signal }): Promise<Assessment[]> => {
      const response = await api.get<Assessment[]>("/academics/assessments/", {
        params: assessmentParams,
        signal,
      });

      return response.data;
    },
    refetchInterval: REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
    retry: false,
  });
  const metrics = [
    {
      id: "assessments",
      title: "Assessments Recorded",
      icon: ClipboardList,
      value: assessmentsQuery.isPending
        ? "Loading..."
        : assessmentsQuery.isError
          ? "—"
          : formatNumber(assessmentsQuery.data?.length ?? 0),
    },
    {
      id: "performance",
      title: "Student Performance",
      icon: GraduationCap,
      value: formatPercentage(summary?.student_performance),
      detail: summary
        ? `${formatNumber(summary.students_passing)} of ${formatNumber(summary.students_assessed)} students passing`
        : "Students meeting the passing mark",
    },
    {
      id: "average-grade",
      title: "Average Grade",
      icon: Award,
      value:
        summary?.average_grade != null
          ? summary.average_grade
          : formatNumber(summary?.average_mark),
      detail:
        summary?.average_grade != null
          ? `Average mark: ${formatNumber(summary.average_mark)}%`
          : "Average assessment mark (%)",
    },
  ];

  if (dashboardQuery.isPending) {
    return (
      <section
        className="acad-summary"
        aria-label="Academic performance summary"
        aria-busy="true"
      >
        {metrics.map(({ id, title }) => (
          <article className="acad-metric" key={id}>
            <div className="acad-metric__content">
              <span className="acad-metric__label">{title}</span>
              <h2 className="acad-metric__value">Loading...</h2>
              <span className="acad-metric__detail">
                Fetching live academic data
              </span>
            </div>
          </article>
        ))}
      </section>
    );
  }

  if (dashboardQuery.isError || !summary) {
    return (
      <section
        className="acad-summary"
        aria-label="Academic performance summary"
        aria-busy={dashboardQuery.isFetching}
      >
        <p role="alert">
          {dashboardQuery.isError
            ? getErrorMessage(dashboardQuery.error)
            : "The dashboard returned no summary data for these filters."}
        </p>

        <button
          type="button"
          onClick={() => void dashboardQuery.refetch()}
          disabled={dashboardQuery.isFetching}
        >
          {dashboardQuery.isFetching ? "Retrying..." : "Retry"}
        </button>
      </section>
    );
  }

  return (
    <section
      className="acad-summary"
      aria-label="Academic performance summary"
      aria-busy={dashboardQuery.isFetching}
    >
      {metrics.map(({ id, title, icon: Icon, value, detail }) => (
        <article className="acad-metric" key={id}>
          <span className="acad-metric__icon" aria-hidden="true">
            <Icon size={18} strokeWidth={1.7} />
          </span>

          <div className="acad-metric__content">
            <span className="acad-metric__label">{title}</span>
            <h2 className="acad-metric__value">{value}</h2>
            <span className="acad-metric__detail">{detail}</span>
          </div>
        </article>
      ))}
    </section>
  );
}
