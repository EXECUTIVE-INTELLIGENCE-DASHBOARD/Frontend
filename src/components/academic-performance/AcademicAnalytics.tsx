import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  BookOpen,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { AcademicFilterValues } from "../filters/academicFilters.types";
import { useAcademicPerformanceDashboard } from "./useAcademicPerformanceDashboard";
import "./AcademicAnalytics.css";

interface AcademicAnalyticsProps {
  filters: AcademicFilterValues;
}

type AssessmentKey = "test_1" | "test_2";

interface TestResult {
  id?: number;
  subject?: string;
  level?: string;
  level_display?: string;
  test_1_average?: number | string | null;
  test_2_average?: number | string | null;
  test_1_pass_rate?: number | string | null;
  test_2_pass_rate?: number | string | null;
  students_assessed?: number | string | null;
}

interface DashboardData {
  tests?: TestResult[];
}

interface AssessmentRow {
  subject: string;
  level: string;
  averageMark: number | null;
  passRate: number | null;
  studentsAssessed: number | null;
}

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
};

const formatPercent = (value: number | null): string => {
  return value === null ? "—" : `${value.toFixed(1)}%`;
};

const formatCount = (value: number | null): string => {
  return value === null ? "—" : value.toLocaleString();
};

const normalise = (value: string | undefined): string => {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ");
};

const matchesSection = (
  level: string | undefined,
  selectedSection: string,
): boolean => {
  const selected = normalise(selectedSection);
  const actual = normalise(level);

  if (
    !selected ||
    selected === "all sections" ||
    selected === "all"
  ) {
    return true;
  }

  if (selected.includes("primary")) {
    return actual.includes("primary");
  }

  if (selected.includes("nursery")) {
    return actual.includes("nursery");
  }

  if (selected.includes("o level") || selected === "o") {
    return actual.includes("o level") || actual === "olevel";
  }

  if (selected.includes("a level") || selected === "a") {
    return actual.includes("a level") || actual === "alevel";
  }

  if (selected.includes("secondary")) {
    return actual.includes("secondary");
  }

  return actual === selected;
};

const getAssessmentRows = (
  tests: TestResult[],
  assessment: AssessmentKey,
  selectedSection: string,
): AssessmentRow[] => {
  return tests
    .filter((test) =>
      matchesSection(
        test.level_display || test.level,
        selectedSection,
      ),
    )
    .map((test) => ({
      subject: test.subject?.trim() || "Unnamed subject",
      level: test.level_display || test.level || "—",

      averageMark: toNumber(
        assessment === "test_1"
          ? test.test_1_average
          : test.test_2_average,
      ),

      passRate: toNumber(
        assessment === "test_1"
          ? test.test_1_pass_rate
          : test.test_2_pass_rate,
      ),

      studentsAssessed: toNumber(test.students_assessed),
    }))
    .sort((a, b) => {
      if (a.averageMark === null) return 1;
      if (b.averageMark === null) return -1;

      return a.averageMark - b.averageMark;
    });
};

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: MetricCardProps) {
  return (
    <article className="academic-analytics__metric">
      <div className="academic-analytics__metric-icon">
        <Icon size={17} strokeWidth={1.8} />
      </div>

      <div className="academic-analytics__metric-copy">
        <span className="academic-analytics__metric-label">
          {label}
        </span>

        <strong className="academic-analytics__metric-value">
          {value}
        </strong>

        <span className="academic-analytics__metric-detail">
          {detail}
        </span>
      </div>
    </article>
  );
}

