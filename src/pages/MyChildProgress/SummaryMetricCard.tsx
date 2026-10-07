import type { SummaryMetric } from "./myChildProgress.types";

interface SummaryMetricCardProps {
  metric: SummaryMetric;
}

export function SummaryMetricCard({ metric }: SummaryMetricCardProps) {
  return (
    <article className={`mc-metric mc-metric--${metric.tone}`}>
      <span className="mc-metric__label">{metric.label}</span>

      <span className="mc-metric__value">{metric.value}</span>

      <span className="mc-metric__caption">{metric.caption}</span>
    </article>
  );
}
