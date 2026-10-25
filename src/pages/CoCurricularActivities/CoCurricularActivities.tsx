import { useEffect, useState } from "react";
import { CalendarDays, Globe, Users } from "lucide-react";

import {
  academicsApi,
  type CoCurricularDashboardData,
} from "../../api/academics.api";
import { EngagementMetricCard } from "./EngagementMetricCard";
import { EngagementTableCard } from "./EngagementTableCard";
import SectionFilter from "../../components/filters/sectionFilters";

import "./CoCurricularActivities.css";

export function CoCurricularActivities() {
  const [dashboard, setDashboard] =
    useState<CoCurricularDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const data = await academicsApi.getCoCurricularDashboard(
          {},
          controller.signal,
        );

        setDashboard(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Co-curricular dashboard request failed:", err);
          setError("Unable to load co-curricular activities data.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => controller.abort();
  }, [retryCount]);

  if (loading) {
    return (
      <div className="cc-page">
        <p>Loading co-curricular activities...</p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="cc-page">
        <p role="alert">
          {error ?? "No dashboard data is available."}
        </p>

        <button
          type="button"
          onClick={() => setRetryCount((count) => count + 1)}
        >
          Retry
        </button>
      </div>
    );
  }

  const summary = dashboard.summary;

  return (
    <div className="cc-page">
      <SectionFilter />

      <div className="cc-metrics">
        <EngagementMetricCard
          label="Participation Rate"
          value={
            summary.participation_rate == null
              ? "N/A"
              : `${summary.participation_rate.toFixed(1)}%`
          }
          icon={Globe}
          tone="accent"
        />

        <EngagementMetricCard
          label="Activities Offered"
          value={String(summary.activities_offered)}
          icon={CalendarDays}
          tone="navy"
        />

        <EngagementMetricCard
          label="Unique Participants"
          value={String(summary.unique_participants)}
          icon={Users}
          tone="warning"
        />
      </div>

      <EngagementTableCard rows={dashboard.activities} />
    </div>
  );
}