import {
  Award,
  CalendarCheck,
  HeartHandshake,
  type LucideIcon,
} from "lucide-react";

import type { SummaryMetric } from "./myChildProgress.types";

const METRIC_ICONS: Record<string, LucideIcon> = {
  attendance: CalendarCheck,
  result: Award,
  support: HeartHandshake,
};

interface SummaryMetricCardProps {
  metric: SummaryMetric;
}

export function SummaryMetricCard({ metric }: SummaryMetricCardProps) {
  const Icon = METRIC_ICONS[metric.id] ?? Award;

  return (
    <article className={`mc-metric mc-metric--${metric.tone}`}>
      <span className="mc-metric__icon" aria-hidden="true">
        <Icon size={18} />
      </span>

      <span className="mc-metric__body">
        <span className="mc-metric__label">{metric.label}</span>

        <span className="mc-metric__value">{metric.value}</span>

        <span className="mc-metric__caption">{metric.caption}</span>
      </span>
    </article>
  );
}
