import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import api from "../../api/axios";
import type { AcademicFilterValues } from "../filters/academicFilters.types";

import "./AcademicDetails.css";

interface AcademicDetailsProps {
  filters?: AcademicFilterValues;
}

interface DashboardSubject {
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
  results?: unknown[];
}

interface CompletionRecord {
  level?: string;
  level_display?: string;
  campus?: string;
  campus_display?: string;
  completed?: number | string;
  completed_students?: number | string;
  completion_rate?: number | string;
  completion_percentage?: number | string;
}

interface DashboardResponse {
  subjects?: DashboardSubject[];
  completion?: CompletionRecord[];
  student_completion?: CompletionRecord[];
  completion_rates?: CompletionRecord[];
  [key: string]: unknown;
}

interface SubjectRow {
  key: string;
  subject: string;
  level: string;
  averageMark: number | null;
  passRate: number | null;
  previousPassRate: number | null;
}

const REFRESH_INTERVAL = 30_000;

const DEFAULT_FILTERS: AcademicFilterValues = {
  school: "",
  campus: "",
  section: "",
  term: "",
  year: String(new Date().getFullYear()),
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (isObject(value) && Array.isArray(value.results)) {
    return value.results as T[];
  }

  return [];
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-UG");
}

function formatPercent(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(1)}%`;
}

function errorMessage(error: unknown): string {
  if (
    isObject(error) &&
    isObject(error.response) &&
    typeof error.response.status === "number"
  ) {
    return `Unable to load data (HTTP ${error.response.status}).`;
  }

  return "Unable to load data. Please try again.";
}

function normalizeLevel(value: string | undefined): string {
  const level = (value ?? "").trim().toLowerCase().replace(/[- ]/g, "_");

  if (["primary", "primary_level"].includes(level)) return "Primary";
  if (["o_level", "olevel", "ordinary_level"].includes(level)) return "O Level";
  if (["a_level", "alevel", "advanced_level"].includes(level)) return "A Level";
  if (level.includes("nursery")) return "Nursery";

  return value?.trim() || "Other";
}

function normalizeCategory(value: string | undefined): string {
  const category = (value ?? "").trim().toLowerCase();

  if (category === "science" || category === "sciences") return "Sciences";
  if (category === "arts" || category === "art") return "Arts";

  return "";
}

function getSubjectRows(subjects: DashboardSubject[]): SubjectRow[] {
  const grouped = new Map<
    string,
    {
      key: string;
      subject: string;
      level: string;
      markTotal: number;
      markCount: number;
      passTotal: number;
      passCount: number;
      previousTotal: number;
      previousCount: number;
    }
  >();

  for (const item of subjects) {
    const level = normalizeLevel(item.level_display || item.level);
    const category = normalizeCategory(item.category);

    // Primary subjects remain individual. Secondary subjects are grouped
    // into Sciences and Arts, using the backend's category field.
    let subjectName = item.subject || item.name || item.code || "Subject";

    if (level === "O Level" || level === "A Level") {
      subjectName = category || "Uncategorised";
    }

    const key = `${level}:${subjectName}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        subject: subjectName,
        level,
        markTotal: 0,
        markCount: 0,
        passTotal: 0,
        passCount: 0,
        previousTotal: 0,
        previousCount: 0,
      });
    }

    const row = grouped.get(key)!;
    const mark = toNumber(item.average_mark);
    const pass = toNumber(item.pass_rate);
    const previous = toNumber(item.previous_pass_rate);

    if (mark !== null) {
      row.markTotal += mark;
      row.markCount += 1;
    }

    if (pass !== null) {
      row.passTotal += pass;
      row.passCount += 1;
    }

    if (previous !== null) {
      row.previousTotal += previous;
      row.previousCount += 1;
    }
  }

  return Array.from(grouped.values())
    .map((row) => ({
      key: row.key,
      subject: row.subject,
      level: row.level,
      averageMark: row.markCount > 0 ? row.markTotal / row.markCount : null,
      passRate: row.passCount > 0 ? row.passTotal / row.passCount : null,
      previousPassRate:
        row.previousCount > 0 ? row.previousTotal / row.previousCount : null,
    }))
    .sort((a, b) => {
      const order = ["Nursery", "Primary", "O Level", "A Level", "Other"];
      const difference = order.indexOf(a.level) - order.indexOf(b.level);

      return difference || a.subject.localeCompare(b.subject);
    });
}

function getCompletionRecords(
  data: DashboardResponse | undefined,
): CompletionRecord[] {
  if (!data) return [];

  // Only use completion data actually returned by the backend.
  for (const key of ["completion", "student_completion", "completion_rates"]) {
    const records = toArray<CompletionRecord>(data[key]);
    if (records.length > 0) return records;
  }

  return [];
}

function getCompletedCount(record: CompletionRecord): number | null {
  return toNumber(record.completed_students ?? record.completed);
}

function getCompletionRate(record: CompletionRecord): number | null {
  return toNumber(record.completion_rate ?? record.completion_percentage);
}

