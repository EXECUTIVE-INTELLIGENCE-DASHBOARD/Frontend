
import { useState } from "react";

import {
  CampusFilter,
  type CampusOption,
} from "../../components/filters/CampusFilter";

import { LiabilitiesSummary } from "../../components/liabilities/LiabilitiesSummary";
import { LiabilitiesComposition } from "../../components/liabilities/LiabilitiesComposition";
import { OutstandingCreditors } from "../../components/liabilities/OutstandingCreditors";
import { LiabilityAgeingAnalysis } from "../../components/liabilities/LiabilityAgeingAnalysis";
import { UpcomingPaymentObligations } from "../../components/liabilities/UpcomingPaymentObligations";

import "./Liabilities.css";

export function Liabilities() {
  const [selectedCampus, setSelectedCampus] =
    useState<CampusOption>("All Campuses");

  return (
    <main className="liabilities-page">
      <header className="liabilities-page__header">
        

        <div className="liabilities-page__filter">
          <CampusFilter onCampusChange={setSelectedCampus} />
        </div>
      </header>

      <section
        className="liabilities-page__summary"
        aria-label="Liabilities overview"
      >
        <LiabilitiesSummary campus={selectedCampus} />
      </section>

      <section
        className="liabilities-page__details"
        aria-label="Liabilities details"
      >
        <LiabilitiesComposition campus={selectedCampus} />
        <OutstandingCreditors campus={selectedCampus} />
      </section>

            <section
        className="liabilities-page__analysis"
        aria-label="Liability ageing analysis"
      >
        <LiabilityAgeingAnalysis campus={selectedCampus} />
      </section>

      <section
        className="liabilities-page__obligations"
        aria-label="Upcoming payment obligations"
      >
        <UpcomingPaymentObligations campus={selectedCampus} />
      </section>
    </main>
  );
}
