import { Building2 } from "lucide-react";

import {
  axisFor,
  formatNumber,
  formatPercent,
} from "./studentEnrollment.data";
import type { EnrollmentSummary } from "./studentEnrollment.types";

interface CampusEnrollmentCardProps {
  summary: EnrollmentSummary;
}

export function CampusEnrollmentCard({ summary }: CampusEnrollmentCardProps) {
  const { records } = summary;

  const peak = Math.max(
    ...records.flatMap((record) => [record.boys, record.girls]),
  );
  const axis = axisFor(peak);

  const columns = {
    gridTemplateColumns: `repeat(${records.length}, minmax(0, 1fr))`,
  };
  const height = (value: number) => `${(value / axis.top) * 100}%`;

  return (
    <section className="se-card" aria-labelledby="se-campus-title">
      <header className="se-card__header">
        <div className="se-card__title-group">
          <span className="se-card__chip se-card__chip--navy">
            <Building2 size={18} aria-hidden="true" />
          </span>

          <h2 id="se-campus-title" className="se-card__title">
            Campus Enrolment &amp; Gender Breakdown
          </h2>
        </div>

        <ul className="se-legend">
          <li>
            <span className="se-swatch se-tone--boys" aria-hidden="true" />
            Boys
          </li>
          <li>
            <span className="se-swatch se-tone--girls" aria-hidden="true" />
            Girls
          </li>
        </ul>
      </header>

      <div className="se-chart">
        <div className="se-axis" aria-hidden="true">
          {axis.ticks.map((tick) => (
            <span key={tick} style={{ bottom: height(tick) }}>
              {formatNumber(tick)}
            </span>
          ))}
        </div>

        <div className="se-plot">
          <div className="se-gridlines" aria-hidden="true">
            {axis.ticks.map((tick) => (
              <span
                key={tick}
                className="se-gridline"
                style={{ bottom: height(tick) }}
              />
            ))}
          </div>

          <div className="se-bars" style={columns}>
            {records.map((record) => (
              <div
                key={record.id}
                className="se-group"
                role="group"
                aria-label={`${record.name}: ${formatNumber(record.boys)} boys, ${formatNumber(record.girls)} girls`}
              >
                <div
                  className="se-bar se-tone--boys"
                  style={{ height: height(record.boys) }}
                  aria-hidden="true"
                >
                  <span className="se-bar__value">
                    {formatNumber(record.boys)}
                  </span>
                </div>

                <div
                  className="se-bar se-tone--girls"
                  style={{ height: height(record.girls) }}
                  aria-hidden="true"
                >
                  <span className="se-bar__value se-bar__value--girls">
                    {formatNumber(record.girls)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div aria-hidden="true" />

        <div className="se-labels" style={columns}>
          {records.map((record) => (
            <div key={record.id} className="se-label">
              <span className="se-label__name">{record.name}</span>
              <span className="se-label__sub">
                Total: {formatNumber(record.boys + record.girls)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <footer className="se-card__footer">
        <p className="se-ratio">
          {summary.isAll ? "Total Gender Ratio" : "Gender Ratio"}:{" "}
          <strong>
            {formatPercent(summary.boysShare)} Boys ({formatNumber(summary.boys)})
          </strong>
          {" / "}
          <span className="se-ratio__girls">
            {formatPercent(summary.girlsShare)} Girls (
            {formatNumber(summary.girls)})
          </span>
        </p>

        <p className="se-aggregate">{summary.scopeText}</p>
      </footer>
    </section>
  );
}