function getQueryParams(filters: AcademicFilterValues) {
  const params: Record<string, string> = {};

  if (filters.school && filters.school !== "All Schools") {
    params.school = filters.school;
  }

  if (filters.campus && filters.campus !== "All Campuses") {
    params.campus = filters.campus;
  }

  if (filters.term) params.term = filters.term;
  if (filters.year) params.year = filters.year;

  const section = filters.section.trim().toLowerCase();

  if (section === "primary") {
    params.level = "primary";
  }

  return params;
}

export function AcademicDetails({
  filters = DEFAULT_FILTERS,
}: AcademicDetailsProps) {
  const queryParams = useMemo(() => getQueryParams(filters), [filters]);

  const dashboardQuery = useQuery({
    queryKey: ["academic-details-dashboard", queryParams],
    queryFn: async ({ signal }) => {
      const response = await api.get<DashboardResponse>(
        "/academics/performance/dashboard/",
        {
          params: queryParams,
          signal,
        },
      );

      return response.data;
    },
    refetchInterval: REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
  });

  const subjects = useMemo(
    () => toArray<DashboardSubject>(dashboardQuery.data?.subjects),
    [dashboardQuery.data],
  );

  const subjectRows = useMemo(() => getSubjectRows(subjects), [subjects]);

  const completionRecords = useMemo(
    () => getCompletionRecords(dashboardQuery.data),
    [dashboardQuery.data],
  );

  const selectedSection = filters.section.trim().toLowerCase();

  const visibleSubjectRows = subjectRows.filter((row) => {
    if (selectedSection === "primary") return row.level === "Primary";
    if (selectedSection === "nursery") return row.level === "Nursery";
    if (selectedSection === "secondary") {
      return row.level === "O Level" || row.level === "A Level";
    }

    return true;
  });

  return (
    <section
      className="acad-details"
      aria-label="Subject comparison and student completion rate"
      aria-busy={dashboardQuery.isFetching}
    >
      <div className="acad-details__grid">
        <article className="acad-details__card">
          <header className="acad-details__header">
            <div>
              <h2>Subject Comparison</h2>
            </div>
            {dashboardQuery.isFetching && !dashboardQuery.isLoading && (
              <span className="acad-details__live">
                <span className="acad-details__live-dot" />
                Updating
              </span>
            )}
          </header>

          {dashboardQuery.isLoading ? (
            <p className="acad-details__message" role="status">
              Loading subject performance…
            </p>
          ) : dashboardQuery.isError ? (
            <p
              className="acad-details__message acad-details__message--error"
              role="alert"
            >
              {errorMessage(dashboardQuery.error)}
            </p>
          ) : visibleSubjectRows.length === 0 ? (
            <p className="acad-details__message">
              No subject performance data is available for the selected filters.
            </p>
          ) : (
            <div className="acad-details__table-scroll">
              <table className="acad-details__table">
                <thead>
                  <tr>
                    <th scope="col">Subject / Category</th>
                    <th scope="col">Level</th>
                    <th scope="col">Average mark</th>
                    <th scope="col">Pass rate</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSubjectRows.map((row) => {
                    return (
                      <tr key={row.key}>
                        <td className="acad-details__subject">{row.subject}</td>
                        <td>{row.level}</td>
                        <td>{formatPercent(row.averageMark)}</td>
                        <td className="acad-details__strong">
                          {formatPercent(row.passRate)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="acad-details__card">
          <header className="acad-details__header">
            <div>
              <h2>Student Completion Rate</h2>
            </div>
          </header>

          {dashboardQuery.isLoading ? (
            <p className="acad-details__message" role="status">
              Loading completion data…
            </p>
          ) : dashboardQuery.isError ? (
            <p
              className="acad-details__message acad-details__message--error"
              role="alert"
            >
              {errorMessage(dashboardQuery.error)}
            </p>
          ) : completionRecords.length === 0 ? (
            <div className="acad-details__empty-state">
              <p>
                No student-completion records were returned by the dashboard
                API.
              </p>
            </div>
          ) : (
            <div className="acad-details__completion-list">
              {completionRecords.map((record, index) => {
                const level =
                  record.level_display || record.level || "Education level";
                const campus = record.campus_display || record.campus || "";
                const completed = getCompletedCount(record);
                const rate = getCompletionRate(record);

                return (
                  <div
                    className="acad-details__completion-row"
                    key={`${level}-${campus}-${index}`}
                  >
                    <div className="acad-details__completion-top">
                      <div>
                        <strong>{normalizeLevel(level)}</strong>
                        {campus && (
                          <span className="acad-details__campus">{campus}</span>
                        )}
                      </div>
                      <strong className="acad-details__completion-rate">
                        {formatPercent(rate)}
                      </strong>
                    </div>

                    <div className="acad-details__progress-track">
                      <span
                        style={{
                          width: `${Math.min(100, Math.max(0, rate ?? 0))}%`,
                        }}
                      />
                    </div>

                    <p className="acad-details__completed">
                      {completed === null
                        ? "Completed students: not provided by the API"
                        : `${formatNumber(completed)} completed students`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
