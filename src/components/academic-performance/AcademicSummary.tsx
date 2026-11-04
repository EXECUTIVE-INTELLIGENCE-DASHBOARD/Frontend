import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, GraduationCap, TrendingDown, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../../api/axios";
import { useAcademicPerformanceDashboard } from "./useAcademicPerformanceDashboard";

import type { AcademicFilterValues } from "../filters/academicFilters.types";

import "./AcademicSummary.css";

interface AcademicSummaryProps {
  filters: AcademicFilterValues;
}

interface ExamResult {
  id: number;
  school: number;
  exam: "ple" | "uce" | "uace";
  year: number;
  division?: string;
  division_display?: string;
  principal_passes?: number | null;
  passed: boolean;
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

interface ExamSummary {
  exam: ExamResult["exam"];
  year: number;
  candidates: number;
  passed: number;
  passRate: number;
  divisions: { label: string; count: number; share: number }[];
}

const EXAMS = [
  {
    key: "ple",
    label: "PLE",
  },
  {
    key: "uce",
    label: "UCE",
  },
  {
    key: "uace",
    label: "UACE",
  },
] as const;

const DIVISION_COLOURS = [
  "#203468",
  "#2aa4dd",
  "#79c6e8",
  "#c8d3e6",
  "#f2b719",
  "#75a88b",
];

function getResults<T>(data: ApiResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results ?? [];
}

function formatPercent(value: number | null | undefined): string {
  return value == null ? "—" : `${value.toFixed(1)}%`;
}

function formatNumber(value: number | null | undefined): string {
  return value == null ? "—" : value.toLocaleString();
}

export function shouldShowExternalExams(
  termId: string,
  terms: Term[],
  filters: Pick<AcademicFilterValues, "school" | "campus" | "section">,
): boolean {
  const isSpecificSelection = (value: string) => {
    const selection = value.trim().toLowerCase();
    return Boolean(
      selection &&
        !["all", "all schools", "all campuses", "all sections"].includes(
          selection,
        ),
    );
  };

  if (
    !termId ||
    isSpecificSelection(filters.school) ||
    isSpecificSelection(filters.campus) ||
    isSpecificSelection(filters.section)
  ) {
    return false;
  }

  return terms.some(
    (term) => String(term.id) === termId && term.number === 3,
  );
}

function buildExamSummaries(results: ExamResult[]): ExamSummary[] {
  const groups = new Map<string, ExamResult[]>();

  results.forEach((result) => {
    const key = `${result.exam}-${result.year}`;
    const group = groups.get(key) ?? [];
    group.push(result);
    groups.set(key, group);
  });

  return Array.from(groups.values())
    .map((group) => {
      const first = group[0];
      const passed = group.filter((result) => result.passed).length;
      const divisionCounts = new Map<string, number>();

      group.forEach((result) => {
        const label =
          first.exam === "uace"
            ? (result.principal_passes ?? 0) >= 3
              ? "3 principal"
              : result.principal_passes === 2
                ? "2 principal"
                : result.principal_passes === 1
                  ? "1 principal"
                  : result.passed
                    ? "Subsidiary"
                    : "Fail"
            : result.division_display?.trim() ||
              result.division?.trim() ||
              "Unclassified";

        divisionCounts.set(
          label,
          (divisionCounts.get(label) ?? 0) + 1,
        );
      });

      return {
        exam: first.exam,
        year: first.year,
        candidates: group.length,
        passed,
        passRate: group.length ? (passed / group.length) * 100 : 0,
        divisions: Array.from(divisionCounts.entries())
          .map(([label, count]) => ({
            label,
            count,
            share: group.length ? (count / group.length) * 100 : 0,
          }))
          .sort((a, b) =>
            first.exam === "uace"
              ? ["3 principal", "2 principal", "1 principal", "Subsidiary", "Fail"].indexOf(a.label) -
                ["3 principal", "2 principal", "1 principal", "Subsidiary", "Fail"].indexOf(b.label)
              : a.label.localeCompare(b.label, undefined, { numeric: true }),
          ),
      };
    })
    .sort((a, b) => a.year - b.year);
}

function getExamChartRows(summaries: ExamSummary[]) {
  const labels = Array.from(
    new Set(summaries.flatMap((summary) => summary.divisions.map((item) => item.label))),
  );

  return {
    labels,
    rows: summaries.map((summary) => ({
      year: summary.year,
      ...Object.fromEntries(
        labels.map((label) => [
          label,
          summary.divisions.find((division) => division.label === label)?.share ?? 0,
        ]),
      ),
    })),
  };
}

function ExamCard({
  label,
  summaries,
}: {
  label: string;
  summaries: ExamSummary[];
}) {
  const latest = summaries[summaries.length - 1];
  const previous = summaries[summaries.length - 2];
  const chart = getExamChartRows(summaries);

  const change =
    latest && previous
      ? latest.passRate - previous.passRate
      : null;

  return (
    <article className="academic-summary__exam-card">
      <div className="academic-summary__exam-heading">
        <h3 className="academic-summary__exam-label">{label}</h3>
        {latest && (
          <strong className="academic-summary__exam-rate">
            {Math.round(latest.passRate)}%
          </strong>
        )}
      </div>

      {latest ? (
        <>
          <div className="academic-summary__exam-result">
            <div>
              <span>Pass rate · {latest.year}</span>
            </div>

            {change !== null && (
              <span
                className={`academic-summary__change ${
                  change >= 0 ? "positive" : "negative"
                }`}
              >
                {change >= 0 ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                {change > 0 ? "+" : ""}
                {change.toFixed(1)} pp
              </span>
            )}
          </div>

          <p className="academic-summary__candidates">
            {formatNumber(latest.candidates)} candidates
          </p>

          <div className="academic-summary__history">
            <div className="academic-summary__history-title">
              <span>Results by division</span>
              <span>Pass rate · {Math.round(latest.passRate)}%</span>
            </div>

            {chart.rows.length > 0 ? (
              <div className="academic-summary__chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chart.rows}
                    margin={{ top: 8, right: 2, left: -20, bottom: 0 }}
                    barCategoryGap="22%"
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="var(--color-border)"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="year"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 50, 100]}
                      tickFormatter={(value: number) => `${value}%`}
                      tickLine={false}
                      axisLine={false}
                      width={38}
                      tick={{ fill: "var(--color-text-muted)", fontSize: 9 }}
                    />
                    <Tooltip
                      formatter={(value) => [`${Number(value).toFixed(1)}%`, "Share"]}
                      labelFormatter={(value) => `Year ${value}`}
                      contentStyle={{
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        background: "var(--color-surface)",
                        color: "var(--color-text)",
                        fontSize: 11,
                      }}
                    />
                    {chart.labels.map((division, index) => (
                      <Bar
                        key={division}
                        dataKey={division}
                        stackId="division"
                        fill={DIVISION_COLOURS[index % DIVISION_COLOURS.length]}
                        isAnimationActive={false}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="academic-summary__empty">
                Division breakdowns are not available for these results.
              </p>
            )}

            {chart.labels.length > 0 && (
              <div className="academic-summary__legend" aria-label="Result divisions">
                {chart.labels.map((division, index) => (
                  <span key={division}>
                    <i
                      style={{
                        background: DIVISION_COLOURS[index % DIVISION_COLOURS.length],
                      }}
                    />
                    {division}
                  </span>
                ))}
              </div>
            )}
          </div>

        </>
      ) : (
        <p className="academic-summary__empty">
          No examination results are available for these filters.
        </p>
      )}
    </article>
  );
}

function CambridgeCard() {
  return (
    <article className="academic-summary__exam-card academic-summary__cambridge">
      <div className="academic-summary__exam-heading">
        <h3 className="academic-summary__exam-label">CC</h3>
      </div>

      <div className="academic-summary__cambridge-placeholder" aria-hidden="true" />
    </article>
  );
}

function SummaryKpi({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Award;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="academic-summary__kpi">
      <div className="academic-summary__kpi-icon">
        <Icon size={19} />
      </div>
      <div className="academic-summary__kpi-content">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

export function AcademicSummary({ filters }: AcademicSummaryProps) {
  const { school, campus, section, term } = filters;

  const dashboardQuery = useAcademicPerformanceDashboard(filters);
  const summary = dashboardQuery.data?.summary;

  const termsQuery = useQuery({
    queryKey: ["academic-summary-terms"],
    queryFn: async ({ signal }) => {
      const response = await api.get<ApiResponse<Term>>(
        "/academics/terms/",
        { signal },
      );

      return getResults(response.data);
    },
    staleTime: 60_000,
    retry: false,
  });

  const isExternalExamTerm =
    termsQuery.isSuccess &&
    shouldShowExternalExams(term, termsQuery.data, filters);

  const examsQuery = useQuery({
    queryKey: [
      "academic-summary-examinations",
      school,
      campus,
      section,
    ],
    queryFn: async ({ signal }) => {
      const params: Record<string, string> = {};

      if (school) params.school = school;
      if (campus) params.campus = campus;
      if (section) params.level = section;

      const response = await api.get<ApiResponse<ExamResult>>(
        "/academics/national-exam-results/",
        { params, signal },
      );

      return getResults(response.data);
    },
    staleTime: 10_000,
    refetchOnWindowFocus: true,
    retry: false,
    enabled: isExternalExamTerm,
  });

  const examSummaries = useMemo(
    () => buildExamSummaries(examsQuery.data ?? []),
    [examsQuery.data],
  );

  return (
    <section className="academic-summary" aria-label="Academic performance summary">
      <div
        className="academic-summary__kpis"
        aria-label="Selected academic performance metrics"
      >
        <SummaryKpi
          icon={Award}
          label="Average mark"
          value={formatPercent(summary?.average_mark)}
          detail="Across assessed learners"
        />

        <SummaryKpi
          icon={TrendingUp}
          label="Pass rate"
          value={formatPercent(summary?.student_performance)}
          detail={`${formatNumber(summary?.students_passing)} learners passing`}
        />

        <SummaryKpi
          icon={GraduationCap}
          label="Learners assessed"
          value={formatNumber(summary?.students_assessed)}
          detail="For the selected filters"
        />
      </div>

      {isExternalExamTerm && (
        <section
          className="academic-summary__examinations"
          aria-label="Academic examinations"
        >
          <header className="academic-summary__section-heading">
            <div>
              <h2>National and Cambridge examinations over the years</h2>
              <p>
                Examination outcomes, candidate numbers and historical pass-rate
                trends
              </p>
            </div>
          </header>

          {termsQuery.isError ? (
            <div className="academic-summary__status" role="alert">
              Unable to determine whether external examinations apply to the selected term.
            </div>
          ) : examsQuery.isLoading ? (
            <div className="academic-summary__status">
              Loading examination results...
            </div>
          ) : examsQuery.isError ? (
            <div className="academic-summary__status" role="alert">
              Unable to load national examination results. Please try again.
            </div>
          ) : (
            <div className="academic-summary__exam-grid">
              {EXAMS.map((exam) => (
                <ExamCard
                  key={exam.key}
                  label={exam.label}
                  summaries={examSummaries.filter(
                    (item) => item.exam === exam.key,
                  )}
                />
              ))}

              <CambridgeCard />
            </div>
          )}
        </section>
      )}
    </section>
  );
}