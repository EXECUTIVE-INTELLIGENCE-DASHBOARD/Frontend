import { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  BookOpen,
  TrendingDown,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../../api/axios";
import type { AcademicFilterValues } from "../filters/academicFilters.types";
import {
  AllCampusesAssessmentOverview,
  isAllCampusAndSectionSelection,
} from "./AllCampusesAssessmentOverview";
import { useAcademicPerformanceDashboard } from "./useAcademicPerformanceDashboard";
import "./AcademicAnalytics.css";

interface AcademicAnalyticsProps {
  filters: AcademicFilterValues;
}

function getSecondaryGroups(
  current: DashboardData | undefined,
  previous: DashboardData | undefined,
): Array<{
  level: "O Level" | "A Level";
  classRows: ComparisonTableRow[];
  subjectRows: ComparisonTableRow[];
  lowestSubject?: string;
}> {
  return (["O Level", "A Level"] as const).map((level) => {
    const classRows = mergeComparisonRows(
      getClassRows(current, level),
      getClassRows(previous, level),
      [],
    );
    const subjectRows = mergeComparisonRows(
      getSubjectRows(current, level),
      getSubjectRows(previous, level),
      [],
    );
    const lowestSubject = [...subjectRows]
      .filter((row) => row.endOfTerm !== null || row.midterm !== null)
      .sort((a, b) => {
        const aValue = a.endOfTerm ?? a.midterm ?? Number.POSITIVE_INFINITY;
        const bValue = b.endOfTerm ?? b.midterm ?? Number.POSITIVE_INFINITY;
        return aValue - bValue;
      })[0]?.name;

    return { level, classRows, subjectRows, lowestSubject };
  });
}

type AssessmentKey = "test_1" | "test_2";

interface TestResult {
  subject?: string;
  level?: string;
  level_display?: string;
  class_level?: string;
  class_level_display?: string;
  section?: string;
  section_display?: string;
  test_1_average?: number | string | null;
  test_2_average?: number | string | null;
  previous_test_1_average?: number | string | null;
  previous_test_2_average?: number | string | null;
  students_assessed?: number | string | null;
}

interface ClassAssessment {
  class_level?: string;
  class_level_display?: string;
  level?: string;
  level_display?: string;
  test_1_average?: number | string | null;
  test_2_average?: number | string | null;
  previous_test_1_average?: number | string | null;
  previous_test_2_average?: number | string | null;
}

interface DashboardData {
  term?: {
    id?: number;
    number?: number;
    label?: string;
  };
  compared_with?: {
    id?: number;
    label?: string;
  } | null;
  tests?: TestResult[];
  classes?: ClassAssessment[];
  by_class?: ClassAssessment[];
  summary?: {
    students_assessed?: number | string | null;
    students_passing?: number | string | null;
    student_performance?: number | string | null;
    average_mark?: number | string | null;
  };
}

interface AcademicSchool {
  id: number;
  name: string;
  level: string;
  campus?: string;
  campus_display?: string;
}

interface ApiList<T> {
  results?: T[];
}

type ApiResponse<T> = T[] | ApiList<T>;

interface AcademicTerm {
  id: number;
  number: number;
  academic_year: string | number;
}

interface LearnerTrendPoint {
  term: string;
  termNumber: number;
  currentYear: number | null;
  previousYear: number | null;
}

interface AssessmentRow {
  subject: string;
  level: string;
  midtermAverage: number | null;
  endOfTermAverage: number | null;
}

interface ChartRow {
  name: string;
  midterm: number | null;
  endOfTerm: number | null;
}

interface CampusChartRow {
  name: string;
  values: Record<string, number | null>;
}

interface CampusChartSeries {
  key: string;
  label: string;
  color: string;
}

interface ComparisonRow {
  name: string;
  midterm: number | null;
  endOfTerm: number | null;
}

interface ComparisonTableRow extends ComparisonRow {
  previous: ComparisonRow | null;
  otherCampus: ComparisonRow | null;
}

const SERIES_COLOURS = {
  midterm: "#79c6e8",
  endOfTerm: "#203468",
};

const CAMPUS_SERIES_COLOURS = ["#2aa4dd", "#203468", "#79c6e8", "#f2b719"];

function getApiResults<T>(data: ApiResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results ?? [];
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

const formatCount = (value: unknown): string => {
  const parsed = toNumber(value);
  return parsed === null ? "—" : parsed.toLocaleString();
};

const normalise = (value: string | undefined): string => {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ");
};

const getComparisonCampus = (campus: string): string => {
  const value = normalise(campus);

  if (value.includes("kibuli")) return "buwaate";
  if (value.includes("buwaate")) return "kibuli";

  return "";
};

export function isInternationalCampus(campus: string): boolean {
  const value = normalise(campus);

  return (
    value.includes("international") ||
    value.includes("gis") ||
    value.includes("kansanga")
  );
}

const average = (values: Array<number | null>): number | null => {
  const available = values.filter(
    (value): value is number => value !== null,
  );

  return available.length
    ? available.reduce((total, value) => total + value, 0) / available.length
    : null;
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
    return (
      actual.includes("o level") ||
      actual.includes("o-level") ||
      actual === "olevel" ||
      actual === "o"
    );
  }

  if (selected.includes("a level") || selected === "a") {
    return (
      actual.includes("a level") ||
      actual.includes("a-level") ||
      actual === "alevel" ||
      actual === "a"
    );
  }

  if (selected.includes("secondary")) {
    return (
      actual.includes("secondary") ||
      actual.includes("o level") ||
      actual.includes("a level") ||
      actual === "olevel" ||
      actual === "alevel"
    );
  }

  return actual === selected;
};

const getAssessmentRows = (
  tests: TestResult[],
  selectedSection: string,
): AssessmentRow[] => {
  return tests
    .filter((test) =>
      matchesSection(
        getRecordLevel(
          test.level_display || test.level || test.section_display || test.section,
          test.class_level_display || test.class_level,
        ),
        selectedSection,
      ),
    )
    .map((test) => ({
      subject: test.subject?.trim() || "Unnamed subject",
      level: getRecordLevel(
        test.level_display || test.level || test.section_display || test.section,
        test.class_level_display || test.class_level,
      ),
      midtermAverage: toNumber(test.test_1_average),
      endOfTermAverage: toNumber(test.test_2_average),
    }))
    .sort((a, b) => {
      const aAverage = a.endOfTermAverage ?? a.midtermAverage;
      const bAverage = b.endOfTermAverage ?? b.midtermAverage;
      if (aAverage === null) return 1;
      if (bAverage === null) return -1;

      return aAverage - bAverage;
    });
};

const getClassChartRows = (
  tests: TestResult[],
  classResults: ClassAssessment[],
  selectedSection: string,
): ChartRow[] => {
  const apiRows = classResults
    .map((item) => ({
      name: item.class_level_display?.trim() || item.class_level?.trim() || "",
      level: getRecordLevel(
        item.level_display || item.level,
        item.class_level_display || item.class_level,
      ),
      midterm: toNumber(item.test_1_average),
      endOfTerm: toNumber(item.test_2_average),
    }))
    .filter((row) =>
      row.level === "—" || matchesSection(row.level, selectedSection),
    )
    .filter((row) => row.name);

  if (apiRows.length > 0) {
    return apiRows.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true }),
    );
  }

  const grouped = new Map<string, TestResult[]>();
  tests
    .filter((test) =>
      matchesSection(
        getRecordLevel(
          test.level_display || test.level || test.section_display || test.section,
          test.class_level_display || test.class_level,
        ),
        selectedSection,
      ),
    )
    .forEach((test) => {
      const className =
        test.class_level_display?.trim() || test.class_level?.trim();
      if (!className) return;
      const group = grouped.get(className) ?? [];
      group.push(test);
      grouped.set(className, group);
    });

  return Array.from(grouped, ([name, group]) => {
    return {
      name,
      midterm: average(group.map((item) => toNumber(item.test_1_average))),
      endOfTerm: average(group.map((item) => toNumber(item.test_2_average))),
    };
  }).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true }),
  );
};

