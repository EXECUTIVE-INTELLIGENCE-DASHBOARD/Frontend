import { OverviewCards } from "../../components/Overview/OverviewCards";
import { OverviewCharts } from "../../components/Overview/OverviewCharts";
import { OverviewInsights } from "../../components/Overview/OverviewInsights";
import { CampusFilter } from "../../components/filters/CampusFilter";
import "./ExecutiveOverview.css";

export function ExecutiveOverview() {
  return (
    <main className="executive-overview">
      <h1 className="executive-overview__sr-only">
        CEO Overview
      </h1>

      {/* Campus filter */}
      <div className="executive-overview__filters">
        <CampusFilter
          onCampusChange={(campus) => {
            console.log("Selected campus:", campus);
          }}
        />
      </div>

      {/* Row 1: Three summary cards */}
      <section
        className="executive-overview__cards"
        aria-label="Executive summary"
      >
        <OverviewCards />
      </section>

      {/* Row 2: Budget chart and admissions doughnut chart */}
      <section
        className="executive-overview__charts"
        aria-label="Budget and admissions analytics"
      >
        <OverviewCharts />
      </section>

      {/* Row 3: Incidents and capital projects */}
      <section
        className="executive-overview__insights"
        aria-label="Operational insights"
      >
        <OverviewInsights />
      </section>
    </main>
  );
}