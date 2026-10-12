import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { filterControls, prototypeNote, summaryMetrics } from "./attendanceRates.data";
import { FilterCard } from "./FilterCard";
import { SummaryMetricCard } from "./SummaryMetricCard";
import { AttendanceTrendCard } from "./AttendanceTrendCard";
import { GroupAttendanceCard } from "./GroupAttendanceCard";
import { ClassComparisonCard } from "./ClassComparisonCard";
import { InterventionQueueCard } from "./InterventionQueueCard";

import "./AttendanceRates.css";

export function AttendanceRates() {
  const [filters, setFilters] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      filterControls.map((control) => [control.id, control.options[0]]),
    ),
  );

  return (
    <div className="ar-page">
      <nav className="ar-breadcrumb" aria-label="Breadcrumb">
        <span className="ar-breadcrumb__item">Academic Intelligence</span>

        <span className="ar-breadcrumb__sep" aria-hidden="true">
          /
        </span>

        <span
          className="ar-breadcrumb__item ar-breadcrumb__item--current"
          aria-current="page"
        >
          Attendance Rates
        </span>
      </nav>

      <div className="ar-heading">
        <div className="ar-heading__text">
          <h1 className="ar-heading__title">Attendance Rates</h1>

          <p className="ar-heading__subtitle">
            Monitor student attendance and identify classes and learners
            needing follow-up.
          </p>
        </div>

        <button
          type="button"
          className="ar-icon-button"
          aria-label="Refresh attendance data"
        >
          <RefreshCw size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="ar-filters">
        {filterControls.map((control) => (
          <FilterCard
            key={control.id}
            control={control}
            value={filters[control.id]}
            onChange={(value) =>
              setFilters((current) => ({ ...current, [control.id]: value }))
            }
          />
        ))}
      </div>

      <div className="ar-metrics">
        {summaryMetrics.map((metric) => (
          <SummaryMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <p className="ar-note">{prototypeNote}</p>

      <div className="ar-grid">
        <AttendanceTrendCard />
        <GroupAttendanceCard />
      </div>

      <ClassComparisonCard />

      <InterventionQueueCard />

      <p className="ar-footnote">Prototype · sample data</p>
    </div>
  );
}
