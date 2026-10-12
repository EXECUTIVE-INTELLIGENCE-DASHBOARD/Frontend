import { Gauge, TrendingUp, Users, type LucideIcon } from "lucide-react";

import type { SummaryMetric } from "./studentEnrollment.types";

const METRIC_ICONS: Record<string, LucideIcon> = {
  enrollment: Users,
  capacity: Gauge,
  change: TrendingUp,
};

interface SummaryMetricCardProps {
  metric: SummaryMetric;
}

export function SummaryMetricCard({ metric }: SummaryMetricCardProps) {
  const Icon = METRIC_ICONS[metric.id] ?? Users;

  return (
    <article className={`se-metric se-metric--${metric.tone}`}>
      <span className="se-metric__icon" aria-hidden="true">
        <Icon size={18} />
      </span>

      <span className="se-metric__body">
        <span className="se-metric__label">{metric.label}</span>

        <span className="se-metric__value">{metric.value}</span>

        <span className="se-metric__caption">{metric.caption}</span>
      </span>
    </article>
  );
}
