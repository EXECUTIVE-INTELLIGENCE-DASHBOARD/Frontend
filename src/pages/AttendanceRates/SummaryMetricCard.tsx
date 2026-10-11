import { Activity, TrendingDown, Users } from "lucide-react";

import type { SummaryMetric } from "./attendanceRates.types";

const ICONS = {
  rate: Activity,
  followup: Users,
  declining: TrendingDown,
} as const;

interface SummaryMetricCardProps {
  metric: SummaryMetric;
}

export function SummaryMetricCard({ metric }: SummaryMetricCardProps) {
  const Icon = ICONS[metric.id];

  return (
    <article className="ar-metric">
      <div className={`ar-metric__icon ar-tone--${metric.tone}`}>
        <Icon size={20} aria-hidden="true" />
      </div>

      <div className="ar-metric__body">
        <span className="ar-metric__label">{metric.label}</span>

        <span className="ar-metric__value">{metric.value}</span>

        <span className="ar-metric__caption">{metric.caption}</span>
      </div>
    </article>
  );
}
