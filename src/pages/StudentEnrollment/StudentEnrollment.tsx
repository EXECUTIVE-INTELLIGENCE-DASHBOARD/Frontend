import { useState } from "react";
import {
  Building2,
  ChevronDown,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  allCampusesLabel,
  campusOptions,
  formatNumber,
  formatPercent,
  summaryFor,
} from "./studentEnrollment.data";
import { CampusEnrollmentCard } from "./CampusEnrollmentCard";
import { EnrollmentTierCard } from "./EnrollmentTierCard";
import { SummaryMetricCard } from "./SummaryMetricCard";

import "./StudentEnrollment.css";

export function StudentEnrollment() {
  const [campus, setCampus] = useState(allCampusesLabel);

  const summary = summaryFor(campus);

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
              {campusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
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

      <div className="se-metrics">
        <SummaryMetricCard
          label="Total Active Enrolment"
          value={formatNumber(summary.total)}
          unit="Students"
          icon={Users}
        />

        <SummaryMetricCard
          label="Admissions Conversion"
          value={formatPercent(summary.conversion)}
          icon={TrendingUp}
        />

        <SummaryMetricCard
          label="Capacity Utilization"
          value={formatPercent(summary.utilization)}
          icon={Building2}
        />
      </div>

      <div className="se-grid">
        <CampusEnrollmentCard summary={summary} />
        <EnrollmentTierCard summary={summary} />
      </div>
    </div>
  );
}
