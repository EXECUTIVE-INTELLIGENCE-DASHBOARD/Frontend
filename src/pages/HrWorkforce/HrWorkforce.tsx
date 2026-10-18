import { useState } from "react";
import { CalendarCheck, CalendarDays, Scale, Users } from "lucide-react";

import {
  CampusFilter,
  type CampusOption,
} from "../../components/filters/CampusFilter";
import { WorkforceMetricCard } from "./WorkforceMetricCard";
import { WorkforceTableCard } from "./WorkforceTableCard";
import {
  formatNumber,
  reportingPeriod,
  summaryFor,
} from "./hrWorkforce.data";

import "../../palette.css";
import "./HrWorkforce.css";

export function HrWorkforce() {
  const [campus, setCampus] = useState<CampusOption>("All Campuses");

  const summary = summaryFor(campus);

  return (
    <div className="hw-page">
      <div className="hw-toolbar">
        <span className="hw-period">
          <CalendarDays size={14} aria-hidden="true" />
          {reportingPeriod}
        </span>

        <CampusFilter onCampusChange={setCampus} />
      </div>

      <div className="hw-metrics">
        <WorkforceMetricCard
          label="Total Staff"
          value={formatNumber(summary.totalStaff)}
          icon={Users}
          tone="sky"
        />

        <WorkforceMetricCard
          label="Staffing Ratio"
          value={summary.ratio}
          icon={Scale}
          tone="slate"
        />

        <WorkforceMetricCard
          label="Workforce Attendance"
          value={`${summary.attendance.toFixed(1)}%`}
          icon={CalendarCheck}
          tone="amber"
        />
      </div>

      <WorkforceTableCard campusLabel={campus} />
    </div>
  );
}
