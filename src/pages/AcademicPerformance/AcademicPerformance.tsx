import { MoreHorizontal } from "lucide-react";

import { filterControls, prototypeNote, summaryMetrics } from "./academicPerformance.data";
import { FilterCard } from "./FilterCard";
import { SummaryMetricCard } from "./SummaryMetricCard";
import { ResultsTrendCard } from "./ResultsTrendCard";
import { SubjectSignalsCard } from "./SubjectSignalsCard";
import { SciencesArtsCard } from "./SciencesArtsCard";
import { RiskIndicatorsCard } from "./RiskIndicatorsCard";
import { RetentionGroupsCard } from "./RetentionGroupsCard";
import { GraduationProgressCard } from "./GraduationProgressCard";
import { SupportRosterCard } from "./SupportRosterCard";

import "./AcademicPerformance.css";

export function AcademicPerformance() {
  return (
    <div className="ap-page">
      <nav className="ap-breadcrumb" aria-label="Breadcrumb">
        <span className="ap-breadcrumb__item">Academic Intelligence</span>

        <span className="ap-breadcrumb__sep" aria-hidden="true">
          /
        </span>

        <span
          className="ap-breadcrumb__item ap-breadcrumb__item--current"
          aria-current="page"
        >
          Academic Performance
        </span>
      </nav>

      <div className="ap-heading">
        <div className="ap-heading__text">
          <h1 className="ap-heading__title">Academic Performance</h1>

          <p className="ap-heading__subtitle">
            Connect achievement, student risk, retention and completion to
            focused academic support.
          </p>
        </div>

        <button type="button" className="ap-icon-button" aria-label="Page actions">
          <MoreHorizontal size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="ap-controls">
        <div className="ap-filters">
          {filterControls.map((control) => (
            <FilterCard key={control.id} control={control} />
          ))}
        </div>

        <div className="ap-metrics">
          {summaryMetrics.map((metric) => (
            <SummaryMetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      <p className="ap-note">{prototypeNote}</p>

      <div className="ap-grid">
        <ResultsTrendCard />
        <SubjectSignalsCard />
        <SciencesArtsCard />
        <RiskIndicatorsCard />
        <RetentionGroupsCard />
        <GraduationProgressCard />
      </div>

      <SupportRosterCard />

      <p className="ap-footnote">Prototype · sample data</p>
    </div>
  );
}
