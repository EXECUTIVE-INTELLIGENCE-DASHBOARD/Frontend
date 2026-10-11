import { CampusFilter } from "../components/filters/CampusFilter";
import { RevenueGraph } from "../components/RevenueGraph";
import { RevenueDetails } from "../components/RevenueDetails";

import "./Revenue.css";

export function Revenue() {
  return (
    <main className="revenue-page">

      {/* Page heading and campus filter */}
      <header className="revenue-page__header">
        

        <section
          className="revenue-page__filters"
          aria-label="Revenue filters"
        >
          <CampusFilter />
        </section>
      </header>

      {/* Summary cards and revenue details */}
      <section
        className="revenue-page__details"
        aria-label="Revenue summary and details"
      >
        <RevenueDetails />
      </section>

      {/* Revenue graph at the bottom */}
      <section
        className="revenue-page__graph"
        aria-label="Revenue trend"
      >
        <RevenueGraph />
      </section>

    </main>
  );
}