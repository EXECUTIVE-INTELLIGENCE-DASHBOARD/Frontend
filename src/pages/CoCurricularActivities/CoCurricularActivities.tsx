import { useState } from "react";
import { CalendarDays, Globe, UserX } from "lucide-react";

import {
  CampusFilter,
  type CampusOption,
} from "../../components/filters/CampusFilter";
import { rowsForCampus, summaryForCampus } from "./coCurricularActivities.data";
import { EngagementMetricCard } from "./EngagementMetricCard";
import { EngagementTableCard } from "./EngagementTableCard";

import "./CoCurricularActivities.css";

export function CoCurricularActivities() {
  const [campus, setCampus] = useState<CampusOption>("All Campuses");

  const summary = summaryForCampus(campus);
  const rows = rowsForCampus(campus);

  return (
    <div className="cc-page">
      <div className="cc-toolbar">
        <CampusFilter onCampusChange={setCampus} />
      </div>

      <div className="cc-metrics">
        <EngagementMetricCard
          label="Club Coverage Rate"
          value={`${summary.coverageRate.toFixed(1)}%`}
          icon={Globe}
          tone="accent"
          progress={summary.progress.coverage}
        />

        <EngagementMetricCard
          label="Events & Competitions Held"
          value={`${summary.events} Events`}
          icon={CalendarDays}
          tone="navy"
          progress={summary.progress.events}
        />

        <EngagementMetricCard
          label="Non-Participating Pool"
          value={`${summary.nonParticipating} Students`}
          icon={UserX}
          tone="warning"
          progress={summary.progress.nonParticipating}
        />
      </div>

      <EngagementTableCard rows={rows} campusLabel={campus} />
    </div>
  );
}
