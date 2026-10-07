import { CheckCircle2 } from "lucide-react";

import type { SummaryMetric } from "./academicPerformance.types";

interface SummaryMetricCardProps {
  metric: SummaryMetric;
}

export function SummaryMetricCard({ metric }: SummaryMetricCardProps) {
  return (
    <article className={`ap-metric ap-metric--${metric.tone}`}>
      <span className="ap-metric__label">{metric.label}</span>

      <span className="ap-metric__value">{metric.value}</span>

      <span
        className={
          metric.highlight
            ? "ap-metric__caption ap-metric__caption--ok"
            : "ap-metric__caption"
        }
      >
        {metric.highlight ? (
          <CheckCircle2 size={13} aria-hidden="true" />
        ) : null}
        {metric.caption}
      </span>
    </article>
  );
}
