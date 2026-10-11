import {
  Award,
  CalendarCheck,
  TrendingDown,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { Metric, MetricTone } from "./academicOverview.types";

const toneIcons: Record<MetricTone, LucideIcon> = {
  blue: Users,
  green: CalendarCheck,
  amber: Award,
};

interface StatCardProps {
  metric: Metric;
}

export function StatCard({ metric }: StatCardProps) {
  const Icon = toneIcons[metric.tone];
  const TrendIcon = metric.deltaDirection === "up" ? TrendingUp : TrendingDown;

  return (
    <article className={`stat-card stat-card--${metric.tone}`}>
      <span className="stat-card__icon" aria-hidden="true">
        <Icon size={18} />
      </span>

      <span className="stat-card__body">
        <span className="stat-card__label">{metric.label}</span>

        <span className="stat-card__value">{metric.value}</span>

        <span
          className={`stat-card__delta stat-card__delta--${metric.deltaDirection}`}
        >
          <TrendIcon size={14} aria-hidden="true" />
          <span className="stat-card__delta-value">{metric.delta}</span>
          <span className="stat-card__delta-context">{metric.context}</span>
        </span>
      </span>
    </article>
  );
}
