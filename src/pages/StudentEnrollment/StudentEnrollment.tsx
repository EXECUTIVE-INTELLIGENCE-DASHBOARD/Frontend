import { useState } from "react";
import { CalendarDays, Landmark, TrendingUp, Users } from "lucide-react";

import {
  CampusFilter,
  type CampusOption,
} from "../../components/filters/CampusFilter";
import { defaultAcademicYear } from "../../lib/organisation";
import { CampusGenderCard } from "./CampusGenderCard";
import { EnrollmentMetricCard } from "./EnrollmentMetricCard";
import { TierEnrollmentCard } from "./TierEnrollmentCard";
import {
  campusRowsFor,
  formatNumber,
  summaryFor,
  tierRowsFor,
} from "./studentEnrollment.data";

import "../../palette.css";
import "./StudentEnrollment.css";

export function StudentEnrollment() {
  const [campus, setCampus] = useState<CampusOption>("All Campuses");

  const summary = summaryFor(campus);
  const campusRows = campusRowsFor(campus);
  const tierRows = tierRowsFor(campus);

  return (
    <div className="se-page">
      <div className="se-toolbar">
        <span className="se-year">
          <CalendarDays size={14} aria-hidden="true" />
          {defaultAcademicYear}
        </span>

        <CampusFilter onCampusChange={setCampus} />
      </div>

      <div className="se-metrics">
        <EnrollmentMetricCard
          label="Total Active Enrolment"
          value={formatNumber(summary.total)}
          unit="Students"
          icon={Users}
        />

        <EnrollmentMetricCard
          label="Admissions Conversion"
          value={`${summary.conversion.toFixed(1)}%`}
          icon={TrendingUp}
        />

        <EnrollmentMetricCard
          label="Capacity Utilization"
          value={`${summary.capacity.toFixed(1)}%`}
          icon={Landmark}
        />
      </div>

      <div className="se-grid">
        <CampusGenderCard rows={campusRows} summary={summary} />
        <TierEnrollmentCard rows={tierRows} />
      </div>
    </div>
  );
}
