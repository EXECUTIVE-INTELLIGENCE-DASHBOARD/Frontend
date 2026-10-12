import { BookOpen, Clock, Library, Undo2, type LucideIcon } from "lucide-react";

import type { SummaryMetric } from "./libraryResourceUsage.types";

const METRIC_ICONS: Record<string, LucideIcon> = {
  checkouts: BookOpen,
  returns: Undo2,
  available: Library,
  overdue: Clock,
};

interface SummaryMetricCardProps {
  metric: SummaryMetric;
}

export function SummaryMetricCard({ metric }: SummaryMetricCardProps) {
  const Icon = METRIC_ICONS[metric.id] ?? BookOpen;

  return (
    <article className={`lr-metric lr-metric--${metric.tone}`}>
      <span className="lr-metric__icon" aria-hidden="true">
        <Icon size={18} />
      </span>

      <span className="lr-metric__body">
        <span className="lr-metric__label">{metric.label}</span>

        <span className="lr-metric__value">{metric.value}</span>

        <span className="lr-metric__caption">{metric.caption}</span>
      </span>
    </article>
  );
}
