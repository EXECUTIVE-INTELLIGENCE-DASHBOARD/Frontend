import { useEffect, useState } from "react";

import { getIncidentDashboard } from "./incidentSecurity.api";
import type {
  IncidentDashboardData,
  IncidentDashboardFilters,
} from "./incidentSecurity.types";
import { IncidentAnalysisPanel } from "./incident-security/IncidentAnalysisPanel";
import { IncidentCampusPanel } from "./incident-security/IncidentCampusPanel";
import { IncidentFilters } from "./incident-security/IncidentFilters";
import { IncidentFollowUpPanel } from "./incident-security/IncidentFollowUpPanel";
import { IncidentSummary } from "./incident-security/IncidentSummary";
import { IncidentTrendPanel } from "./incident-security/IncidentTrendPanel";

import "./IncidentSecurity.css";

interface DateRange {
  start: string;
  end: string;
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function defaultDateRange(now = new Date()): DateRange {
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 364);

  return {
    start: formatLocalDate(startDate),
    end: formatLocalDate(endDate),
  };
}

export function IncidentSecurity() {
  const [initialRange] = useState(defaultDateRange);
  const [filters, setFilters] = useState<IncidentDashboardFilters>(initialRange);
  const [data, setData] = useState<IncidentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const startDate = filters.start ?? initialRange.start;
  const endDate = filters.end ?? initialRange.end;

  useEffect(() => {
    const controller = new AbortController();
    const requestFilters: IncidentDashboardFilters = {
      ...(filters.campus ? { campus: filters.campus } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      start: startDate,
      end: endDate,
    };

    setIsLoading(true);
    setHasError(false);

    void getIncidentDashboard(requestFilters, controller.signal)
      .then((currentData) => {
        setData(currentData);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error("Incident dashboard request failed:", error);
          setHasError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [filters.campus, filters.category, retryCount, startDate, endDate]);

  return (
    <div className="incident-security-page">
      <IncidentFilters
        filters={filters}
        startDate={startDate}
        endDate={endDate}
        campuses={data?.by_campus ?? []}
        categories={data?.by_category ?? []}
        onChange={setFilters}
      />

      {isLoading && !data && (
        <p className="incident-security-message" role="status">
          Loading incident dashboard…
        </p>
      )}

      {hasError && (
        <section className="incident-security-error" role="alert">
          <div>
            <strong>Incident dashboard unavailable</strong>
            <p>We couldn’t load the incident data. Please try again.</p>
          </div>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Retry
          </button>
        </section>
      )}

      {data && !hasError && (
        <>
          <IncidentSummary data={data} />

          <div className="incident-security-main-grid">
            <IncidentTrendPanel data={data} />
            <IncidentCampusPanel data={data} />
          </div>

          <IncidentAnalysisPanel data={data} />
          <IncidentFollowUpPanel data={data} />
        </>
      )}
    </div>
  );
}
