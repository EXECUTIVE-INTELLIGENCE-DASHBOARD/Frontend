import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AcademicFilterValues } from "../filters/academicFilters.types";
import api from "../../api/axios";
import "./AcademicAnalytics.css";

interface AcademicAnalyticsProps {
  filters: AcademicFilterValues;
}

interface Grade {
  grade: string;
  students: number;
  share: number | null;
}

interface GradeDistributionData {
  level: string;
  level_display: string;
  students: number;
  grades: Grade[];
}

interface PerformanceDashboard {
  grade_distribution: GradeDistributionData[];
}

interface School {
  id: number;
  name: string;
  campus: string;
  campus_display?: string;
  level: string;
}

interface NationalExamResult {
  id: number;
  school: number;
  exam: "ple" | "uce" | "uace";
  year: number;
  division?: string;
  division_display?: string;
  aggregate?: number | null;
  principal_passes?: number | null;
  points?: number | null;
  passed: boolean;
}

interface ApiList<T> {
  results?: T[];
}

type ApiResponse<T> = T[] | ApiList<T>;

interface ExamSummary {
  key: string;
  campus: string;
  schoolName: string;
  exam: NationalExamResult["exam"];
  year: number;
  candidates: number;
  passed: number;
  failed: number;
  passRate: number;
  averageAggregate: number | null;
  averagePrincipalPasses: number | null;
  averagePoints: number | null;
  divisions: { label: string; count: number }[];
}

const REFRESH_INTERVAL = 30_000;

function getResults<T>(data: ApiResponse<T>): T[] {
  return Array.isArray(data) ? data : (data.results ?? []);
}

