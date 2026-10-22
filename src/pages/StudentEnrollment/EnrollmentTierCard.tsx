import { formatNumber, formatPercent } from "./studentEnrollment.data";
import type { EnrollmentStage } from "./studentEnrollment.data";

interface EnrollmentTierCardProps {
  pipeline: EnrollmentStage[];
}

// Funnel colours from the design; extra stages reuse the last colour.
const STAGE_COLORS = ["#243B70", "#2AA4DD", "#79CFF0", "#F1BA1B", "#2F9E6B"];

export function EnrollmentTierCard({ pipeline }: EnrollmentTierCardProps) {
  // Every figure comes from the backend's admissions pipeline.
  const stages = pipeline.map((stage, index) => ({
    id: index === 0 ? "applications" : stage.stage,
    label: index === 0 ? "Applications" : stage.label,
    value: stage.count,
    percentage: stage.rate ?? 0,
    color: STAGE_COLORS[Math.min(index, STAGE_COLORS.length - 1)],
  }));

  const summaryItems = stages.map((stage, index) => ({
    label: index === 0 ? "Total" : stage.label,
    value:
      index === 0 ? formatNumber(stage.value) : formatPercent(stage.percentage),
    color: stage.color,
  }));

  return (
    <section className="se-card se-funnel" aria-labelledby="se-tier-title">
      <header className="se-funnel__header">
        <h2 id="se-tier-title" className="se-funnel__title">
          Enrollment &amp; Pipeline
        </h2>

        <p className="se-funnel__subtitle">Application Conversion Funnel</p>
      </header>

      {stages.length === 0 ? (
        <p className="se-funnel__subtitle">
          No applications for this term yet.
        </p>
      ) : (
        <>
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
                  {formatNumber(stage.value)} {stage.label}
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

                  <span className="se-funnel__summary-label">{item.label}</span>

                  <strong>{item.value}</strong>
                </li>
              ))}
            </ul>
          </footer>
        </>
      )}
    </section>
  );
}
