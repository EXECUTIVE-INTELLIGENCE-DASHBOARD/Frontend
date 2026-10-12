import { RefreshCw } from "lucide-react";

import { filterControls, prototypeNote, summaryMetrics } from "./libraryResourceUsage.data";
import { FilterCard } from "./FilterCard";
import { SummaryMetricCard } from "./SummaryMetricCard";
import { VolumeTrendCard } from "./VolumeTrendCard";
import { SchoolActivityCard } from "./SchoolActivityCard";
import { InventoryCard } from "./InventoryCard";
import { ConditionCard } from "./ConditionCard";
import { AcquisitionCard } from "./AcquisitionCard";
import { TitleRequestsCard } from "./TitleRequestsCard";

import "./LibraryResourceUsage.css";

export function LibraryResourceUsage() {
  return (
    <div className="lr-page">
      <nav className="lr-breadcrumb" aria-label="Breadcrumb">
        <span className="lr-breadcrumb__item">Academic Intelligence</span>

        <span className="lr-breadcrumb__sep" aria-hidden="true">
          /
        </span>

        <span
          className="lr-breadcrumb__item lr-breadcrumb__item--current"
          aria-current="page"
        >
          Library &amp; Resource Usage
        </span>
      </nav>

      <div className="lr-heading">
        <div className="lr-heading__text">
          <h1 className="lr-heading__title">Library &amp; Resource Usage</h1>

          <p className="lr-heading__subtitle">
            Monitor circulation, resource availability and demand to guide
            accession and acquisition planning.
          </p>
        </div>

        <button
          type="button"
          className="lr-icon-button"
          aria-label="Refresh library usage data"
        >
          <RefreshCw size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="lr-controls">
        <div className="lr-filters">
          {filterControls.map((control) => (
            <FilterCard key={control.id} control={control} />
          ))}
        </div>

        <div className="lr-metrics">
          {summaryMetrics.map((metric) => (
            <SummaryMetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      <p className="lr-note">{prototypeNote}</p>

      <div className="lr-grid">
        <VolumeTrendCard />

        <SchoolActivityCard />
      </div>

      <div className="lr-grid lr-grid--three">
        <InventoryCard />

        <ConditionCard />

        <AcquisitionCard />
      </div>

      <TitleRequestsCard />

      <p className="lr-footnote">Illustrative · sample data</p>
    </div>
  );
}
