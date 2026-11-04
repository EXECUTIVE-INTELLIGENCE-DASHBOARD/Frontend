import { useMemo, useState } from "react";
import { AlertCircle, BookOpen } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useQueries, useQuery } from "@tanstack/react-query";

import api from "../../api/axios";
import type { AcademicFilterValues } from "../filters/academicFilters.types";
import "./AllCampusesAssessmentOverview.css";

interface School {
  id: number;
  name: string;
  level: string;
  campus: string;
}

interface Term {
  id: number;
  number: number;
  academic_year: string | number;
}

interface ApiList<T> {
  results?: T[];
}

type ApiResponse<T> = T[] | ApiList<T>;
type AssessmentKey = "test_1" | "test_2";
type SchoolGroup = "Primary" | "Secondary · O Level" | "Secondary · A Level" | "Other";

interface AssessmentTest {
  subject?: string;
  level?: string;
  level_display?: string;
  section?: string;
  section_display?: string;
  class_level?: string;
  class_level_display?: string;
  test_1_average?: number | string | null;
  test_2_average?: number | string | null;
  test_1_pass_rate?: number | string | null;
  test_2_pass_rate?: number | string | null;
  students_assessed?: number | string | null;
}

interface SubjectResult {
  subject?: string;
  name?: string;
  level?: string;
  level_display?: string;
  average_mark?: number | string | null;
  pass_rate?: number | string | null;
}

interface DashboardData {
  compared_with?: { id?: number } | null;
  summary?: {
    students_assessed?: number | string | null;
    student_performance?: number | string | null;
    average_mark?: number | string | null;
  };
  tests?: AssessmentTest[];
  subjects?: SubjectResult[];
}

interface AssessmentRow {
  school: School;
  group: SchoolGroup;
  average: number | null;
  passRate: number | null;
  previousPassRate: number | null;
  weakestSubject: string | null;
}

interface LearnerTrendPoint {
  term: string;
  termNumber: number;
  currentYear: number | null;
  previousYear: number | null;
}

const CAMPUS_COLOURS = {
  current: "#2aa4dd",
  previous: "#9aa8bd",
};

function getResults<T>(data: ApiResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results ?? [];
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalize(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/[_-]/g, " ");
}

function getLevelGroup(value: string): "O Level" | "A Level" | null {
  const normalized = normalize(value);
  if (
    normalized.includes("o level") ||
    normalized === "o" ||
    /(^|\s)s\.?\s*[1-4](\s|$)/.test(normalized)
  ) {
    return "O Level";
  }
  if (
    normalized.includes("a level") ||
    normalized === "a" ||
    /(^|\s)s\.?\s*[56](\s|$)/.test(normalized)
  ) {
    return "A Level";
  }
  return null;
}

function isAllCampusAndSectionSelection(
  filters: AcademicFilterValues,
): boolean {
  const isAll = (value: string, label: string) => {
    const selection = value.trim().toLowerCase();
    return !selection || selection === "all" || selection === `all ${label}`;
  };

  return (
    isAll(filters.school, "schools") &&
    isAll(filters.campus, "campuses") &&
    isAll(filters.section, "sections") &&
    /^\d+$/.test(filters.term.trim())
  );
}

function average(values: Array<number | null>): number | null {
  const available = values.filter((value): value is number => value !== null);
  return available.length
    ? available.reduce((total, value) => total + value, 0) / available.length
    : null;
}

function getGroupTests(
  dashboard: DashboardData | undefined,
  group: SchoolGroup,
): AssessmentTest[] {
  const tests = dashboard?.tests ?? [];
  if (group === "Other") return tests;
  if (group === "Primary") {
    return tests.filter((test) => {
      const level = normalize(
        test.level_display || test.level || test.section_display || test.section,
      );
      const classLevel = normalize(test.class_level_display || test.class_level);
      return (
        level.includes("primary") ||
        classLevel.startsWith("p") ||
        !level
      );
    });
  }

  const requestedLevel = group.endsWith("O Level") ? "O Level" : "A Level";
  return tests.filter((test) => {
    const level = getLevelGroup(
      [
        test.level_display,
        test.level,
        test.section_display,
        test.section,
        test.class_level_display,
        test.class_level,
      ]
        .filter(Boolean)
        .join(" "),
    );
    return level === requestedLevel;
  });
}

