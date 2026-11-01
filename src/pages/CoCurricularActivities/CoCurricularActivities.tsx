import { useEffect, useState } from "react";
import {
  CalendarDays,
  UserCheck,
  ListChecks,
  UsersRound,
} from "lucide-react";

import {
  academicsApi,
  type CoCurricularDashboardData,
} from "../../api/academics.api";

import { EngagementMetricCard } from "./EngagementMetricCard";
import { EngagementTableCard } from "./EngagementTableCard";
import { EngagementBreakdowns } from "./EngagementBreakdowns";

import { AcademicFilters } from "../../components/filters/AcademicFilters";
import type { AcademicFilterValues } from "../../components/filters/academicFilters.types";

import "./CoCurricularActivities.css";

export function CoCurricularActivities() {
  const [dashboard, setDashboard] =
    useState<CoCurricularDashboardData | null>(null);

  const [filters, setFilters] = useState<AcademicFilterValues>({
    school: "",
    campus: "",
    section: "",
    term: "",
    year: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const apiFilters = {
          ...(filters.campus && { campus: filters.campus }),
          ...(filters.section && { level: filters.section }),
          ...(filters.school && { school: Number(filters.school) }),
          ...(filters.term && { term: Number(filters.term) }),
        };

        const data = await academicsApi.getCoCurricularDashboard(
          apiFilters,
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setDashboard(data);
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Co-curricular dashboard request failed:", err);

        setError("Unable to load co-curricular dashboard data.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => controller.abort();
  }, [filters, retryCount]);

  return (
    <div className="cc-page">
      <AcademicFilters
        values={filters}
        onChange={setFilters}
      />

      {loading && (
        <p role="status">Loading co-curricular activities...</p>
      )}

      {!loading && error && (
        <div>
          <p role="alert">{error}</p>

          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && dashboard && (
        <div className="cc-content">
          <section className="cc-metrics" aria-label="Co-curricular summary">
            <EngagementMetricCard
              label="Total Clubs"
              value={String(dashboard.summary.total_clubs)}
              icon={UsersRound}
              tone="navy"
            />
            <EngagementMetricCard
              label="Total Activities"
              value={String(dashboard.summary.activities_offered)}
              icon={ListChecks}
              tone="navy"
            />
            <EngagementMetricCard
              label="Total Events Held"
              value={String(dashboard.summary.events_held)}
              icon={CalendarDays}
              tone="accent"
            />
            <EngagementMetricCard
              label="Participation Rate"
              value={
                dashboard.summary.participation_rate == null
                  ? "N/A"
                  : `${dashboard.summary.participation_rate.toFixed(1)}%`
              }
              icon={UserCheck}
              tone="warning"
            />
          </section>

          <EngagementTableCard activities={dashboard.activities} />

          <section
            className="cc-secondary-stats"
            aria-label="Additional figures"
          >
            <span>
              <strong>
                {dashboard.summary.participation_records.toLocaleString()}
              </strong>
              Participation records
            </span>
            <span>
              <strong>
                {dashboard.summary.active_learners.toLocaleString()}
              </strong>
              Active learners
            </span>
            <span>
              <strong>
                {dashboard.summary.activities_per_participant == null
                  ? "—"
                  : dashboard.summary.activities_per_participant.toFixed(1)}
              </strong>
              Activities per participant
            </span>
          </section>

          <EngagementBreakdowns data={dashboard} />
        </div>
      )}

      {!loading && !error && !dashboard && (
        <p>No dashboard data is available.</p>
      )}
    </div>
  );
}

export default CoCurricularActivities;