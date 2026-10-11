import {
  CheckCircle2,
  GraduationCap,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { SummaryMetric } from "./academicPerformance.types";

const METRIC_ICONS: Record<string, LucideIcon> = {
  "pass-rate": GraduationCap,
  retention: Users,
  completion: Target,
};

interface SummaryMetricCardProps {
  metric: SummaryMetric;
}

export function SummaryMetricCard({ metric }: SummaryMetricCardProps) {
  const Icon = METRIC_ICONS[metric.id] ?? GraduationCap;

  return (
    <article className={`ap-metric ap-metric--${metric.tone}`}>
      <span className="ap-metric__icon" aria-hidden="true">
        <Icon size={18} />
      </span>

      <span className="ap-metric__body">
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
      </span>
    </article>
  );
}
