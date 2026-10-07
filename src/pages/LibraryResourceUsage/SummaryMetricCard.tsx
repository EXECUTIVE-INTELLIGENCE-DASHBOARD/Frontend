import type { SummaryMetric } from "./libraryResourceUsage.types";

interface SummaryMetricCardProps {
  metric: SummaryMetric;
}

export function SummaryMetricCard({ metric }: SummaryMetricCardProps) {
  return (
    <article className={`lr-metric lr-metric--${metric.tone}`}>
      <span className="lr-metric__label">{metric.label}</span>

      <span className="lr-metric__value">{metric.value}</span>

      <span className="lr-metric__caption">{metric.caption}</span>
    </article>
  );
}
