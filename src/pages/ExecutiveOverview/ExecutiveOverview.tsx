import { OverviewCards } from "../../components/Overview/OverviewCards";
import { OverviewCharts } from "../../components/Overview/OverviewCharts";
import { OverviewInsights } from "../../components/Overview/OverviewInsights";
import { CampusFilter } from "../../components/filters/CampusFilter";
import "./ExecutiveOverview.css";

export function ExecutiveOverview() {
  return (
    <main className="executive-overview">
      <div className="executive-overview__filters">
        <CampusFilter
          onCampusChange={(campus) => {
            console.log("Selected campus:", campus);
          }}
        />
      </div>

      <section
        className="executive-overview__cards"
        aria-label="Executive summary"
      >
        <OverviewCards />
      </section>

      <section
        className="executive-overview__charts"
        aria-label="Budget and admissions analytics"
      >
        <OverviewCharts />
      </section>

      <section
        className="executive-overview__insights"
        aria-label="Operational insights"
      >
        <OverviewInsights />
      </section>
    </main>
  );
}