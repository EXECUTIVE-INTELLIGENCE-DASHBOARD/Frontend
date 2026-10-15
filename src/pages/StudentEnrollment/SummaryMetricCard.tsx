import type { LucideIcon } from "lucide-react";

interface SummaryMetricCardProps {
  label: string;
  value: string;
  /** Smaller text after the number, for example "Students". */
  unit?: string;
  icon: LucideIcon;
}

export function SummaryMetricCard({
  label,
  value,
  unit,
  icon: Icon,
}: SummaryMetricCardProps) {
  return (
    <article className="se-metric">
      <div className="se-metric__icon">
        <Icon size={22} aria-hidden="true" />
      </div>

      <div className="se-metric__text">
        <span className="se-metric__label">{label}</span>

        <span className="se-metric__value">
          {value}
          {unit ? <span className="se-metric__unit"> {unit}</span> : null}
        </span>
      </div>
    </article>
  );
}
