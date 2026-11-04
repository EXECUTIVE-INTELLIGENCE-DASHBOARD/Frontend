import { useMemo } from "react";
import { AlertCircle, BookOpen } from "lucide-react";

import type { AcademicFilterValues } from "../filters/academicFilters.types";
import { useAcademicPerformanceDashboard } from "./useAcademicPerformanceDashboard";
import "./AcademicDetails.css";

interface AcademicDetailsProps {
  filters: AcademicFilterValues;
}

interface SubjectResult {
  id?: number;
  subject?: string;
  name?: string;
  code?: string;
  level?: string;
  level_display?: string;
  average_mark?: number | string | null;
  pass_rate?: number | string | null;
  previous_pass_rate?: number | string | null;
}

interface GradeResult {
  grade?: string;
  students?: number | string | null;
  share?: number | string | null;
}

interface GradeDistribution {
  level?: string;
  level_display?: string;
  students?: number | string | null;
  grades?: GradeResult[];
}

interface DashboardData {
  subjects?: SubjectResult[];
  grade_distribution?: GradeDistribution[];
}

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
};

const formatNumber = (value: number | null): string => {
  return value === null ? "—" : value.toLocaleString();
};

const formatPercent = (value: number | null): string => {
  return value === null ? "—" : `${value.toFixed(1)}%`;
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
    selected === "all" ||
    selected === "all sections"
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
    return (
      actual.includes("secondary") ||
      actual.includes("o level") ||
      actual.includes("a level")
    );
  }

  return actual === selected;
};