function getClassRows(
  dashboard: DashboardData | undefined,
  selectedSection: string,
): ComparisonRow[] {
  return getClassChartRows(
    dashboard?.tests ?? [],
    dashboard?.by_class ?? dashboard?.classes ?? [],
    selectedSection,
  );
}

function getSubjectRows(
  dashboard: DashboardData | undefined,
  selectedSection: string,
): ComparisonRow[] {
  const grouped = new Map<string, AssessmentRow[]>();
  getAssessmentRows(dashboard?.tests ?? [], selectedSection).forEach((row) => {
    const key = `${normalise(row.level)}::${normalise(row.subject)}`;
    const group = grouped.get(key) ?? [];
    group.push(row);
    grouped.set(key, group);
  });

  return Array.from(grouped.values(), (group) => ({
    name: group[0].subject,
    midterm: average(group.map((row) => row.midtermAverage)),
    endOfTerm: average(group.map((row) => row.endOfTermAverage)),
  })).sort((a, b) => a.name.localeCompare(b.name));
}

export function getSecondaryLevel(label: string): "O Level" | "A Level" | null {
  const value = normalise(label);

  if (
    value.includes("o level") ||
    value.includes("o-level") ||
    value === "o" ||
    value === "olevel" ||
    /(^|\s)s\.?\s*[1-4](\s|$)/.test(value)
  ) {
    return "O Level";
  }

  if (
    value.includes("a level") ||
    value.includes("a-level") ||
    value === "a" ||
    value === "alevel" ||
    /(^|\s)s\.?\s*[56](\s|$)/.test(value)
  ) {
    return "A Level";
  }

  return null;
}

const getRecordLevel = (
  level: string | undefined,
  classLevel: string | undefined,
): string => {
  const explicitLevel = getSecondaryLevel(level ?? "");
  const classLevelGroup = getSecondaryLevel(classLevel ?? "");

  return explicitLevel ?? classLevelGroup ?? level ?? "—";
};

