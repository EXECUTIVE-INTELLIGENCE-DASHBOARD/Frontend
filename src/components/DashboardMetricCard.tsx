import type { LucideIcon } from "lucide-react";

import "./academic-performance/AcademicSummary.css";

interface DashboardMetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  cardClassName?: string;
  iconClassName?: string;
  valueElement?: "h2" | "strong";
  iconStrokeWidth?: number;
}

export function DashboardMetricCard({
  label,
  value,
  icon: Icon,
  cardClassName,
  iconClassName,
  valueElement = "h2",
  iconStrokeWidth,
}: DashboardMetricCardProps) {
  const ValueElement = valueElement;

  return (
    <article className={`acad-metric ${cardClassName ?? ""}`.trim()}>
      <span
        className={`acad-metric__icon ${iconClassName ?? ""}`.trim()}
        aria-hidden="true"
      >
        <Icon size={18} strokeWidth={iconStrokeWidth} />
      </span>
      <div className="acad-metric__content">
        <span className="acad-metric__label">{label}</span>
        <ValueElement className="acad-metric__value">{value}</ValueElement>
      </div>
    </article>
  );
}