export function AcademicDetails({
  filters,
}: AcademicDetailsProps) {
  const dashboardQuery =
    useAcademicPerformanceDashboard(filters);

  const dashboard = dashboardQuery.data as
    | DashboardData
    | undefined;

  const subjects = dashboard?.subjects ?? [];
  const gradeDistribution = dashboard?.grade_distribution ?? [];

  const visibleSubjects = useMemo(() => {
    return subjects
      .filter((subject) =>
        matchesSection(
          subject.level_display || subject.level,
          filters.section,
        ),
      )
      .map((subject) => ({
        name:
          subject.subject?.trim() ||
          subject.name?.trim() ||
          "Unnamed subject",
        level:
          subject.level_display ||
          subject.level ||
          "—",
        averageMark: toNumber(subject.average_mark),
        passRate: toNumber(subject.pass_rate),
        previousPassRate: toNumber(
          subject.previous_pass_rate,
        ),
      }))
      .sort((a, b) => {
        if (a.averageMark === null) return 1;
        if (b.averageMark === null) return -1;

        return a.averageMark - b.averageMark;
      });
  }, [subjects, filters.section]);

  const visibleGradeDistribution = useMemo(() => {
    return gradeDistribution.filter((group) =>
      matchesSection(
        group.level_display || group.level,
        filters.section,
      ),
    );
  }, [gradeDistribution, filters.section]);

  const hasSubjectData = visibleSubjects.length > 0;
  const hasGradeData = visibleGradeDistribution.some(
    (group) => (group.grades?.length ?? 0) > 0,
  );

  const hasData = hasSubjectData || hasGradeData;

  const selectedSection =
    filters.section.trim() || "All sections";

  return (
    <section
      className="academic-details"
      aria-labelledby="academic-details-title"
    >
      <div className="academic-details__header">
        <div>
          <h2 id="academic-details-title">
            Learner and subject details
          </h2>

          <p>
            Academic breakdown for {selectedSection.toLowerCase()}
            {" "}using the selected school, campus, term and year.
          </p>
        </div>
      </div>

      {dashboardQuery.isLoading ? (
        <div className="academic-details__state">
          <span className="academic-details__loader" />

          <span>Loading academic details...</span>
        </div>
      ) : dashboardQuery.isError ? (
        <div className="academic-details__state academic-details__state--error">
          <AlertCircle size={19} />

          <div>
            <strong>Academic details are unavailable</strong>

            <p>
              We could not retrieve the academic details for
              the selected filters. Please try again later.
            </p>
          </div>
        </div>
      ) : (
        <>
          {hasSubjectData && (
            <div className="academic-details__card">
              <div className="academic-details__card-header">
                <div>
                  <h3>Subject performance breakdown</h3>

                  <p>
                    Subject averages and pass rates for the
                    selected section.
                  </p>
                </div>

                <span className="academic-details__count">
                  {visibleSubjects.length} subjects
                </span>
              </div>

              <div className="academic-details__table-wrap">
                <table className="academic-details__table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Section</th>
                      <th>Average mark</th>
                      <th>Pass rate</th>
                      <th>Change in pass rate</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleSubjects.map((subject, index) => {
                      const change =
                        subject.passRate !== null &&
                        subject.previousPassRate !== null
                          ? subject.passRate -
                            subject.previousPassRate
                          : null;

                      return (
                        <tr
                          key={`${subject.name}-${subject.level}-${index}`}
                        >
                          <td className="academic-details__subject-name">
                            {subject.name}
                          </td>

                          <td>{subject.level}</td>

                          <td>
                            <strong>
                              {formatPercent(subject.averageMark)}
                            </strong>
                          </td>

                          <td>
                            {formatPercent(subject.passRate)}
                          </td>

                          <td>
                            {change === null ? (
                              <span className="academic-details__neutral">
                                —
                              </span>
                            ) : (
                              <span
                                className={
                                  change > 0
                                    ? "academic-details__positive"
                                    : change < 0
                                      ? "academic-details__negative"
                                      : "academic-details__neutral"
                                }
                              >
                                {change > 0 ? "+" : ""}
                                {change.toFixed(1)} pp
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {hasGradeData && (
            <div className="academic-details__card">
              <div className="academic-details__card-header">
                <div>
                  <h3>Grade distribution</h3>

                  <p>
                    Learner distribution across recorded grade
                    categories.
                  </p>
                </div>
              </div>

              <div className="academic-details__grade-groups">
                {visibleGradeDistribution.map((group, groupIndex) => {
                  const groupStudents =
                    toNumber(group.students) ?? 0;

                  return (
                    <article
                      className="academic-details__grade-group"
                      key={`${group.level || group.level_display || "level"}-${groupIndex}`}
                    >
                      <div className="academic-details__grade-heading">
                        <h4>
                          {group.level_display ||
                            group.level ||
                            "Grade distribution"}
                        </h4>

                        <span>
                          {formatNumber(groupStudents)} learners
                        </span>
                      </div>

                      <div className="academic-details__grade-list">
                        {(group.grades ?? []).map(
                          (grade, gradeIndex) => {
                            const students =
                              toNumber(grade.students);

                            const reportedShare =
                              toNumber(grade.share);

                            const calculatedShare =
                              students !== null &&
                              groupStudents > 0
                                ? (students / groupStudents) * 100
                                : null;

                            const share =
                              reportedShare ?? calculatedShare;

                            const safeShare =
                              share === null
                                ? 0
                                : Math.min(
                                    100,
                                    Math.max(0, share),
                                  );

                            return (
                              <div
                                className="academic-details__grade-row"
                                key={`${grade.grade || "grade"}-${gradeIndex}`}
                              >
                                <div className="academic-details__grade-label">
                                  <strong>
                                    {grade.grade || "Unspecified"}
                                  </strong>

                                  <span>
                                    {formatNumber(students)}
                                  </span>
                                </div>

                                <div
                                  className="academic-details__grade-track"
                                  role="progressbar"
                                  aria-label={`${grade.grade || "Grade"} share`}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                  aria-valuenow={safeShare}
                                >
                                  <span
                                    className="academic-details__grade-fill"
                                    style={{
                                      width: `${safeShare}%`,
                                    }}
                                  />
                                </div>

                                <span className="academic-details__grade-share">
                                  {formatPercent(share)}
                                </span>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {!hasData && (
            <div className="academic-details__state">
              <BookOpen size={21} />

              <div>
                <strong>No detailed academic records available</strong>

                <p>
                  The dashboard has not returned subject-level
                  or grade-distribution records for the selected
                  school, campus, section, term and year.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}