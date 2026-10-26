import { useEffect, useState } from "react";
import { CalendarDays, Globe, Users } from "lucide-react";

import {
  academicsApi,
  type CoCurricularDashboardData,
} from "../../api/academics.api";

import { EngagementMetricCard } from "./EngagementMetricCard";
import { EngagementTableCard } from "./EngagementTableCard";

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
          ...(filters.term && { term: Number(filters.term) }),
          ...(filters.year && { academic_year: filters.year }),
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

        setError("Unable to load co-curricular activities data.");
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
          <div className="cc-metrics acad-summary">
            <EngagementMetricCard
              label="Participation Rate"
              value={
                dashboard.summary.participation_rate == null
                  ? "N/A"
                  : `${dashboard.summary.participation_rate.toFixed(1)}%`
              }
              icon={Globe}
              tone="accent"
            />

            <EngagementMetricCard
              label="Activities Offered"
              value={String(dashboard.summary.activities_offered)}
              icon={CalendarDays}
              tone="navy"
            />

            <EngagementMetricCard
              label="Unique Participants"
              value={String(dashboard.summary.unique_participants)}
              icon={Users}
              tone="warning"
            />
          </div>

          <EngagementTableCard rows={dashboard.activities} />
        </div>
      )}

      {!loading && !error && !dashboard && (
        <p>No dashboard data is available.</p>
      )}
    </div>
  );
}

export default CoCurricularActivities;