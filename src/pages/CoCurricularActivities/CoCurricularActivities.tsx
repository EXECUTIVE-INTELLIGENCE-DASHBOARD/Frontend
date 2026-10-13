import { useState } from "react";
import { CalendarDays, ChevronDown, Globe, UserX } from "lucide-react";

import {
  allCampusesLabel,
  campusOptions,
  prototypeNote,
  rowsForCampus,
  summaryForCampus,
} from "./coCurricularActivities.data";
import { EngagementMetricCard } from "./EngagementMetricCard";
import { EngagementTableCard } from "./EngagementTableCard";

import "./CoCurricularActivities.css";

export function CoCurricularActivities() {
  const [campus, setCampus] = useState(allCampusesLabel);

  const summary = summaryForCampus(campus);
  const rows = rowsForCampus(campus);

  return (
    <div className="cc-page">
      <nav className="cc-breadcrumb" aria-label="Breadcrumb">
        <span className="cc-breadcrumb__item">Academic Intelligence</span>

        <span className="cc-breadcrumb__sep" aria-hidden="true">
          /
        </span>

        <span
          className="cc-breadcrumb__item cc-breadcrumb__item--current"
          aria-current="page"
        >
          Co-Curricular Activities
        </span>
      </nav>

      <div className="cc-heading">
        <div className="cc-heading__text">
          <h1 className="cc-heading__title">Co-Curricular Activities</h1>

          <p className="cc-heading__subtitle">
            Track club participation, events held and learners who are not yet
            taking part in any activity.
          </p>
        </div>

        <div className="cc-filter">
          <label className="cc-filter__label" htmlFor="cc-campus-filter">
            Select Campus
          </label>

          <div className="cc-filter__control">
            <select
              id="cc-campus-filter"
              className="cc-filter__select"
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
              className="cc-filter__caret"
              size={16}
              aria-hidden="true"
            />
          </div>
        </div>
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

      <p className="cc-note">{prototypeNote}</p>

      <EngagementTableCard rows={rows} campusLabel={campus} />
    </div>
  );
}
