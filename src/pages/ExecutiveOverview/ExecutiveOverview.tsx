import { ChevronRight } from "lucide-react";

import { overviewMetrics } from "./executiveOverview.data";
import { MetricCard } from "./MetricCard";
import { BudgetCard } from "./BudgetCard";
import { PipelineCard } from "./PipelineCard";
import { SafetyCard } from "./SafetyCard";
import { FacilitiesCard } from "./FacilitiesCard";

import "./ExecutiveOverview.css";

export function ExecutiveOverview() {
  return (
    <div className="eo-page">
      <nav className="eo-breadcrumb" aria-label="Breadcrumb">
        <span>Executive Intelligence</span>

        <ChevronRight size={13} aria-hidden="true" />

        <span className="eo-breadcrumb__current" aria-current="page">
          Overview
        </span>
      </nav>

      <div className="eo-heading">
        <h1 className="eo-heading__title">CEO Overview</h1>

        <p className="eo-heading__subtitle">
          Enrolment, financial overview, safety and operational readiness across
          all campuses.
        </p>
      </div>

      <section className="eo-metrics" aria-label="Key executive metrics">
        {overviewMetrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </section>

      <div className="eo-grid">
        <BudgetCard />
        <PipelineCard />
        <SafetyCard />
        <FacilitiesCard />
      </div>
    </div>
  );
}
