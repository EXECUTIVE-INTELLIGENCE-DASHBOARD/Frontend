import {
  CalendarCheck,
  BriefcaseBusiness,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { MetricIcon, OverviewMetric } from "./executiveOverview.types";

const icons: Record<MetricIcon, LucideIcon> = {
  users: Users,
  calendar: CalendarCheck,
  staff: BriefcaseBusiness,
};

interface MetricCardProps {
  metric: OverviewMetric;
}

export function MetricCard({ metric }: MetricCardProps) {
  const Icon = icons[metric.icon];

  return (
    <article className={`eo-metric eo-metric--${metric.tone}`}>
      <span className="eo-metric__icon" aria-hidden="true">
        <Icon size={18} />
      </span>

      <span className="eo-metric__body">
        <span className="eo-metric__label">{metric.label}</span>
        <span className="eo-metric__value">{metric.value}</span>
      </span>
    </article>
  );
}
