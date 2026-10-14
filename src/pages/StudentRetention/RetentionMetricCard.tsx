import type { LucideIcon } from "lucide-react";

interface RetentionMetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "navy" | "sky" | "amber";
}

export function RetentionMetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: RetentionMetricCardProps) {
  return (
    <article className="sr-metric">
      <div className="sr-metric__top">
        <div className={`sr-metric__icon sr-chip--${tone}`}>
          <Icon size={18} aria-hidden="true" />
        </div>

        <span className="sr-metric__label">{label}</span>
      </div>

      <span className="sr-metric__value">{value}</span>
    </article>
  );
}
