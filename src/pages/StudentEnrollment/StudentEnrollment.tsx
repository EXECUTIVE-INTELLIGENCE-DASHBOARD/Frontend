import { useState } from "react";
import {
  Building2,
  ChevronDown,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  formatNumber,
  formatPercent,
  toSummary,
  useEnrollmentDashboard,
} from "./studentEnrollment.data";
import { CampusEnrollmentCard } from "./CampusEnrollmentCard";
import { EnrollmentTierCard } from "./EnrollmentTierCard";
import { SummaryMetricCard } from "./SummaryMetricCard";

import "./StudentEnrollment.css";

export function StudentEnrollment() {
  // The campus key from the backend (for example "kibuli"); "" means all.
  const [campus, setCampus] = useState("");

  const { data, campusOptions, isLoading, error, refetch } =
    useEnrollmentDashboard(campus);

  const scopeLabel = campus
    ? (campusOptions.find((option) => option.value === campus)?.label ?? campus)
    : null;
  const summary = data ? toSummary(data, scopeLabel) : null;

  return (
    <div className="se-page">
      <div className="se-toolbar">
        <div className="se-filter">
          <label className="se-filter__label" htmlFor="se-campus-filter">
            Select Campus
          </label>

          <div className="se-filter__control">
            <select
              id="se-campus-filter"
              className="se-filter__select"
              value={campus}
              onChange={(event) => setCampus(event.target.value)}
            >
              <option value="">All Campuses</option>
              {campusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <ChevronDown
              className="se-filter__caret"
              size={16}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {error && (
        <p role="alert">
          {error.message}{" "}
          <button type="button" onClick={() => refetch()}>
            Try again
          </button>
        </p>
      )}

      {isLoading && (
        <p role="status">
          Loading student enrolment data....
        </p>
      )}

      <div className="se-metrics">
        <SummaryMetricCard
          label="Total Active Enrolment"
          value={data ? formatNumber(data.summary.total_active_enrolment) : "—"}
          unit={data ? "Students" : undefined}
          icon={Users}
        />

        <SummaryMetricCard
          label="Admissions Conversion"
          value={formatPercent(data?.summary.admissions_conversion)}
          icon={TrendingUp}
        />

        <SummaryMetricCard
          label="Capacity Utilization"
          value={formatPercent(data?.summary.capacity_utilisation)}
          icon={Building2}
        />
      </div>

      {summary && data && (
        <div className="se-grid">
          <CampusEnrollmentCard summary={summary} />
          <EnrollmentTierCard pipeline={data.pipeline} />
        </div>
      )}
    </div>
  );
}