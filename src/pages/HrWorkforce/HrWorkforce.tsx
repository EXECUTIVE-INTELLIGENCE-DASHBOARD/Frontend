import { useState } from "react";
import { CalendarCheck, CalendarDays, ChevronDown, Scale, Users } from "lucide-react";

import {
  CampusFilter,
  type CampusOption,
} from "../../components/filters/CampusFilter";
import { WorkforceMetricCard } from "./WorkforceMetricCard";
import { WorkforceTableCard } from "./WorkforceTableCard";
import { EstablishmentTab, GslWorkforceCard, TalentTab } from "./HrTalentTabs";
import {
  allCampusesLabel,
  formatNumber,
  reportingPeriod,
  summaryFor,
} from "./hrWorkforce.data";
import {
  defaultEmployer,
  employerOptions,
  gslAttendance,
  gslHeadcount,
} from "./hrTalent.data";
import type { EmployerFilter } from "./hrTalent.types";

import "../../palette.css";
import "./HrWorkforce.css";
import "./HrTabs.css";

type Tab = "workforce" | "establishment" | "talent";

const tabs: Array<[Tab, string]> = [
  ["workforce", "Workforce"],
  ["establishment", "Establishment"],
  ["talent", "Talent"],
];

export function HrWorkforce() {
  const [tab, setTab] = useState<Tab>("workforce");
  const [campus, setCampus] = useState<CampusOption>("All Campuses");
  const [employer, setEmployer] = useState<EmployerFilter>(defaultEmployer);

  const summary = summaryFor(campus);

  /* GSL is not on a school campus: it shows when chosen, or with all campuses. */
  const showSchools = employer !== "gsl";
  const showGsl = employer === "gsl" || (employer === "all" && campus === allCampusesLabel);

  const schoolStaff = showSchools ? summary.totalStaff : 0;
  const gslStaff = showGsl ? gslHeadcount : 0;
  const totalStaff = schoolStaff + gslStaff;
  const attendance =
    totalStaff === 0
      ? 0
      : ((showSchools ? summary.attendance * schoolStaff : 0) +
          (showGsl ? gslAttendance * gslStaff : 0)) /
        totalStaff;

  return (
    <div className="hw-page">
      <div className="hr-bar">
        <div className="hr-tabs" role="tablist" aria-label="HR sections">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className="hr-tab"
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="hw-toolbar">
        <span className="hw-period">
          <CalendarDays size={14} aria-hidden="true" />
          {reportingPeriod}
        </span>

        <div className="hw-select">
          <select
            aria-label="Employer"
            className="hw-select__field"
            value={employer}
            onChange={(event) => setEmployer(event.target.value as EmployerFilter)}
          >
            {employerOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown size={14} aria-hidden="true" />
        </div>

        {tab === "workforce" && <CampusFilter onCampusChange={setCampus} />}
      </div>

      {tab === "workforce" && (
        <>
          <div className="hw-metrics">
            <WorkforceMetricCard
              label="Total Staff"
              value={formatNumber(totalStaff)}
              icon={Users}
              tone="sky"
            />

            <WorkforceMetricCard
              label="Staffing Ratio"
              value={showSchools ? summary.ratio : "—"}
              icon={Scale}
              tone="slate"
            />

            <WorkforceMetricCard
              label="Workforce Attendance"
              value={`${attendance.toFixed(1)}%`}
              icon={CalendarCheck}
              tone="amber"
            />
          </div>

          {showSchools && <WorkforceTableCard campusLabel={campus} />}
          {showGsl && <GslWorkforceCard />}
        </>
      )}

      {tab === "establishment" && <EstablishmentTab employer={employer} />}
      {tab === "talent" && <TalentTab employer={employer} />}
    </div>
  );
}
