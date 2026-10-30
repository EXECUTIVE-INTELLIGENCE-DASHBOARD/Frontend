import { useMemo } from "react";

import type { AcademicFilterValues } from "../filters/academicFilters.types";
import { useAcademicPerformanceDashboard } from "./useAcademicPerformanceDashboard";

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

interface SubjectRow {
  key: string;
  subject: string;
  level: string;
  averageMark: number | null;
  passRate: number | null;
  previousPassRate: number | null;
}

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

export function AcademicDetails({
  filters = DEFAULT_FILTERS,
}: AcademicDetailsProps) {
  const dashboardQuery = useAcademicPerformanceDashboard(filters);

  const subjects = useMemo(
    () => toArray<DashboardSubject>(dashboardQuery.data?.subjects),
    [dashboardQuery.data],
  );

  const subjectRows = useMemo(() => getSubjectRows(subjects), [subjects]);

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
      aria-label="Subject comparison"
      aria-busy={dashboardQuery.isFetching}
    >
      <article className="acad-details__card">
        <header className="acad-details__header">
          <div>
            <h2>Subject Comparison</h2>
            <p>Average marks and pass rates by subject and level</p>
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
          <div className="acad-details__chart">
            <div className="acad-details__legend" aria-hidden="true">
              <span>
                <i className="acad-details__legend-swatch acad-details__legend-swatch--average" />
                Average mark
              </span>
              <span>
                <i className="acad-details__legend-swatch acad-details__legend-swatch--pass" />
                Pass rate
              </span>
            </div>
            <div className="acad-details__axis" aria-hidden="true">
              <span />
              <div>
                {[0, 25, 50, 75, 100].map((tick) => (
                  <span key={tick}>{tick}%</span>
                ))}
              </div>
            </div>
            <div className="acad-details__rows">
              {visibleSubjectRows.map((row) => (
                <div className="acad-details__subject-row" key={row.key}>
                  <div className="acad-details__subject-label">
                    <strong>{row.subject}</strong>
                    <span>{row.level}</span>
                  </div>
                  <div className="acad-details__subject-bars">
                    {[
                      {
                        label: "Average mark",
                        value: row.averageMark,
                        variant: "average",
                      },
                      {
                        label: "Pass rate",
                        value: row.passRate,
                        variant: "pass",
                      },
                    ].map(({ label, value, variant }) => (
                      <div
                        className="acad-details__bar-row"
                        key={label}
                        role="progressbar"
                        aria-label={`${row.subject} ${row.level} ${label}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={value ?? 0}
                        aria-valuetext={formatPercent(value)}
                        tabIndex={0}
                      >
                        <span
                          className={`acad-details__bar acad-details__bar--${variant}`}
                          style={{
                            width: `${Math.min(100, Math.max(0, value ?? 0))}%`,
                          }}
                        />
                        <span className="acad-details__bar-value">
                          {formatPercent(value)}
                        </span>
                        <span
                          className="acad-details__bar-tooltip"
                          aria-hidden="true"
                        >
                          {row.subject} · {row.level} · {label}:{" "}
                          {formatPercent(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    </section>
  );
}
