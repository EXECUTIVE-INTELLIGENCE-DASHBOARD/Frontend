import type { LucideIcon } from "lucide-react";

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
    <article className="cc-metric">
      <div className="cc-metric__top">
        <div className={`cc-metric__icon cc-tone--${tone}`}>
          <Icon size={18} aria-hidden="true" />
        </div>

        <span className="cc-metric__label">{label}</span>
      </div>

      <span className="cc-metric__value">{value}</span>
    </article>
  );
}