import { useState } from "react";
import {
  CampusFilter,
  type CampusOption,
  type SectionOption,
} from "../components/filters/CampusFilter";
import { RevenueGraph } from "../components/RevenueGraph";
import { RevenueDetails } from "../components/RevenueDetails";

import "./Revenue.css";

export function Revenue() {
  const [campus, setCampus] =
    useState<CampusOption>("All Campuses");

  const [section, setSection] =
    useState<SectionOption>("All Sections");

  return (
    <main className="revenue-page">
      <header className="revenue-page__header">
       

        <section
          className="revenue-page__filters"
          aria-label="Revenue campus and section filters"
        >
          <CampusFilter
            onCampusChange={setCampus}
            onSectionChange={setSection}
          />
        </section>
      </header>

      <section
        className="revenue-page__details"
        aria-label="Revenue summary and details"
      >
        <RevenueDetails
          campus={campus}
          section={section}
        />
      </section>

      <section
        className="revenue-page__graph"
        aria-label="Revenue trend"
      >
        <RevenueGraph />
      </section>
    </main>
  );
}