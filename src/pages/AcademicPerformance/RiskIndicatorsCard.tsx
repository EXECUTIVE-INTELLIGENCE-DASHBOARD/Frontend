import { DonutChart } from "../../components/DonutChart";

import { riskIndicators, riskNote } from "./academicPerformance.data";
import type { RiskBandTone } from "./academicPerformance.types";

const bandColors: Record<RiskBandTone, string> = {
  severe: "var(--chart-navy)",
  moderate: "var(--chart-blue)",
  watch: "var(--chart-sky)",
};

export function RiskIndicatorsCard() {
  return (
    <section className="ap-card">
      <div className="ap-card__header">
        <h2 className="ap-card__title">Student Risk Indicators</h2>
      </div>

      <div className="ap-card__body">
        <div className="ap-risk">
          {riskIndicators.map((indicator) => (
            <div key={indicator.id} className="ap-risk__item">
              <DonutChart
                size={116}
                thickness={14}
                segments={indicator.bands.map((band) => ({
                  id: band.id,
                  value: band.value,
                  color: bandColors[band.tone],
                }))}
                centerValue={String(indicator.learners)}
                centerLabel="learners"
                ariaLabel={`${indicator.label}: ${indicator.learners} learners (${indicator.percent} of students)`}
              />

              <span className="ap-risk__label">{indicator.label}</span>
              <span className="ap-risk__percent">
                {indicator.percent} of students
              </span>
            </div>
          ))}
        </div>

        <p className="ap-card__footnote">{riskNote}</p>
      </div>
    </section>
  );
}