function getGroupSubjects(
  dashboard: DashboardData | undefined,
  group: SchoolGroup,
): SubjectResult[] {
  const subjects = dashboard?.subjects ?? [];
  if (group === "Other") return subjects;
  if (group === "Primary") {
    return subjects.filter((subject) => {
      const level = normalize(subject.level_display || subject.level);
      return level.includes("primary") || !level;
    });
  }
  const requestedLevel = group.endsWith("O Level") ? "O Level" : "A Level";
  return subjects.filter(
    (subject) =>
      getLevelGroup(subject.level_display || subject.level || "") ===
      requestedLevel,
  );
}

function buildAssessmentRow(
  school: School,
  group: SchoolGroup,
  current: DashboardData | undefined,
  previous: DashboardData | undefined,
  assessment: AssessmentKey,
): AssessmentRow {
  const currentTests = getGroupTests(current, group);
  const previousTests = getGroupTests(previous, group);
  const currentSubjects = getGroupSubjects(current, group);
  const previousSubjects = getGroupSubjects(previous, group);
  const averageKey =
    assessment === "test_1" ? "test_1_average" : "test_2_average";
  const passRateKey =
    assessment === "test_1" ? "test_1_pass_rate" : "test_2_pass_rate";

  const currentAverage =
    average(currentTests.map((test) => toNumber(test[averageKey]))) ??
    average(currentSubjects.map((subject) => toNumber(subject.average_mark))) ??
    (group === "Secondary · O Level" || group === "Secondary · A Level"
      ? null
      : toNumber(current?.summary?.average_mark));
  const passRate =
    average(currentTests.map((test) => toNumber(test[passRateKey]))) ??
    average(currentSubjects.map((subject) => toNumber(subject.pass_rate))) ??
    (group === "Secondary · O Level" || group === "Secondary · A Level"
      ? null
      : toNumber(current?.summary?.student_performance));
  const previousPassRate =
    average(previousTests.map((test) => toNumber(test[passRateKey]))) ??
    average(previousSubjects.map((subject) => toNumber(subject.pass_rate))) ??
    (group === "Secondary · O Level" || group === "Secondary · A Level"
      ? null
      : toNumber(previous?.summary?.student_performance));

  const subjectAverages = new Map<string, number[]>();
  currentTests.forEach((test) => {
    const subject = test.subject?.trim();
    const value = toNumber(test[averageKey]);
    if (!subject || value === null) return;
    const values = subjectAverages.get(subject) ?? [];
    values.push(value);
    subjectAverages.set(subject, values);
  });
  currentSubjects.forEach((subject) => {
    const name = subject.subject?.trim() || subject.name?.trim();
    const value = toNumber(subject.average_mark);
    if (!name || value === null || subjectAverages.has(name)) return;
    subjectAverages.set(name, [value]);
  });
  const weakestSubject = Array.from(subjectAverages)
    .map(([name, values]) => ({ name, average: average(values) }))
    .filter((item): item is { name: string; average: number } =>
      item.average !== null,
    )
    .sort((a, b) => a.average - b.average)[0]?.name ?? null;

  return {
    school,
    group,
    average: currentAverage,
    passRate,
    previousPassRate,
    weakestSubject,
  };
}

