import { RefreshCw } from "lucide-react";

import { filterControls, summaryMetrics } from "./myChildProgress.data";
import { FilterCard } from "./FilterCard";
import { SummaryMetricCard } from "./SummaryMetricCard";
import { ChildBanner } from "./ChildBanner";
import { ProgressTrendCard } from "./ProgressTrendCard";
import { AttendanceCard } from "./AttendanceCard";
import { SubjectResultsCard } from "./SubjectResultsCard";
import { SupportPlanCard } from "./SupportPlanCard";
import { ParentEngagementCard } from "./ParentEngagementCard";

import "./MyChildProgress.css";

export function MyChildProgress() {
  return (
    <div className="mc-page">
      <nav className="mc-breadcrumb" aria-label="Breadcrumb">
        <span className="mc-breadcrumb__item">Parent Access</span>

        <span className="mc-breadcrumb__sep" aria-hidden="true">
          /
        </span>

        <span
          className="mc-breadcrumb__item mc-breadcrumb__item--current"
          aria-current="page"
        >
          My Child&apos;s Progress
        </span>
      </nav>

      <div className="mc-heading">
        <div className="mc-heading__text">
          <p className="mc-heading__subtitle">
            Your child&apos;s attendance, results and support — together in one
            parent view.
          </p>
        </div>

        <button
          type="button"
          className="mc-icon-button"
          aria-label="Refresh child progress data"
        >
          <RefreshCw size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="mc-controls">
        <div className="mc-filters">
          {filterControls.map((control) => (
            <FilterCard key={control.id} control={control} />
          ))}
        </div>

        <div className="mc-metrics">
          {summaryMetrics.map((metric) => (
            <SummaryMetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      <ChildBanner />

      <div className="mc-grid">
        <ProgressTrendCard />

        <AttendanceCard />
      </div>

      <SubjectResultsCard />

      <div className="mc-grid mc-grid--even">
        <SupportPlanCard />

        <ParentEngagementCard />
      </div>

      <p className="mc-footnote">Prototype · sample data</p>
    </div>
  );
}