export function AcademicAnalytics({
  filters,
}: AcademicAnalyticsProps) {
  const [assessment, setAssessment] =
    useState<AssessmentKey>("test_1");

  const dashboardQuery =
    useAcademicPerformanceDashboard(filters);

  const dashboard = dashboardQuery.data as
    | DashboardData
    | undefined;

  const tests = dashboard?.tests ?? [];

  const rows = useMemo(
    () =>
      getAssessmentRows(
        tests,
        assessment,
        filters.section,
      ),
    [tests, assessment, filters.section],
  );

  const summary = useMemo(() => {
    const averageMarks = rows
      .map((row) => row.averageMark)
      .filter((value): value is number => value !== null);

    const passRates = rows
      .map((row) => row.passRate)
      .filter((value): value is number => value !== null);

    const assessedCounts = rows
      .map((row) => row.studentsAssessed)
      .filter((value): value is number => value !== null);

    const averageMark =
      averageMarks.length > 0
        ? averageMarks.reduce(
            (total, value) => total + value,
            0,
          ) / averageMarks.length
        : null;

    const averagePassRate =
      passRates.length > 0
        ? passRates.reduce(
            (total, value) => total + value,
            0,
          ) / passRates.length
        : null;

    const totalAssessed =
      assessedCounts.length > 0
        ? Math.max(...assessedCounts)
        : null;

    return {
      averageMark,
      averagePassRate,
      totalAssessed,
    };
  }, [rows]);

  const weakestSubject = rows.find(
    (row) => row.averageMark !== null,
  );

  const hasAssessmentData = rows.some(
    (row) =>
      row.averageMark !== null ||
      row.passRate !== null,
  );

  const assessmentLabel =
    assessment === "test_1"
      ? "Midterm"
      : "End-of-term";

  return (
    <section
      className="academic-analytics"
      aria-labelledby="academic-analytics-title"
    >
      <div className="academic-analytics__header">
        <div>
          <h2 id="academic-analytics-title">
            Internal assessment analysis
          </h2>

          <p>
            Review subject results, average marks and pass
            rates for the selected academic filters.
          </p>
        </div>

        <div
          className="academic-analytics__switch"
          role="group"
          aria-label="Select assessment period"
        >
          <button
            type="button"
            className={
              assessment === "test_1" ? "is-active" : ""
            }
            aria-pressed={assessment === "test_1"}
            onClick={() => setAssessment("test_1")}
          >
            Midterm
          </button>

          <button
            type="button"
            className={
              assessment === "test_2" ? "is-active" : ""
            }
            aria-pressed={assessment === "test_2"}
            onClick={() => setAssessment("test_2")}
          >
            End of term
          </button>
        </div>
      </div>

      {dashboardQuery.isLoading ? (
        <div className="academic-analytics__state">
          <span className="academic-analytics__loader" />

          <span>
            Loading internal assessment results...
          </span>
        </div>
      ) : dashboardQuery.isError ? (
        <div className="academic-analytics__state academic-analytics__state--error">
          <AlertCircle size={19} />

          <div>
            <strong>
              Assessment results are unavailable
            </strong>

            <p>
              We could not retrieve the results for the
              selected filters. Please try again later.
            </p>
          </div>
        </div>
      ) : !hasAssessmentData ? (
        <div className="academic-analytics__state">
          <BookOpen size={21} />

          <div>
            <strong>
              No {assessmentLabel.toLowerCase()} results
              available
            </strong>

            <p>
              There are no recorded subject assessment
              results for the selected school, campus,
              section, term and year.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="academic-analytics__metrics">
            <MetricCard
              label="Average mark"
              value={formatPercent(summary.averageMark)}
              detail={`Across ${rows.length} subject${
                rows.length === 1 ? "" : "s"
              }`}
              icon={Activity}
            />

            <MetricCard
              label="Average pass rate"
              value={formatPercent(summary.averagePassRate)}
              detail="Across subjects with recorded pass rates"
              icon={TrendingUp}
            />

            <MetricCard
              label="Learners assessed"
              value={formatCount(summary.totalAssessed)}
              detail="Highest subject-level assessed count"
              icon={BookOpen}
            />
          </div>

          <div className="academic-analytics__table-card">
            <div className="academic-analytics__table-header">
              <div>
                <h3>Subject assessment results</h3>

                <p>
                  {assessmentLabel} results for the selected
                  academic filters
                </p>
              </div>

              {weakestSubject && (
                <div className="academic-analytics__weakest">
                  <TrendingDown size={15} />

                  <span>
                    Lowest average:{" "}
                    <strong>
                      {weakestSubject.subject}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            <div className="academic-analytics__table-wrap">
              <table className="academic-analytics__table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Section</th>
                    <th>Average mark</th>
                    <th>Pass rate</th>
                    <th>Learners assessed</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={`${row.subject}-${row.level}-${index}`}
                    >
                      <td className="academic-analytics__subject">
                        <span>{row.subject}</span>

                        {index === 0 &&
                          row.averageMark !== null && (
                            <small>Lowest</small>
                          )}
                      </td>

                      <td>{row.level}</td>

                      <td>
                        <strong>
                          {formatPercent(row.averageMark)}
                        </strong>
                      </td>

                      <td>{formatPercent(row.passRate)}</td>

                      <td>
                        {formatCount(row.studentsAssessed)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}