export function getAllCampusAssessmentRows(
  schools: School[],
  currentDashboards: Array<DashboardData | undefined>,
  previousDashboards: Array<DashboardData | undefined>,
  assessment: AssessmentKey,
): AssessmentRow[] {
  return schools.flatMap((school, index) => {
    const level = normalize(school.level);
    if (level.includes("secondary")) {
      return (["O Level", "A Level"] as const)
        .map((section) =>
          buildAssessmentRow(
            school,
            `Secondary · ${section}`,
            currentDashboards[index],
            previousDashboards[index],
            assessment,
          ),
        )
        .filter(
          (row) =>
            row.average !== null ||
            row.passRate !== null ||
            row.weakestSubject !== null,
        );
    }

    const group: SchoolGroup = level.includes("primary")
      ? "Primary"
      : "Other";
    const row = buildAssessmentRow(
        school,
        group,
        currentDashboards[index],
        previousDashboards[index],
        assessment,
      );
    return row.average !== null ||
      row.passRate !== null ||
      row.weakestSubject !== null
      ? [row]
      : [];
  });
}

export { isAllCampusAndSectionSelection };

export function AllCampusesAssessmentOverview({
  filters,
}: {
  filters: AcademicFilterValues;
}) {
  const [assessment, setAssessment] = useState<AssessmentKey>("test_1");
  const termsQuery = useQuery({
    queryKey: ["all-campus-assessment-terms"],
    queryFn: async ({ signal }) => {
      const response = await api.get<ApiResponse<Term>>("/academics/terms/", {
        signal,
      });
      return getResults(response.data);
    },
    staleTime: 60_000,
    retry: false,
  });
  const schoolsQuery = useQuery({
    queryKey: ["all-campus-assessment-schools"],
    queryFn: async ({ signal }) => {
      const response = await api.get<ApiResponse<School>>(
        "/academics/schools/",
        { signal },
      );
      return getResults(response.data);
    },
    staleTime: 60_000,
    retry: false,
  });

  const selectedTerm = termsQuery.data?.find(
    (term) => String(term.id) === filters.term,
  );
  const selectedYear = filters.year || String(selectedTerm?.academic_year ?? "");
  const priorYearNumber = Number(selectedYear) - 1;
  const priorYear = Number.isFinite(priorYearNumber)
    ? String(priorYearNumber)
    : "";
  const currentYearTerms = (termsQuery.data ?? []).filter(
    (term) => String(term.academic_year) === selectedYear,
  );
  const previousYearTerms = (termsQuery.data ?? []).filter(
    (term) => String(term.academic_year) === priorYear,
  );
  const schools = schoolsQuery.data ?? [];
  const currentSchoolQueries = useQueries({
    queries: schools.map((school) => ({
      queryKey: ["all-campus-school-assessment", school.id, filters.term],
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        const response = await api.get<DashboardData>(
          "/academics/performance/dashboard/",
          { params: { school: school.id, term: Number(filters.term) }, signal },
        );
        return response.data;
      },
      staleTime: 10_000,
      retry: false as const,
      enabled: isAllCampusAndSectionSelection(filters),
    })),
  });
  const previousSchoolQueries = useQueries({
    queries: currentSchoolQueries.map((query, index) => {
      const previousTermId = query.data?.compared_with?.id;
      return {
        queryKey: [
          "all-campus-school-assessment-previous",
          schools[index]?.id,
          previousTermId,
        ],
        queryFn: async ({ signal }: { signal: AbortSignal }) => {
          const response = await api.get<DashboardData>(
            "/academics/performance/dashboard/",
            { params: { school: schools[index].id, term: previousTermId }, signal },
          );
          return response.data;
        },
        staleTime: 10_000,
        retry: false as const,
        enabled: Boolean(previousTermId),
      };
    }),
  });
  const learnerTrendTerms = [...currentYearTerms, ...previousYearTerms];
  const learnerTrendQueries = useQueries({
    queries: learnerTrendTerms.map((term) => ({
      queryKey: ["all-campus-learner-trend", term.id],
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        const response = await api.get<DashboardData>(
          "/academics/performance/dashboard/",
          { params: { term: term.id }, signal },
        );
        return response.data;
      },
      staleTime: 10_000,
      retry: false as const,
      enabled: Boolean(selectedYear),
    })),
  });

  const rows = useMemo(
    () =>
      getAllCampusAssessmentRows(
        schools,
        currentSchoolQueries.map((query) => query.data),
        previousSchoolQueries.map((query) => query.data),
        assessment,
      ),
    [schools, currentSchoolQueries, previousSchoolQueries, assessment],
  );

  const learnerTrend = useMemo<LearnerTrendPoint[]>(() => {
    return [1, 2, 3].map((number) => {
      const currentIndex = learnerTrendTerms.findIndex(
        (term) =>
          term.number === number &&
          String(term.academic_year) === selectedYear,
      );
      const previousIndex = learnerTrendTerms.findIndex(
        (term) =>
          term.number === number &&
          String(term.academic_year) === priorYear,
      );
      return {
        term: `Term ${number}`,
        termNumber: number,
        currentYear:
          currentIndex >= 0
            ? toNumber(
                learnerTrendQueries[currentIndex].data?.summary
                  ?.students_assessed,
              )
            : null,
        previousYear:
          previousIndex >= 0
            ? toNumber(
                learnerTrendQueries[previousIndex].data?.summary
                  ?.students_assessed,
              )
            : null,
      };
    });
  }, [learnerTrendTerms, learnerTrendQueries, selectedYear, priorYear]);

  const dataLoading =
    termsQuery.isLoading ||
    schoolsQuery.isLoading ||
    currentSchoolQueries.some((query) => query.isLoading);
  const dataError = termsQuery.isError || schoolsQuery.isError;
  const schoolDataError = currentSchoolQueries.some((query) => query.isError);
  const selectedTermNumber = selectedTerm?.number;
  const selectedTrend = learnerTrend.find(
    (point) => point.termNumber === selectedTermNumber,
  );
  const learnerDifference =
    selectedTrend?.currentYear !== null &&
    selectedTrend?.currentYear !== undefined &&
    selectedTrend.previousYear !== null &&
    selectedTrend.previousYear !== undefined
      ? selectedTrend.currentYear - selectedTrend.previousYear
      : null;
  const groupedRows = [
    { title: "Primary", group: "Primary" as const },
    { title: "Secondary · O Level", group: "Secondary · O Level" as const },
    { title: "Secondary · A Level", group: "Secondary · A Level" as const },
    { title: "Other", group: "Other" as const },
  ];

  return (
    <section
      className="all-campus-overview"
      aria-labelledby="all-campus-overview-title"
    >
      <header className="all-campus-overview__header">
        <h2 id="all-campus-overview-title">Internal assessments</h2>
        <div
          className="all-campus-overview__switch"
          role="group"
          aria-label="Assessment period"
        >
          <button
            type="button"
            className={assessment === "test_1" ? "is-active" : ""}
            aria-pressed={assessment === "test_1"}
            onClick={() => setAssessment("test_1")}
          >
            Midterm
          </button>
          <button
            type="button"
            className={assessment === "test_2" ? "is-active" : ""}
            aria-pressed={assessment === "test_2"}
            onClick={() => setAssessment("test_2")}
          >
            End of term
          </button>
        </div>
      </header>

      {dataError ? (
        <div className="all-campus-overview__state all-campus-overview__state--error" role="alert">
          <AlertCircle size={19} />
          <span>Unable to load the all-campus assessment data.</span>
        </div>
      ) : schoolDataError ? (
        <div className="all-campus-overview__state all-campus-overview__state--error" role="alert">
          <AlertCircle size={19} />
          <span>Some school assessment results could not be loaded.</span>
        </div>
      ) : dataLoading ? (
        <div className="all-campus-overview__state">Loading all-campus assessments...</div>
      ) : (
        <div className="all-campus-overview__grid">
          <article className="all-campus-overview__table-card">
            <div className="all-campus-overview__table-wrap">
              <table className="all-campus-overview__table">
                <thead>
                  <tr>
                    <th>School</th>
                    <th>Average mark</th>
                    <th>Pass rate</th>
                    <th>Vs last term</th>
                    <th>Weakest subject</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedRows.map(({ title, group }) => {
                    const groupRows = rows.filter((row) => row.group === group);
                    if (!groupRows.length) return null;
                    return (
                      <FragmentGroup key={group} title={title} rows={groupRows} />
                    );
                  })}
                </tbody>
              </table>
              {rows.length === 0 && (
                <p className="all-campus-overview__empty">
                  <BookOpen size={18} />
                  No school-level assessment results are available for this term.
                </p>
              )}
            </div>
          </article>

          <article className="all-campus-overview__trend-card">
            <header>
              <h3>Learners assessed</h3>
              <span>All schools · {selectedYear || "selected year"}</span>
            </header>
            {learnerTrend.some(
              (point) => point.currentYear !== null || point.previousYear !== null,
            ) ? (
              <>
                <div className="all-campus-overview__chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={learnerTrend} margin={{ top: 16, right: 12, bottom: 4, left: 0 }}>
                      <CartesianGrid vertical={false} stroke="#dce4ef" />
                      <XAxis dataKey="term" tickLine={false} axisLine={false} />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={36}
                        allowDecimals={false}
                      />
                      <Tooltip
                        formatter={(value) => [
                          value == null ? "—" : Number(value).toLocaleString(),
                          "Learners assessed",
                        ]}
                        contentStyle={{
                          border: "1px solid var(--color-border)",
                          borderRadius: 8,
                          background: "var(--color-surface)",
                          color: "var(--color-text)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="currentYear"
                        name={selectedYear}
                        stroke={CAMPUS_COLOURS.current}
                        strokeWidth={3}
                        connectNulls
                        dot={{ r: 4 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="previousYear"
                        name={priorYear}
                        stroke={CAMPUS_COLOURS.previous}
                        strokeWidth={2}
                        strokeDasharray="5 4"
                        connectNulls
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="all-campus-overview__legend">
                  <span><i className="current" />{selectedYear}</span>
                  <span><i className="previous" />{priorYear || "Previous year"}</span>
                </div>
                {learnerDifference !== null && (
                  <p className="all-campus-overview__trend-summary">
                    Term {selectedTermNumber}:{" "}
                    <strong className={learnerDifference >= 0 ? "positive" : "negative"}>
                      {learnerDifference > 0 ? "+" : ""}
                      {learnerDifference.toLocaleString()} learners
                    </strong>{" "}
                    against Term {selectedTermNumber} {priorYear}.
                  </p>
                )}
              </>
            ) : learnerTrendQueries.some((query) => query.isLoading) ? (
              <p className="all-campus-overview__trend-empty">Loading learner history...</p>
            ) : (
              <p className="all-campus-overview__trend-empty">
                Learner history is unavailable for these academic years.
              </p>
            )}
          </article>
        </div>
      )}
    </section>
  );
}

function FragmentGroup({
  title,
  rows,
}: {
  title: string;
  rows: AssessmentRow[];
}) {
  return (
    <>
      <tr className="all-campus-overview__group-row">
        <th colSpan={5}>{title}</th>
      </tr>
      {rows.map((row) => {
        const difference =
          row.passRate !== null && row.previousPassRate !== null
            ? row.passRate - row.previousPassRate
            : null;
        return (
          <tr key={`${row.school.id}-${row.group}`}>
            <td className="all-campus-overview__school-name">
              {row.group.startsWith("Secondary")
                ? `${row.school.name} · ${row.group.endsWith("O Level") ? "O Level" : "A Level"}`
                : row.school.name}
            </td>
            <td><strong>{row.average === null ? "—" : `${row.average.toFixed(1)}%`}</strong></td>
            <td><strong>{row.passRate === null ? "—" : `${row.passRate.toFixed(1)}%`}</strong></td>
            <td>
              {difference === null ? (
                <span className="all-campus-overview__muted">—</span>
              ) : (
                <span className={difference >= 0 ? "all-campus-overview__positive" : "all-campus-overview__negative"}>
                  {difference > 0 ? "▲ +" : difference < 0 ? "▼ " : "• "}
                  {difference.toFixed(1)} pp
                </span>
              )}
            </td>
            <td>{row.weakestSubject ?? "—"}</td>
          </tr>
        );
      })}
    </>
  );
}
