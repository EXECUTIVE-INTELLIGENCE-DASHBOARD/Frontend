import {
  formatNumber,
  formatPercent,
} from "./studentEnrollment.data";
import type { EnrollmentSummary } from "./studentEnrollment.types";

interface EnrollmentTierCardProps {
  summary: EnrollmentSummary;
}

export function EnrollmentTierCard({
  summary,
}: EnrollmentTierCardProps) {
  const { tiers } = summary;

  // Adapt the existing tier data to the application funnel.
  // Replace these mappings with actual pipeline data when available.
  const total = tiers.reduce((sum, tier) => sum + tier.value, 0);

  const stages = [
    {
      id: "applications",
      label: "Applications",
      value: total,
      percentage: 100,
      color: "#243B70",
    },
    {
      id: "qualified",
      label: "Qualified",
      value: Math.round(total * 0.509),
      percentage: 50.9,
      color: "#27A7D9",
    },
    {
      id: "interviewed",
      label: "Interviewed",
      value: Math.round(total * 0.182),
      percentage: 18.2,
      color: "#79CFF0",
    },
    {
      id: "accepted",
      label: "Accepted",
      value: Math.round(total * 0.124),
      percentage: 12.4,
      color: "#F5B91B",
    },
  ];

  const summaryItems = [
    {
      label: "Total",
      value: formatNumber(stages[0].value),
      color: stages[0].color,
    },
    {
      label: "Qualified",
      value: `${formatPercent(stages[1].percentage / 100)}`,
      color: stages[1].color,
    },
    {
      label: "Interviewed",
      value: `${formatPercent(stages[2].percentage / 100)}`,
      color: stages[2].color,
    },
    {
      label: "Accepted",
      value: `${formatPercent(stages[3].percentage / 100)}`,
      color: stages[3].color,
    },
  ];

  return (
    <section className="se-card se-funnel" aria-labelledby="se-tier-title">
      <header className="se-funnel__header">
        <h2 id="se-tier-title" className="se-funnel__title">
          Enrollment &amp; Pipeline
        </h2>

        <p className="se-funnel__subtitle">
          Application Conversion Funnel
        </p>
      </header>

      <div
        className="se-funnel__stages"
        role="img"
        aria-label="Application conversion funnel"
      >
        {stages.map((stage) => (
          <div
            key={stage.id}
            className={`se-funnel__stage se-funnel__stage--${stage.id}`}
            style={{
              width: `${Math.max(stage.percentage, 25)}%`,
              backgroundColor: stage.color,
            }}
          >
            <span>
              {formatNumber(stage.value)}{" "}
              {stage.id === "applications"
                ? "Applications"
                : stage.label}
            </span>
          </div>
        ))}
      </div>

      <footer className="se-funnel__footer">
        <ul className="se-funnel__summary">
          {summaryItems.map((item) => (
            <li key={item.label} className="se-funnel__summary-item">
              <span
                className="se-funnel__dot"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />

              <span className="se-funnel__summary-label">
                {item.label}
              </span>

              <strong>{item.value}</strong>
            </li>
          ))}
        </ul>
      </footer>
    </section>
  );
}