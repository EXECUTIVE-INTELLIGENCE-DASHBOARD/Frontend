import { useState } from "react";

import {
  CampusFilter,
  type CampusOption,
} from "../../components/filters/CampusFilter";

import { LiabilitiesSummary } from "../../components/liabilities/LiabilitiesSummary";
import { LiabilitiesComposition } from "../../components/liabilities/LiabilitiesComposition";
import { OutstandingCreditors } from "../../components/liabilities/OutstandingCreditors";

import "./Liabilities.css";

export function Liabilities() {
  const [, setSelectedCampus] = useState<CampusOption>("All Campuses");

  return (
    <main className="liabilities-page">
      <header className="liabilities-page__header">
        <section className="liabilities-page__intro">
          <h2>Managing Liabilities with Precision.</h2>
          <p>
            Maintaining transparency and control over outstanding liabilities.
          </p>
        </section>

        <div className="liabilities-page__filter">
          <CampusFilter onCampusChange={setSelectedCampus} />
        </div>
      </header>

      <section
        className="liabilities-page__summary"
        aria-label="Liabilities overview"
      >
        <LiabilitiesSummary />
      </section>

      <section
        className="liabilities-page__details"
        aria-label="Liabilities details"
      >
        <LiabilitiesComposition />
        <OutstandingCreditors />
      </section>
    </main>
  );
}
