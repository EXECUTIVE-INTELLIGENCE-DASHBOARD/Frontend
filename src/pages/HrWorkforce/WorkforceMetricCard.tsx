import type { LucideIcon } from "lucide-react";

interface WorkforceMetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "sky" | "slate" | "amber";
}

export function WorkforceMetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: WorkforceMetricCardProps) {
  return (
    <article className={`hw-metric hw-metric--${tone}`}>
      <div className="hw-metric__top">
        <span className="hw-metric__icon">
          <Icon size={16} aria-hidden="true" />
        </span>

        <span className="hw-metric__label">{label}</span>
      </div>

      <span className="hw-metric__value">{value}</span>
    </article>
  );
}
