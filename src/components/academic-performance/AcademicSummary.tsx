import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, BookOpenCheck, UsersRound } from "lucide-react";

import type { AcademicFilterValues } from "../filters/academicFilters.types";
import api from "../../api/axios";

import "./AcademicSummary.css";

interface AcademicSummaryProps {
  filters: AcademicFilterValues;
}

interface DashboardSummary {
  syllabus_coverage: number | null;
  topics_covered: number;
  topics_planned: number;
  student_performance: number | null;
  students_passing: number;
  students_assessed: number;
  average_mark: number | null;
  average_grade: string | null;
}

interface DashboardTerm {
  id: number;
  label: string;
}

interface PerformanceDashboard {
  term: DashboardTerm | null;
  compared_with: DashboardTerm | null;
  summary: DashboardSummary;
}

type DashboardParams = Record<string, string | number>;

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

function buildDashboardParams(filters: AcademicFilterValues): DashboardParams {
  const params: DashboardParams = {};

  const school = filters.school.trim();
  const campus = filters.campus.trim();
  const section = filters.section.trim().toLowerCase();
  const term = filters.term.trim();

  // School must be a valid database ID.
  if (school && /^\d+$/.test(school) && Number(school) > 0) {
    params.school = Number(school);
  }

  // Campus must use the backend's actual campus choice value.
  if (campus) {
    params.campus = campus;
  }

  // The backend dashboard accepts the section through "level".
  // Keep the frontend's existing section values.
  if (section) {
    params.level = section;
  }

  // The backend expects a database term ID, not the academic year.
  if (term && /^\d+$/.test(term) && Number(term) > 0) {
    params.term = Number(term);
  }

  return params;
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
  const { school, campus, section, term } = filters;

  const params = useMemo(
    () => buildDashboardParams(filters),
    [school, campus, section, term],
  );

  const dashboardQuery = useQuery({
    queryKey: ["academic-performance-dashboard", params],
    queryFn: async ({ signal }): Promise<PerformanceDashboard> => {
      const response = await api.get<PerformanceDashboard>(
        "/academics/performance/dashboard/",
        {
          params,
          signal,
        },
      );

      return response.data;
    },
    refetchInterval: REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
    retry: false,
  });

  const summary = dashboardQuery.data?.summary;

  const metrics = [
    {
      id: "syllabus",
      title: "Syllabus Coverage",
      icon: BookOpenCheck,
      value: formatPercentage(summary?.syllabus_coverage),
      detail: summary
        ? `${formatNumber(summary.topics_covered)} of ${formatNumber(summary.topics_planned)} topics covered`
        : "Syllabus coverage for the selected filters",
    },
    {
      id: "performance",
      title: "Student Performance",
      icon: UsersRound,
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
