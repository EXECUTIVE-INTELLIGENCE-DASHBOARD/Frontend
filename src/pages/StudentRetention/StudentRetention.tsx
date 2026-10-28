import { useEffect, useState } from "react";
import { AlertTriangle, Check, Users } from "lucide-react";

import { AcademicFilters } from "../../components/filters/AcademicFilters";
import type { AcademicFilterValues } from "../../components/filters/academicFilters.types";
import {
  campusForValue,
  defaultFilters,
  yearIdForValue,
} from "../AdmissionsEnrollment/admissionsEnrollment.data";
import { enrollmentTrend } from "../AdmissionsEnrollment/admissionsEnrollment.trends";
import { EntrantRetentionTrendCard } from "../AdmissionsEnrollment/EnrollmentTrends";

import { GenderRetentionCard } from "./GenderRetentionCard";
import { RetentionMetricCard } from "./RetentionMetricCard";

import {
  allCampusesLabel,
  formatMetric,
  formatRate,
  summaryForCampus,
} from "./studentRetention.data";

import {
  fetchStudentRetention,
  type RetentionDashboardData,
} from "./studentRetention.api";

import type { RetentionSummary } from "./studentRetention.types";

import "../../palette.css";
import "./StudentRetention.css";

const unavailableSummary: RetentionSummary = {
  reEnrolled: null,
  rate: null,
  atRisk: null,
};

interface RetentionState {
  data: RetentionDashboardData | null;
  error: string | null;
  isPending: boolean;
}

export function StudentRetention() {
  const [filters, setFilters] = useState<AcademicFilterValues>({
    school: "",
    campus: "",
    section: "",
    term: "",
    year: "",
  });

  const [state, setState] = useState<RetentionState>({
    data: null,
    error: null,
    isPending: true,
  });

  const [retryCount, setRetryCount] = useState(0);

  // Reload the dashboard whenever a filter changes.
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadRetentionData() {
      setState((previous) => ({
        ...previous,
        error: null,
        isPending: true,
      }));

      try {
        const apiFilters = {
          ...(filters.school && {
            school: Number(filters.school),
          }),
          ...(filters.campus && {
            campus: filters.campus,
          }),
          ...(filters.section && {
            level: filters.section,
          }),
          ...(filters.term && {
            term: Number(filters.term),
          }),
          ...(filters.year && {
            academic_year: filters.year,
          }),
        };

        const data = await fetchStudentRetention(
          apiFilters,
          controller.signal,
        );

        if (active) {
          setState({
            data,
            error: null,
            isPending: false,
          });
        }
      } catch (error: unknown) {
        if (!active || controller.signal.aborted) {
          return;
        }

        setState((previous) => ({
          ...previous,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load student retention data.",
          isPending: false,
        }));
      }
    }

    void loadRetentionData();

    return () => {
      active = false;
      controller.abort();
    };
  }, [
    filters.school,
    filters.campus,
    filters.section,
    filters.term,
    filters.year,
    retryCount,
  ]);

  const { data, error, isPending } = state;

  // Use the selected campus for the displayed retention data.
  const campus = filters.campus || allCampusesLabel;

  const summary = data
    ? summaryForCampus(data, campus)
    : unavailableSummary;

  const trendPoints = enrollmentTrend(
    {
      ...defaultFilters,
      campus: campusForValue(filters.campus),
      section: filters.section,
      year: yearIdForValue(filters.year) ?? defaultFilters.year,
    },
    "term",
  );

  const reasons = data?.withdrawal_reasons ?? [];
  const withdrawalsTotal = data?.withdrawals_total ?? null;

  return (
    <div className="sr-page">
      <div className="sr-toolbar">
        <AcademicFilters
          values={filters}
          onChange={setFilters}
        />
      </div>

      {isPending && (
        <p role="status">
          Loading student retention data...
        </p>
      )}

      {!isPending && error && (
        <div className="sr-error">
          <p role="alert">
            Unable to load retention data: {error}
          </p>

          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Retry
          </button>
        </div>
      )}

      {!error && (
        <>
          <div className="sr-metrics">
            <RetentionMetricCard
              label="Total Re-enrolled Students"
              value={formatMetric(summary.reEnrolled)}
              icon={Users}
              tone="navy"
            />

            <RetentionMetricCard
              label="Re-enrollment Rate"
              value={formatRate(summary.rate)}
              icon={Check}
              tone="sky"
            />

            <RetentionMetricCard
              label="At-Risk Retention"
              value={formatMetric(summary.atRisk)}
              icon={AlertTriangle}
              tone="amber"
            />
          </div>

          {!isPending && data && (
            <div className="sr-grid">
              <EntrantRetentionTrendCard points={trendPoints} />

              <GenderRetentionCard
                reasons={reasons}
                total={withdrawalsTotal}
              />
            </div>
          )}

          {!isPending && data && summary.reEnrolled === null && (
            <p>
              No retention records match the selected filters.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default StudentRetention;