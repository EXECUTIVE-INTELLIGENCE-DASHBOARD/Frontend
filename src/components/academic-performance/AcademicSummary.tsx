import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, BookOpen, GraduationCap, TrendingDown, TrendingUp } from "lucide-react";

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
  divisions: { label: string; count: number }[];
}

const EXAMS = [
  {
    key: "ple",
    label: "PLE",
    description: "Primary Leaving Examination",
  },
  {
    key: "uce",
    label: "UCE",
    description: "Uganda Certificate of Education",
  },
  {
    key: "uace",
    label: "UACE",
    description: "Uganda Advanced Certificate",
  },
] as const;

function getResults<T>(data: ApiResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results ?? [];
}

function formatPercent(value: number | null | undefined): string {
  return value == null ? "—" : `${value.toFixed(1)}%`;
}

function formatNumber(value: number | null | undefined): string {
  return value == null ? "—" : value.toLocaleString();
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
            ? `${result.principal_passes ?? 0} principal passes`
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
          .map(([label, count]) => ({ label, count }))
          .sort((a, b) =>
            a.label.localeCompare(b.label, undefined, {
              numeric: true,
            }),
          ),
      };
    })
    .sort((a, b) => a.year - b.year);
}

function ExamCard({
  label,
  description,
  summaries,
}: {
  label: string;
  description: string;
  summaries: ExamSummary[];
}) {
  const latest = summaries[summaries.length - 1];
  const previous = summaries[summaries.length - 2];

  const change =
    latest && previous
      ? latest.passRate - previous.passRate
      : null;

  return (
    <article className="academic-summary__exam-card">
      <div className="academic-summary__exam-heading">
        <div>
          <span className="academic-summary__exam-label">{label}</span>
          <h3>{description}</h3>
        </div>
        <Award size={19} aria-hidden="true" />
      </div>

      {latest ? (
        <>
          <div className="academic-summary__exam-result">
            <div>
              <strong>{Math.round(latest.passRate)}%</strong>
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
              <span>Historical pass rate</span>
              <span>{summaries.length} years</span>
            </div>

            <div className="academic-summary__history-bars">
              {summaries.map((item) => (
                <div
                  className="academic-summary__history-item"
                  key={item.year}
                >
                  <span className="academic-summary__history-value">
                    {Math.round(item.passRate)}%
                  </span>

                  <div className="academic-summary__history-track">
                    <span
                      className="academic-summary__history-fill"
                      style={{ height: `${item.passRate}%` }}
                    />
                  </div>

                  <span className="academic-summary__history-year">
                    {item.year}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {latest.divisions.length > 0 && (
            <div className="academic-summary__divisions">
              <span className="academic-summary__divisions-title">
                Candidate divisions
              </span>

              {latest.divisions.slice(0, 4).map((division) => (
                <div
                  className="academic-summary__division"
                  key={division.label}
                >
                  <span>{division.label}</span>
                  <strong>{division.count}</strong>
                </div>
              ))}
            </div>
          )}
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
        <div>
          <span className="academic-summary__exam-label">CAMBRIDGE</span>
          <h3>Cambridge Checkpoint</h3>
        </div>
        <BookOpen size={19} aria-hidden="true" />
      </div>

      <div className="academic-summary__cambridge-content">
        <strong>—</strong>
        <span>30+ out of 50</span>
      </div>

      <p className="academic-summary__empty">
        Cambridge Checkpoint results are not yet available from the connected
        examination data.
      </p>

      <div className="academic-summary__cambridge-bands">
        <span>Performance bands</span>
        <div><span>40–50</span><span>30–39</span></div>
        <div><span>20–29</span><span>Below 20</span></div>
      </div>
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
  const { school, campus, section, year, term } = filters;

  const dashboardQuery = useAcademicPerformanceDashboard(filters);
  const summary = dashboardQuery.data?.summary;

  const examsQuery = useQuery({
    queryKey: [
      "academic-summary-examinations",
      school,
      campus,
      section,
      year,
    ],
    queryFn: async ({ signal }) => {
      const params: Record<string, string> = {};

      if (school) params.school = school;
      if (campus) params.campus = campus;
      if (section) params.level = section;
      if (year) params.year = year;

      const response = await api.get<ApiResponse<ExamResult>>(
        "/academics/national-exam-results/",
        { params, signal },
      );

      return getResults(response.data);
    },
    staleTime: 10_000,
    refetchOnWindowFocus: true,
    retry: false,
  });

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

  const examSummaries = useMemo(
    () => buildExamSummaries(examsQuery.data ?? []),
    [examsQuery.data],
  );

  const selectedTerm = termsQuery.data?.find(
    (item) => String(item.id) === term,
  );

  const isTermThree =
    !term ||
    term === "3" ||
    term.toLowerCase() === "term 3" ||
    selectedTerm?.number === 3;

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

        {!isTermThree ? (
          <div className="academic-summary__term-notice">
            <strong>External examinations are reported in Term 3.</strong>
            <p>
              Select Term 3 to view PLE, UCE, UACE and Cambridge Checkpoint
              examination results. Internal assessments remain available for
              the selected term.
            </p>
          </div>
        ) : examsQuery.isLoading || termsQuery.isLoading ? (
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
                description={exam.description}
                summaries={examSummaries.filter(
                  (item) => item.exam === exam.key,
                )}
              />
            ))}

            <CambridgeCard />
          </div>
        )}
      </section>
    </section>
  );
}