import type { LucideIcon } from "lucide-react";

import "../../components/academic-performance/AcademicSummary.css";

interface EngagementMetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "accent" | "navy" | "warning";
}

export function EngagementMetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: EngagementMetricCardProps) {
  return (
    <article className="cc-metric acad-metric">
      <span
        className={`cc-metric__icon acad-metric__icon cc-tone--${tone}`}
        aria-hidden="true"
      >
        <Icon size={18} />
      </span>

      <div className="acad-metric__content">
        <span className="acad-metric__label">{label}</span>
        <h2 className="acad-metric__value">{value}</h2>
      </div>
    </article>
  );
}