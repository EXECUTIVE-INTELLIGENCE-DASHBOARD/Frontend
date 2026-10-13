import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { filterControls, summaryMetrics } from "./attendanceRates.data";
import { FilterCard } from "./FilterCard";
import { SummaryMetricCard } from "./SummaryMetricCard";
import { AttendanceTrendCard } from "./AttendanceTrendCard";
import { GroupAttendanceCard } from "./GroupAttendanceCard";
import { ClassComparisonCard } from "./ClassComparisonCard";
import { InterventionQueueCard } from "./InterventionQueueCard";

import "../../palette.css";
import "./AttendanceRates.css";

export function AttendanceRates() {
  const [filters, setFilters] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      filterControls.map((control) => [control.id, control.options[0]]),
    ),
  );

  return (
    <div className="ar-page">
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

        <button
          type="button"
          className="ar-icon-button"
          aria-label="Refresh attendance data"
        >
          <RefreshCw size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="ar-metrics">
        {summaryMetrics.map((metric) => (
          <SummaryMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="ar-grid">
        <AttendanceTrendCard />
        <GroupAttendanceCard />
      </div>

      <ClassComparisonCard />

      <InterventionQueueCard />
    </div>
  );
}
