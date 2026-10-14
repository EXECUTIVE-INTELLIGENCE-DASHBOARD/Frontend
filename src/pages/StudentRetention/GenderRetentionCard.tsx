import { DonutChart } from "../../components/DonutChart";
import { formatNumber } from "./studentRetention.data";
import type { RetentionSummary } from "./studentRetention.types";

const COLORS = {
  girls: "var(--pal-sky)",
  boys: "var(--color-heading)",
} as const;

interface GenderRetentionCardProps {
  summary: RetentionSummary;
}

export function GenderRetentionCard({ summary }: GenderRetentionCardProps) {
  const total = summary.girls + summary.boys;
  const share = (value: number) =>
    total === 0 ? "0.0" : ((value / total) * 100).toFixed(1);

  const rows = [
    { id: "girls", label: "Girls Retained", value: summary.girls },
    { id: "boys", label: "Boys Retained", value: summary.boys },
  ] as const;

  return (
    <section className="sr-card sr-gender">
      <div className="sr-card__header">
        <h2 className="sr-card__title">
          <span className="sr-card__dot sr-card__dot--sky" aria-hidden="true" />
          Retention by Gender
        </h2>
      </div>

      <div className="sr-gender__body">
        <p className="sr-gender__intro">
          Comparative breakdown of student retention between girls and boys.
        </p>

        <div className="sr-gender__chart">
          <DonutChart
            segments={rows.map((row) => ({
              id: row.id,
              value: row.value,
              color: COLORS[row.id],
            }))}
            centerValue={formatNumber(total)}
            centerLabel="Retained"
            ariaLabel="Retention by gender"
            size={150}
            thickness={20}
          />
        </div>

        <ul className="sr-gender__list">
          {rows.map((row) => (
            <li key={row.id} className="sr-gender__item">
              <span
                className="sr-gender__dot"
                style={{ background: COLORS[row.id] }}
                aria-hidden="true"
              />

              <span className="sr-gender__label">{row.label}</span>

              <span className="sr-gender__count">{formatNumber(row.value)}</span>

              <span
                className={`sr-pill ${row.id === "girls" ? "sr-pill--good" : ""}`}
              >
                {share(row.value)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