function mergeComparisonRows(
  current: ComparisonRow[],
  previous: ComparisonRow[],
  otherCampus: ComparisonRow[],
): ComparisonTableRow[] {
  const previousByName = new Map(
    previous.map((row) => [normalise(row.name), row]),
  );
  const otherCampusByName = new Map(
    otherCampus.map((row) => [normalise(row.name), row]),
  );

  return current.map((row) => {
    const key = normalise(row.name);
    const previousRow = previousByName.get(key);
    const campusRow = otherCampusByName.get(key);

    return {
      ...row,
      previous: previousRow ?? null,
      otherCampus: campusRow ?? null,
    };
  });
}

function formatDifference(value: number | null, comparison: number | null) {
  if (value === null || comparison === null) return "—";

  const change = value - comparison;
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)} pp`;
}

function DifferenceCell({
  value,
  comparison,
}: {
  value: number | null;
  comparison: number | null;
}) {
  if (value === null || comparison === null) {
    return <span className="academic-analytics__comparison-empty">—</span>;
  }

  const difference = value - comparison;
  const tone =
    difference > 0
      ? "positive"
      : difference < 0
        ? "negative"
        : "neutral";

  return (
    <span className={`academic-analytics__difference ${tone}`}>
      {difference > 0 ? "▲" : difference < 0 ? "▼" : "•"}
      {" "}{formatDifference(value, comparison)}
    </span>
  );
}

function ComparisonTable({
  title,
  rows,
  assessment,
  lowestName,
  campusLabel,
  emptyMessage,
  showCampusComparison,
}: {
  title: string;
  rows: ComparisonTableRow[];
  assessment: AssessmentKey;
  lowestName?: string;
  campusLabel: string;
  emptyMessage: string;
  showCampusComparison: boolean;
}) {
  const valueKey = assessment === "test_1" ? "midterm" : "endOfTerm";

  return (
    <article className="academic-analytics__table-card">
      <header className="academic-analytics__comparison-heading">
        <h3>{title}</h3>
      </header>
      {rows.length ? (
        <div className="academic-analytics__table-wrap">
          <table className="academic-analytics__table academic-analytics__comparison-table">
            <thead>
              <tr>
                <th>{title === "By class" ? "Class" : "Subject"}</th>
                <th>Average mark</th>
                <th>vs last term</th>
                {showCampusComparison && <th>vs {campusLabel}</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const currentValue = row[valueKey];
                const isLowest =
                  lowestName && normalise(row.name) === normalise(lowestName);

                return (
                  <tr key={row.name}>
                    <td className="academic-analytics__comparison-name">
                      {row.name}
                      {isLowest && <small>Lowest</small>}
                    </td>
                    <td>
                      <strong>{formatPercent(currentValue)}</strong>
                    </td>
                    <td>
                      <DifferenceCell
                        value={currentValue}
                        comparison={row.previous?.[valueKey] ?? null}
                      />
                    </td>
                    {showCampusComparison && (
                      <td>
                        <DifferenceCell
                          value={currentValue}
                          comparison={row.otherCampus?.[valueKey] ?? null}
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="academic-analytics__comparison-empty-state">
          {emptyMessage}
        </p>
      )}
    </article>
  );
}

function AssessmentChart({
  rows,
  label,
  highlight,
  emptyMessage,
}: {
  rows: ChartRow[];
  label: string;
  highlight: AssessmentKey;
  emptyMessage: string;
}) {
  return (
    <article className="academic-analytics__chart-card">
      <header className="academic-analytics__chart-header">
        <h3>{label}</h3>
        <span>Average mark, midterm against end of term</span>
      </header>

      {rows.length ? (
        <>
          <div className="academic-analytics__chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rows}
                margin={{ top: 16, right: 8, left: 0, bottom: 4 }}
                barGap={3}
                barCategoryGap="24%"
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-55}
                  textAnchor="end"
                  height={92}
                  tickMargin={8}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 9 }}
                />
                <YAxis
                  domain={[40, 85]}
                  ticks={[40, 55, 70, 85]}
                  tickFormatter={(value: number) => `${value}%`}
                  tickLine={false}
                  axisLine={false}
                  width={42}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
                />
                <ReferenceLine
                  y={60}
                  stroke="#2aa4dd"
                  strokeDasharray="5 5"
                  label={{
                    value: "60% target",
                    position: "insideTopRight",
                    fill: "var(--color-text-muted)",
                    fontSize: 10,
                  }}
                />
                <Tooltip
                  formatter={(value) =>
                    value == null ? "—" : `${Number(value).toFixed(1)}%`
                  }
                  contentStyle={{
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    background: "var(--color-surface)",
                    color: "var(--color-text)",
                    fontSize: 11,
                  }}
                />
                <Bar
                  dataKey="midterm"
                  name="Midterm"
                  fill={SERIES_COLOURS.midterm}
                  fillOpacity={highlight === "test_1" ? 1 : 0.62}
                  maxBarSize={42}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="endOfTerm"
                  name="End of term"
                  fill={SERIES_COLOURS.endOfTerm}
                  fillOpacity={highlight === "test_2" ? 1 : 0.62}
                  maxBarSize={42}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="academic-analytics__legend">
            <span>
              <i style={{ background: SERIES_COLOURS.midterm }} />
              Midterm
            </span>
            <span>
              <i style={{ background: SERIES_COLOURS.endOfTerm }} />
              End of term
            </span>
            <span>
              <i className="academic-analytics__target-key" />
              60% target
            </span>
          </div>
        </>
      ) : (
        <div className="academic-analytics__chart-empty">
          <BookOpen size={19} />
          <p>{emptyMessage}</p>
        </div>
      )}
    </article>
  );
}

function PrimaryCampusChart({
  rows,
  series,
  title,
  highlight,
  emptyMessage,
}: {
  rows: CampusChartRow[];
  series: CampusChartSeries[];
  title: string;
  highlight: AssessmentKey;
  emptyMessage: string;
}) {
  return (
    <article className="academic-analytics__chart-card">
      <header className="academic-analytics__chart-header">
        <h3>{title}</h3>
        <span>
          Average mark · {highlight === "test_1" ? "Midterm" : "End of term"}
        </span>
      </header>
      {rows.length ? (
        <>
          <div className="academic-analytics__chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rows}
                margin={{ top: 16, right: 8, left: 0, bottom: 4 }}
                barGap={3}
                barCategoryGap="24%"
              >
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-55}
                  textAnchor="end"
                  height={92}
                  tickMargin={8}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 9 }}
                />
                <YAxis
                  domain={[40, 85]}
                  ticks={[40, 55, 70, 85]}
                  tickFormatter={(value: number) => `${value}%`}
                  tickLine={false}
                  axisLine={false}
                  width={42}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
                />
                <ReferenceLine
                  y={60}
                  stroke="#2aa4dd"
                  strokeDasharray="5 5"
                />
                <Tooltip
                  formatter={(value) =>
                    value == null ? "—" : `${Number(value).toFixed(1)}%`
                  }
                  contentStyle={{
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    background: "var(--color-surface)",
                    color: "var(--color-text)",
                    fontSize: 11,
                  }}
                />
                {series.map((item) => (
                  <Bar
                    key={item.key}
                    dataKey={`values.${item.key}`}
                    name={item.label}
                    fill={item.color}
                    maxBarSize={42}
                    isAnimationActive={false}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="academic-analytics__legend">
            {series.map((item) => (
              <span key={item.key}>
                <i style={{ background: item.color }} />
                {item.label}
              </span>
            ))}
            <span>
              <i className="academic-analytics__target-key" />
              60% target
            </span>
          </div>
        </>
      ) : (
        <div className="academic-analytics__chart-empty">
          <BookOpen size={19} />
          <p>{emptyMessage}</p>
        </div>
      )}
    </article>
  );
}

function AllCampusesPrimaryAnalytics({
  filters,
}: {
  filters: AcademicFilterValues;
}) {
  const [highlight, setHighlight] = useState<AssessmentKey>("test_1");
  const schoolsQuery = useQuery({
    queryKey: ["academic-primary-schools"],
    queryFn: async ({ signal }) => {
      const response = await api.get<ApiResponse<AcademicSchool>>(
        "/academics/schools/",
        { signal },
      );
      return getApiResults(response.data).filter((school) =>
        normalise(school.level).includes("primary"),
      );
    },
    staleTime: 60_000,
    retry: false,
  });
  const schools = schoolsQuery.data ?? [];
  const dashboardQueries = useQueries({
    queries: schools.map((school) => ({
      queryKey: [
        "academic-primary-school-dashboard",
        school.id,
        filters.term,
        filters.year,
      ],
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        const params: { school: number; level: string; term?: number; year?: string } = {
          school: school.id,
          level: "primary",
        };
        if (/^\d+$/.test(filters.term) && Number(filters.term) > 0) {
          params.term = Number(filters.term);
        }
        if (/^\d{4}$/.test(filters.year)) {
          params.year = filters.year;
        }
        const response = await api.get<DashboardData>(
          "/academics/performance/dashboard/",
          { params, signal },
        );
        return response.data;
      },
      staleTime: 10_000,
      retry: false as const,
    })),
  });

  const chartData = useMemo(() => {
    const campusMap = new Map<
      string,
      {
        label: string;
        classValues: Map<string, number[]>;
        subjectValues: Map<string, number[]>;
      }
    >();

    schools.forEach((school, index) => {
      const campusKey =
        normalise(school.campus) || `school-${school.id}`;
      const campusLabel =
        school.campus_display?.trim() ||
        (school.campus
          ? `${school.campus[0].toUpperCase()}${school.campus.slice(1)}`
          : school.name);
      const campus = campusMap.get(campusKey) ?? {
        label: campusLabel,
        classValues: new Map<string, number[]>(),
        subjectValues: new Map<string, number[]>(),
      };
      const dashboard = dashboardQueries[index]?.data;
      const selectedKey = highlight === "test_1" ? "midterm" : "endOfTerm";

      getClassRows(dashboard, "primary").forEach((row) => {
        const value = row[selectedKey];
        if (value === null) return;
        const values = campus.classValues.get(row.name) ?? [];
        values.push(value);
        campus.classValues.set(row.name, values);
      });

      getSubjectRows(dashboard, "primary").forEach((row) => {
        const value = row[selectedKey];
        if (value === null) return;
        const values = campus.subjectValues.get(row.name) ?? [];
        values.push(value);
        campus.subjectValues.set(row.name, values);
      });

      campusMap.set(campusKey, campus);
    });

    const series = Array.from(campusMap, ([key, campus], index) => ({
      key,
      label: campus.label,
      color: CAMPUS_SERIES_COLOURS[index % CAMPUS_SERIES_COLOURS.length],
    }));

    const buildRows = (
      field: "classValues" | "subjectValues",
    ): CampusChartRow[] => {
      const names = new Set<string>();
      campusMap.forEach((campus) => {
        campus[field].forEach((_values, name) => names.add(name));
      });

      return Array.from(names)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((name) => ({
          name,
          values: Object.fromEntries(
            Array.from(campusMap, ([key, campus]) => {
              const values = campus[field].get(name) ?? [];
              return [
                key,
                values.length
                  ? values.reduce((total, value) => total + value, 0) /
                      values.length
                  : null,
              ];
            }),
          ),
        }));
    };

    return {
      series,
      classRows: buildRows("classValues"),
      subjectRows: buildRows("subjectValues"),
    };
  }, [dashboardQueries, filters.term, filters.year, highlight, schools]);

  const hasError =
    schoolsQuery.isError || dashboardQueries.some((query) => query.isError);
  const isLoading =
    schoolsQuery.isLoading || dashboardQueries.some((query) => query.isLoading);

  return (
    <section
      className="academic-analytics"
      aria-labelledby="academic-analytics-title"
    >
      <div className="academic-analytics__header">
        <div>
          <h2 id="academic-analytics-title">
            Internal assessments · by class and by subject
          </h2>
          <p>
            All campuses · Primary
            {filters.term ? ` · Term ${filters.term}` : ""}
            {filters.year ? ` · ${filters.year}` : ""}
          </p>
        </div>
        <div
          className="academic-analytics__switch"
          role="group"
          aria-label="Emphasise assessment period"
        >
          <button
            type="button"
            className={highlight === "test_1" ? "is-active" : ""}
            aria-pressed={highlight === "test_1"}
            onClick={() => setHighlight("test_1")}
          >
            Midterm
          </button>
          <button
            type="button"
            className={highlight === "test_2" ? "is-active" : ""}
            aria-pressed={highlight === "test_2"}
            onClick={() => setHighlight("test_2")}
          >
            End of term
          </button>
        </div>
      </div>
      {hasError ? (
        <div className="academic-analytics__state academic-analytics__state--error" role="alert">
          <AlertCircle size={19} />
          <span>Unable to load primary assessment data for all campuses.</span>
        </div>
      ) : isLoading ? (
        <div className="academic-analytics__state" role="status">
          Loading primary assessment results...
        </div>
      ) : chartData.classRows.length === 0 &&
        chartData.subjectRows.length === 0 ? (
        <div className="academic-analytics__state">
          No primary assessment results are available for these filters.
        </div>
      ) : (
        <div className="academic-analytics__chart-grid academic-analytics__secondary-chart-grid">
          <PrimaryCampusChart
            rows={chartData.classRows}
            series={chartData.series}
            title="By class"
            highlight={highlight}
            emptyMessage="Primary class results are not available for these filters."
          />
          <PrimaryCampusChart
            rows={chartData.subjectRows}
            series={chartData.series}
            title="By subject"
            highlight={highlight}
            emptyMessage="Primary subject results are not available for these filters."
          />
        </div>
      )}
    </section>
  );
}

function PrimaryCampusInsights({
  filters,
}: {
  filters: AcademicFilterValues;
}) {
  const termsQuery = useQuery({
    queryKey: ["primary-campus-insight-terms"],
    queryFn: async ({ signal }) => {
      const response = await api.get<ApiResponse<AcademicTerm>>(
        "/academics/terms/",
        { signal },
      );
      return getApiResults(response.data);
    },
    staleTime: 60_000,
    retry: false,
  });

  const terms = termsQuery.data ?? [];
  const selectedTerm = terms.find(
    (term) => String(term.id) === filters.term,
  );
  const selectedYear =
    filters.year || String(selectedTerm?.academic_year ?? "");
  const priorYearNumber = Number(selectedYear) - 1;
  const priorYear = Number.isFinite(priorYearNumber)
    ? String(priorYearNumber)
    : "";
  const currentYearTerms = terms.filter(
    (term) => String(term.academic_year) === selectedYear,
  );
  const previousYearTerms = terms.filter(
    (term) => String(term.academic_year) === priorYear,
  );
  const trendTerms = [...currentYearTerms, ...previousYearTerms];
  const trendQueries = useQueries({
    queries: trendTerms.map((term) => ({
      queryKey: [
        "primary-campus-learner-trend",
        filters.campus,
        term.id,
      ],
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        const response = await api.get<DashboardData>(
          "/academics/performance/dashboard/",
          {
            params: {
              campus: filters.campus,
              level: "primary",
              term: term.id,
            },
            signal,
          },
        );
        return response.data;
      },
      staleTime: 10_000,
      retry: false as const,
      enabled: Boolean(filters.campus && selectedYear),
    })),
  });

  const learnerTrend = useMemo<LearnerTrendPoint[]>(
    () =>
      [1, 2, 3].map((number) => {
        const currentIndex = trendTerms.findIndex(
          (term) =>
            term.number === number &&
            String(term.academic_year) === selectedYear,
        );
        const previousIndex = trendTerms.findIndex(
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
                  trendQueries[currentIndex].data?.summary?.students_assessed,
                )
              : null,
          previousYear:
            previousIndex >= 0
              ? toNumber(
                  trendQueries[previousIndex].data?.summary?.students_assessed,
                )
              : null,
        };
      }),
    [trendTerms, trendQueries, selectedYear, priorYear],
  );

  const dataLoading =
    termsQuery.isLoading || trendQueries.some((query) => query.isLoading);
  const dataError =
    termsQuery.isError || trendQueries.some((query) => query.isError);
  const selectedTrend = learnerTrend.find(
    (point) => point.termNumber === selectedTerm?.number,
  );
  const learnerDifference =
    selectedTrend?.currentYear != null &&
    selectedTrend.previousYear != null
      ? selectedTrend.currentYear - selectedTrend.previousYear
      : null;

  return (
    <div className="academic-analytics__secondary-insights">
      <article className="academic-analytics__table-card academic-analytics__insight-card">
        <h3>Learners assessed</h3>
        {termsQuery.isError ? (
          <p role="alert">Unable to load term history for this campus.</p>
        ) : dataLoading ? (
          <p>Loading learner history...</p>
        ) : dataError ? (
          <p role="alert">Unable to load learner assessment history.</p>
        ) : learnerTrend.some(
            (point) =>
              point.currentYear !== null || point.previousYear !== null,
          ) ? (
          <>
            <div className="academic-analytics__insight-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={learnerTrend}
                  margin={{ top: 14, right: 12, bottom: 4, left: -12 }}
                >
                  <CartesianGrid vertical={false} stroke="#dce4ef" />
                  <XAxis
                    dataKey="term"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    allowDecimals={false}
                    tick={{ fill: "var(--color-text-muted)", fontSize: 9 }}
                  />
                  <Tooltip
                    formatter={(value) => [
                      value == null ? "—" : Number(value).toLocaleString(),
                      "Learners assessed",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="currentYear"
                    name={selectedYear}
                    stroke="#2aa4dd"
                    strokeWidth={3}
                    connectNulls
                    dot={{ r: 4 }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="previousYear"
                    name={priorYear}
                    stroke="#9aa8bd"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    connectNulls
                    dot={{ r: 3 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="academic-analytics__insight-legend">
              <span><i className="current" />{selectedYear}</span>
              <span><i className="previous" />{priorYear}</span>
            </div>
            {learnerDifference !== null && selectedTerm && (
              <p>
                Term {selectedTerm.number}:{" "}
                <strong
                  className={
                    learnerDifference >= 0
                      ? "academic-analytics__difference positive"
                      : "academic-analytics__difference negative"
                  }
                >
                  {learnerDifference > 0 ? "+" : ""}
                  {learnerDifference.toLocaleString()} learners
                </strong>{" "}
                against Term {selectedTerm.number} {priorYear}.
              </p>
            )}
          </>
        ) : (
          <p>Learner history is unavailable for these academic years.</p>
        )}
      </article>
      <article className="academic-analytics__table-card academic-analytics__insight-card">
        <h3>Girls vs boys</h3>
        <p>
          Gender-disaggregated assessment counts and averages are not provided
          by the performance dashboard API.
        </p>
      </article>
    </div>
  );
}

export function AcademicAnalytics({
  filters,
}: AcademicAnalyticsProps) {
  const [highlight, setHighlight] = useState<AssessmentKey>("test_1");

  const dashboardQuery =
    useAcademicPerformanceDashboard(filters);

  const dashboard = dashboardQuery.data as
    | DashboardData
    | undefined;

  const isPrimary = normalise(filters.section).includes("primary");
  const isSecondary = normalise(filters.section).includes("secondary");
  const isAllCampusesSecondary =
    isSecondary &&
    (!filters.school.trim() ||
      normalise(filters.school) === "all schools") &&
    (!filters.campus.trim() ||
      normalise(filters.campus) === "all campuses");
  const isAllCampusesPrimary =
    isPrimary &&
    (!filters.school.trim() ||
      normalise(filters.school) === "all schools") &&
    (!filters.campus.trim() ||
      normalise(filters.campus) === "all campuses");
  const isInternational = isInternationalCampus(filters.campus);
  const comparisonCampus = getComparisonCampus(filters.campus);
  const previousTermId = dashboard?.compared_with?.id;

  const previousTermFilters = {
    ...filters,
    term: previousTermId ? String(previousTermId) : "",
    year: "",
  };
  const campusComparisonFilters = {
    ...filters,
    school: "",
    campus: comparisonCampus,
  };
  const previousQuery = useAcademicPerformanceDashboard(
    previousTermFilters,
    Boolean(previousTermId),
  );
  const campusQuery = useAcademicPerformanceDashboard(
    campusComparisonFilters,
    Boolean(comparisonCampus) && isPrimary,
  );

  const currentClassRows = useMemo(
    () => getClassRows(dashboard, filters.section),
    [dashboard, filters.section],
  );
  const previousClassRows = useMemo(
    () => getClassRows(previousQuery.data as DashboardData | undefined, filters.section),
    [previousQuery.data, filters.section],
  );
  const campusClassRows = useMemo(
    () => getClassRows(campusQuery.data as DashboardData | undefined, filters.section),
    [campusQuery.data, filters.section],
  );
  const currentSubjectRows = useMemo(
    () => getSubjectRows(dashboard, filters.section),
    [dashboard, filters.section],
  );
  const previousSubjectRows = useMemo(
    () => getSubjectRows(previousQuery.data as DashboardData | undefined, filters.section),
    [previousQuery.data, filters.section],
  );
  const campusSubjectRows = useMemo(
    () => getSubjectRows(campusQuery.data as DashboardData | undefined, filters.section),
    [campusQuery.data, filters.section],
  );
  const classRows = mergeComparisonRows(
    currentClassRows,
    previousClassRows,
    campusClassRows,
  );
  const subjectRows = mergeComparisonRows(
    currentSubjectRows,
    previousSubjectRows,
    campusSubjectRows,
  );
  const lowestRow = [...currentSubjectRows]
    .filter((row) => row[highlight === "test_1" ? "midterm" : "endOfTerm"] !== null)
    .sort(
      (a, b) =>
        (a[highlight === "test_1" ? "midterm" : "endOfTerm"] ?? 0) -
        (b[highlight === "test_1" ? "midterm" : "endOfTerm"] ?? 0),
    )[0];
  const subjectChartRows: ChartRow[] = currentSubjectRows;
  const hasAssessmentData =
    currentSubjectRows.some(
      (row) => row.midterm !== null || row.endOfTerm !== null,
    ) ||
    currentClassRows.some(
      (row) => row.midterm !== null || row.endOfTerm !== null,
    );
  const secondaryGroups = getSecondaryGroups(
    dashboard,
    previousQuery.data as DashboardData | undefined,
  );
  const currentAssessed = toNumber(dashboard?.summary?.students_assessed);
  const previousAssessed = toNumber(
    (previousQuery.data as DashboardData | undefined)?.summary
      ?.students_assessed,
  );
  const assessedChange =
    currentAssessed !== null && previousAssessed !== null
      ? currentAssessed - previousAssessed
      : null;

  const selectedCampus = filters.campus.trim() || "All campuses";
  const selectedSection = filters.section.trim() || "All sections";
  const selectedTerm =
    dashboard?.term?.label ||
    (filters.term ? "Selected term" : "All terms");
  const selectedYear = filters.year.trim();
  const filterContext = [
    selectedCampus,
    selectedSection,
    selectedTerm,
    selectedYear,
  ].filter(Boolean).join(" · ");

  const campusLabel = comparisonCampus
    ? comparisonCampus[0].toUpperCase() + comparisonCampus.slice(1)
    : "other campus";

  if (isAllCampusAndSectionSelection(filters)) {
    return <AllCampusesAssessmentOverview filters={filters} />;
  }
  if (isAllCampusesPrimary) {
    return <AllCampusesPrimaryAnalytics filters={filters} />;
  }

  return (
    <section
      className="academic-analytics"
      aria-labelledby="academic-analytics-title"
    >
      <div className="academic-analytics__header">
        <div>
          <h2 id="academic-analytics-title">
            Internal assessments · by class and by subject
          </h2>
          <p>{filterContext}</p>
        </div>

        <div
          className="academic-analytics__switch"
          role="group"
          aria-label="Emphasise assessment period"
        >
          <button
            type="button"
            className={
              highlight === "test_1" ? "is-active" : ""
            }
            aria-pressed={highlight === "test_1"}
            onClick={() => setHighlight("test_1")}
          >
            Midterm
          </button>

          <button
            type="button"
            className={
              highlight === "test_2" ? "is-active" : ""
            }
            aria-pressed={highlight === "test_2"}
            onClick={() => setHighlight("test_2")}
          >
            End of term
          </button>
        </div>
      </div>

      {(previousQuery.isError || campusQuery.isError) && (
        <p className="academic-analytics__comparison-warning" role="status">
          Comparison data unavailable
          {previousQuery.isError && " for the previous term"}
          {previousQuery.isError && campusQuery.isError && " and"}
          {campusQuery.isError && ` for ${campusLabel}`}
          .
        </p>
      )}

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
              No internal assessment results
              available
            </strong>

            <p>
              There are no recorded assessment results for {filterContext}.
            </p>
          </div>
        </div>
      ) : (
        <>
          {isInternational ? (
            <>
              <div className="academic-analytics__comparison-grid">
                <ComparisonTable
                  title="By class"
                  rows={classRows}
                  assessment={highlight}
                  campusLabel={campusLabel}
                  emptyMessage="Class-level averages are not available for GIS Kansanga for this term."
                  showCampusComparison={false}
                />
                <ComparisonTable
                  title="By subject"
                  rows={subjectRows}
                  assessment={highlight}
                  lowestName={lowestRow?.name}
                  campusLabel={campusLabel}
                  emptyMessage="Subject averages are not available for GIS Kansanga for this term."
                  showCampusComparison={false}
                />
              </div>
              <div className="academic-analytics__secondary-insights">
                <article className="academic-analytics__table-card academic-analytics__insight-card">
                  <h3>Learners assessed</h3>
                  <strong>{formatCount(currentAssessed)}</strong>
                  {assessedChange === null ? (
                    <p>Previous-term learner counts are unavailable.</p>
                  ) : (
                    <p>
                      {assessedChange > 0 ? "+" : ""}
                      {assessedChange.toLocaleString()} learners vs last term
                    </p>
                  )}
                  <div className="academic-analytics__insight-placeholder">
                    Term-by-term learner history is not available from the dashboard data.
                  </div>
                </article>
                <article className="academic-analytics__table-card academic-analytics__insight-card">
                  <h3>Girls vs boys</h3>
                  <p>
                    Gender-disaggregated assessment counts and averages are not
                    available from the dashboard data.
                  </p>
                  <div className="academic-analytics__insight-placeholder">
                    Gender performance breakdown
                  </div>
                </article>
              </div>
            </>
          ) : isPrimary ? (
            <>
              <div className="academic-analytics__comparison-grid">
                <ComparisonTable
                  title="By class"
                  rows={classRows}
                  assessment={highlight}
                  campusLabel={campusLabel}
                  emptyMessage="Class-level averages are not available for these filters."
                  showCampusComparison={Boolean(comparisonCampus)}
                />
                <ComparisonTable
                  title="By subject"
                  rows={subjectRows}
                  assessment={highlight}
                  lowestName={lowestRow?.name}
                  campusLabel={campusLabel}
                  emptyMessage="Subject averages are not available for these filters."
                  showCampusComparison={Boolean(comparisonCampus)}
                />
              </div>
              {["kibuli", "buwaate"].includes(normalise(filters.campus)) && (
                <PrimaryCampusInsights filters={filters} />
              )}
            </>
          ) : isSecondary && isAllCampusesSecondary ? (
            <div className="academic-analytics__secondary-groups">
              {secondaryGroups.map((group) => (
                <section
                  className="academic-analytics__secondary-group"
                  key={group.level}
                  aria-label={group.level}
                >
                  <h3>{group.level}</h3>
                  <div className="academic-analytics__chart-grid academic-analytics__secondary-chart-grid">
                    <AssessmentChart
                      rows={group.classRows}
                      label="By class"
                      highlight={highlight}
                      emptyMessage={`Class-level averages are not available for ${group.level} across all campuses for this term.`}
                    />
                    <AssessmentChart
                      rows={group.subjectRows}
                      label="By subject"
                      highlight={highlight}
                      emptyMessage={`Subject averages are not available for ${group.level} across all campuses for this term.`}
                    />
                  </div>
                </section>
              ))}
            </div>
          ) : isSecondary ? (
            <>
              <div className="academic-analytics__secondary-groups">
                {secondaryGroups.map((group) => (
                  <section
                    className="academic-analytics__secondary-group"
                    key={group.level}
                    aria-label={group.level}
                  >
                    <h3>{group.level}</h3>
                    <div className="academic-analytics__comparison-grid">
                      <ComparisonTable
                        title="By class"
                        rows={group.classRows}
                        assessment={highlight}
                        campusLabel={campusLabel}
                        emptyMessage={`No ${group.level} class assessment records are available for this school and term.`}
                        showCampusComparison={false}
                      />
                      <ComparisonTable
                        title="By subject"
                        rows={group.subjectRows}
                        assessment={highlight}
                        lowestName={group.lowestSubject}
                        campusLabel={campusLabel}
                        emptyMessage={`No ${group.level} subject assessment records are available for this school and term.`}
                        showCampusComparison={false}
                      />
                    </div>
                  </section>
                ))}
              </div>
              <div className="academic-analytics__secondary-insights">
                <article className="academic-analytics__table-card academic-analytics__insight-card">
                  <h3>Learners assessed</h3>
                  <strong>{formatCount(currentAssessed)}</strong>
                  {assessedChange === null ? (
                    <p>Previous-term learner counts are unavailable.</p>
                  ) : (
                    <p>
                      {assessedChange > 0 ? "+" : ""}
                      {assessedChange.toLocaleString()} learners vs last term
                    </p>
                  )}
                  <div className="academic-analytics__insight-placeholder">
                    Term-by-term history is not available from the dashboard data.
                  </div>
                </article>
                <article className="academic-analytics__table-card academic-analytics__insight-card">
                  <h3>Girls vs boys</h3>
                  <p>
                    Gender-disaggregated assessment counts and averages are not
                    available from the dashboard data.
                  </p>
                  <div className="academic-analytics__insight-placeholder">
                    Gender performance breakdown
                  </div>
                </article>
              </div>
            </>
          ) : (
            <>
              <div className="academic-analytics__chart-grid">
                <AssessmentChart
                  rows={currentClassRows}
                  label="By class"
                  highlight={highlight}
                  emptyMessage="Class-level assessment results are not available for these filters."
                />
                <AssessmentChart
                  rows={subjectChartRows}
                  label="By subject"
                  highlight={highlight}
                  emptyMessage="Subject assessment results are not available for these filters."
                />
              </div>
              {lowestRow && (
                <p className="academic-analytics__note">
                  <TrendingDown size={15} />
                  Weakest subject: <strong>{lowestRow.name}</strong>
                </p>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}