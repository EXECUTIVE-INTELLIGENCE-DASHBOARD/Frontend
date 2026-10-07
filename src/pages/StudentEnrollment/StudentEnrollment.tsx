import { RefreshCw } from "lucide-react";

import {
  filterControls,
  prototypeNote,
  summaryMetrics,
} from "./studentEnrollment.data";
import { FilterCard } from "./FilterCard";
import { SummaryMetricCard } from "./SummaryMetricCard";
import { EnrollmentTrendCard } from "./EnrollmentTrendCard";
import { GroupComparisonCard } from "./GroupComparisonCard";
import { CapacityPlanningCard } from "./CapacityPlanningCard";
import { AttentionCard } from "./AttentionCard";

import "./StudentEnrollment.css";

export function StudentEnrollment() {
  return (
    <div className="se-page">
      <nav className="se-breadcrumb" aria-label="Breadcrumb">
        <span className="se-breadcrumb__item">Academic Intelligence</span>

        <span className="se-breadcrumb__sep" aria-hidden="true">
          /
        </span>

        <span
          className="se-breadcrumb__item se-breadcrumb__item--current"
          aria-current="page"
        >
          Student Enrollment
        </span>
      </nav>

      <div className="se-heading">
        <div className="se-heading__text">
          <h1 className="se-heading__title">Student Enrollment</h1>

          <p className="se-heading__subtitle">
            Tracks student numbers, conversions and the capacity needed to
            support learning.
          </p>
        </div>

        <button
          type="button"
          className="se-icon-button"
          aria-label="Refresh enrollment data"
        >
          <RefreshCw size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="se-controls">
        <div className="se-filters">
          {filterControls.map((control) => (
            <FilterCard key={control.id} control={control} />
          ))}
        </div>

        <div className="se-metrics">
          {summaryMetrics.map((metric) => (
            <SummaryMetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      <p className="se-note">{prototypeNote}</p>

      <div className="se-grid">
        <EnrollmentTrendCard />
        <GroupComparisonCard />
      </div>

      <CapacityPlanningCard />

      <AttentionCard />

      <p className="se-footnote">Prototype · sample data</p>
    </div>
  );
}
