import type { SummaryMetric } from "./studentEnrollment.types";

interface SummaryMetricCardProps {
  metric: SummaryMetric;
}

export function SummaryMetricCard({ metric }: SummaryMetricCardProps) {
  return (
    <article className={`se-metric se-metric--${metric.tone}`}>
      <span className="se-metric__label">{metric.label}</span>

      <span className="se-metric__value">{metric.value}</span>

      <span className="se-metric__caption">{metric.caption}</span>
    </article>
  );
}