function formatNumber(value: number | null | undefined): string {
  return value == null ? "—" : value.toLocaleString();
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

function getExamLabel(exam: NationalExamResult["exam"]): string {
  switch (exam) {
    case "ple":
      return "PLE";
    case "uce":
      return "UCE";
    case "uace":
      return "UACE";
  }
}

function getCampusLabel(school: School): string {
  if (school.campus_display) {
    return school.campus_display;
  }

  switch (school.campus.toLowerCase()) {
    case "kibuli":
      return "Kibuli Main Campus";
    case "buwaate":
      return "Buwaate Campus";
    case "annex":
      return "Annex Preschool";
    default:
      return school.campus;
  }
}

function getDivisionLabel(result: NationalExamResult): string {
  return result.division_display || result.division || "Ungraded";
}

function average(values: (number | null | undefined)[]): number | null {
  const validValues = values.filter(
    (value): value is number => value != null && Number.isFinite(value),
  );

  if (validValues.length === 0) {
    return null;
  }

  return (
    validValues.reduce((total, value) => total + value, 0) / validValues.length
  );
}

function buildExamSummaries(
  results: NationalExamResult[],
  schools: School[],
  selectedSchool: string | undefined,
): ExamSummary[] {
  const schoolsById = new Map(schools.map((school) => [school.id, school]));

  const groups = new Map<
    string,
    {
      campus: string;
      schoolName: string;
      exam: NationalExamResult["exam"];
      year: number;
      results: NationalExamResult[];
    }
  >();

  for (const result of results) {
    const school = schoolsById.get(result.school);

    if (!school) {
      continue;
    }

    const campus = getCampusLabel(school);

    // When a school is selected, report that school.
    // Otherwise, combine results across schools in the same campus.
    const schoolName = selectedSchool ? school.name : campus;

    const key = [
      selectedSchool ? school.id : school.campus,
      result.exam,
      result.year,
    ].join("-");

    const existing = groups.get(key);

    if (existing) {
      existing.results.push(result);
    } else {
      groups.set(key, {
        campus,
        schoolName,
        exam: result.exam,
        year: result.year,
        results: [result],
      });
    }
  }

  return Array.from(groups.entries())
    .map(([key, group]) => {
      const candidates = group.results.length;
      const passed = group.results.filter((result) => result.passed).length;
      const failed = candidates - passed;

      const divisionCounts = new Map<string, number>();

      for (const result of group.results) {
        const label =
          group.exam === "uace"
            ? `${result.principal_passes ?? 0} principal passes`
            : getDivisionLabel(result);

        divisionCounts.set(label, (divisionCounts.get(label) ?? 0) + 1);
      }

      return {
        key,
        campus: group.campus,
        schoolName: group.schoolName,
        exam: group.exam,
        year: group.year,
        candidates,
        passed,
        failed,
        passRate: candidates > 0 ? (passed / candidates) * 100 : 0,
        averageAggregate:
          group.exam === "ple"
            ? average(group.results.map((result) => result.aggregate))
            : null,
        averagePrincipalPasses:
          group.exam === "uace"
            ? average(group.results.map((result) => result.principal_passes))
            : null,
        averagePoints:
          group.exam === "uace"
            ? average(group.results.map((result) => result.points))
            : null,
        divisions: Array.from(divisionCounts.entries())
          .map(([label, count]) => ({ label, count }))
          .sort((a, b) =>
            a.label.localeCompare(b.label, undefined, {
              numeric: true,
            }),
          ),
      };
    })
    .sort(
      (a, b) =>
        a.campus.localeCompare(b.campus) ||
        a.exam.localeCompare(b.exam) ||
        b.year - a.year,
    );
}

export function AcademicAnalytics({ filters }: AcademicAnalyticsProps) {
  const { school, campus, section, term, year } = filters;

  const dashboardParams: Record<string, string | number> = {};

  if (school) dashboardParams.school = school;
  if (campus) dashboardParams.campus = campus;
  if (section) dashboardParams.level = section;

  if (term && /^\d+$/.test(term)) {
    dashboardParams.term = Number(term);
  }

  const dashboardQuery = useQuery({
    queryKey: ["academic-performance-dashboard", school, campus, section, term],
    queryFn: async ({ signal }) => {
      const response = await api.get<PerformanceDashboard>(
        "/academics/performance/dashboard/",
        { params: dashboardParams, signal },
      );

      return response.data;
    },
    refetchInterval: REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
  });

  const schoolsQuery = useQuery({
    queryKey: ["academic-national-exam-schools"],
    queryFn: async ({ signal }) => {
      const response = await api.get<ApiResponse<School>>(
        "/academics/schools/",
        { signal },
      );

      return getResults(response.data);
    },
    refetchInterval: REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
  });

  const examsQuery = useQuery({
    queryKey: ["academic-national-exam-results", school, campus, section, year],
    queryFn: async ({ signal }) => {
      const params: Record<string, string> = {};

      if (school) params.school = school;
      if (campus) params.campus = campus;
      if (section) params.level = section;
      if (year) params.year = year;

      const response = await api.get<ApiResponse<NationalExamResult>>(
        "/academics/national-exam-results/",
        { params, signal },
      );

      return getResults(response.data);
    },
    refetchInterval: REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
  });

  const schools = schoolsQuery.data ?? [];
  const examResults = examsQuery.data ?? [];

  const examSummaries = useMemo(
    () => buildExamSummaries(examResults, schools, school),
    [examResults, schools, school],
  );

  if (dashboardQuery.isLoading) {
    return (
      <section className="acad-analytics" aria-busy="true">
        <p>Loading academic analytics...</p>
      </section>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <section className="acad-analytics" aria-busy="false">
        <p role="alert">Unable to load academic analytics. Please try again.</p>
      </section>
    );
  }

  const { grade_distribution } = dashboardQuery.data;

  return (
    <section className="acad-analytics" aria-label="Academic analytics">
      <article className="acad-analytics__card">
        <header className="acad-analytics__header">
          <div>
            <h2>Grade Distribution</h2>
            <p>Student grades for the selected campus, section, and term</p>
          </div>
        </header>

        {grade_distribution.length === 0 ? (
          <p>No grade distribution data is available for these filters.</p>
        ) : (
          <div className="acad-analytics__grade-columns">
            {grade_distribution.map((level) => (
              <div className="acad-analytics__grade-level" key={level.level}>
                <div className="acad-analytics__grade-heading">
                  <h3>{level.level_display}</h3>
                  <span>{level.students} students</span>
                </div>

                <div className="acad-analytics__grade-list">
                  {level.grades.map((grade) => {
                    const percentage =
                      level.students > 0
                        ? (grade.students / level.students) * 100
                        : 0;

                    return (
                      <div
                        className="acad-analytics__grade-row"
                        key={grade.grade}
                      >
                        <span className="acad-analytics__grade-label">
                          {grade.grade}
                        </span>

                        <div
                          className="acad-analytics__grade-track"
                          role="progressbar"
                          aria-label={`${level.level_display} grade ${grade.grade}`}
                          aria-valuemin={0}
                          aria-valuemax={level.students}
                          aria-valuenow={grade.students}
                        >
                          <span
                            className="acad-analytics__grade-fill"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <span className="acad-analytics__grade-count">
                          {grade.students}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      {/* National Examination Results — dynamically grouped backend data */}
      <article className="acad-analytics__card">
        <header className="acad-analytics__header">
          <div>
            <h2>National Examination Results</h2>
            <p>
              Campus and school examination performance
              {year ? ` · ${year}` : " · All available years"}
            </p>
          </div>
        </header>

        {schoolsQuery.isLoading || examsQuery.isLoading ? (
          <p>Loading national examination results...</p>
        ) : schoolsQuery.isError || examsQuery.isError ? (
          <p role="alert">
            Unable to load national examination results. Please try again.
          </p>
        ) : examSummaries.length === 0 ? (
          <p>
            No national examination results are available for the selected
            filters.
          </p>
        ) : (
          <div className="acad-exams">
            <div className="acad-exams__table-wrap">
              <table className="acad-exams__table">
                <thead>
                  <tr>
                    <th scope="col">Campus</th>
                    <th scope="col">Exam</th>
                    <th scope="col">Year</th>
                    <th scope="col">Candidates</th>
                    <th scope="col">Passed</th>
                    <th scope="col">Failed</th>
                    <th scope="col">Pass Rate</th>
                  </tr>
                </thead>

                <tbody>
                  {examSummaries.map((summary) => (
                    <tr key={summary.key}>
                      <td>{summary.schoolName}</td>
                      <td>{getExamLabel(summary.exam)}</td>
                      <td>{summary.year}</td>
                      <td>{formatNumber(summary.candidates)}</td>
                      <td>{formatNumber(summary.passed)}</td>
                      <td>{formatNumber(summary.failed)}</td>
                      <td>
                        <span className="acad-exams__pass-rate">
                          {formatPercentage(summary.passRate)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}
