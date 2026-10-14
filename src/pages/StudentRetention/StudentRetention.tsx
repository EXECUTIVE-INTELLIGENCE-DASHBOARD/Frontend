import { useState } from "react";
import { AlertTriangle, Check, Users } from "lucide-react";

import {
  CampusFilter,
  type CampusOption,
} from "../../components/filters/CampusFilter";
import { GenderRetentionCard } from "./GenderRetentionCard";
import { NationalityTableCard } from "./NationalityTableCard";
import { RetentionMetricCard } from "./RetentionMetricCard";
import {
  formatNumber,
  rowsForCampus,
  summaryForCampus,
} from "./studentRetention.data";

import "../../palette.css";
import "./StudentRetention.css";

export function StudentRetention() {
  const [campus, setCampus] = useState<CampusOption>("All Campuses");

  const summary = summaryForCampus(campus);
  const rows = rowsForCampus(campus);

  return (
    <div className="sr-page">
      <div className="sr-toolbar">
        <CampusFilter onCampusChange={setCampus} />
      </div>

      <div className="sr-metrics">
        <RetentionMetricCard
          label="Total Re-enrolled Students"
          value={formatNumber(summary.reEnrolled)}
          icon={Users}
          tone="navy"
        />

        <RetentionMetricCard
          label="Re-enrollment Rate"
          value={`${summary.rate.toFixed(1)}%`}
          icon={Check}
          tone="sky"
        />

        <RetentionMetricCard
          label="At-Risk Retention"
          value={formatNumber(summary.atRisk)}
          icon={AlertTriangle}
          tone="amber"
        />
      </div>

      <div className="sr-grid">
        <NationalityTableCard rows={rows} />
        <GenderRetentionCard summary={summary} />
      </div>
    </div>
  );
}
