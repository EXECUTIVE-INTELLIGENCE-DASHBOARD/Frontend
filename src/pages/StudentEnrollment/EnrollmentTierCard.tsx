import {
  axisFor,
  formatNumber,
  formatPercent,
  tierLegend,
} from "./studentEnrollment.data";
import type { EnrollmentSummary } from "./studentEnrollment.types";

interface EnrollmentTierCardProps {
  summary: EnrollmentSummary;
}

/* A small bar-chart icon, drawn inline so the page needs no extra icon name. */
function BarsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="4" y="11" width="4" height="9" rx="1" />
      <rect x="10" y="4" width="4" height="16" rx="1" />
      <rect x="16" y="8" width="4" height="12" rx="1" />
    </svg>
  );
}

export function EnrollmentTierCard({ summary }: EnrollmentTierCardProps) {
  const { tiers } = summary;

  const axis = axisFor(Math.max(...tiers.map((tier) => tier.value)));

  const columns = {
    gridTemplateColumns: `repeat(${tiers.length}, minmax(0, 1fr))`,
  };
  const height = (value: number) => `${(value / axis.top) * 100}%`;

  return (
    <section className="se-card" aria-labelledby="se-tier-title">
      <header className="se-card__header">
        <div className="se-card__title-group">
          <span className="se-card__chip se-card__chip--pale">
            <BarsIcon />
          </span>

          <h2 id="se-tier-title" className="se-card__title">
            Enrolment by Educational Tier
          </h2>
        </div>
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
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="se-group"
                role="group"
                aria-label={`${tier.label}: ${formatNumber(tier.value)} students, ${formatPercent(tier.share)}`}
              >
                <div
                  className={`se-bar se-bar--tier se-tone--${tier.id}`}
                  style={{ height: height(tier.value) }}
                  aria-hidden="true"
                >
                  <span className="se-bar__value">
                    <strong>{formatNumber(tier.value)}</strong>
                    <small>{formatPercent(tier.share)}</small>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div aria-hidden="true" />

        <div className="se-labels" style={columns}>
          {tiers.map((tier) => (
            <div key={tier.id} className="se-label">
              <span className="se-label__name">{tier.label}</span>
            </div>
          ))}
        </div>
      </div>

      <footer className="se-card__footer">
        <ul className="se-legend se-legend--spread">
          {tierLegend.map((item) => (
            <li key={item.label}>
              <span
                className={`se-swatch se-tone--${item.tone}`}
                aria-hidden="true"
              />
              {item.label}
            </li>
          ))}
        </ul>
      </footer>
    </section>
  );
}
