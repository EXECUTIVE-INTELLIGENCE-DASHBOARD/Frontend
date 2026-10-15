import type { LucideIcon } from "lucide-react";

interface EnrollmentMetricCardProps {
  label: string;
  value: string;
  /** A small unit shown after the value, e.g. "Students". */
  unit?: string;
  icon: LucideIcon;
}

export function EnrollmentMetricCard({
  label,
  value,
  unit,
  icon: Icon,
}: EnrollmentMetricCardProps) {
  return (
    <article className="se-metric">
      <div className="se-metric__top">
        <div className="se-metric__icon">
          <Icon size={18} aria-hidden="true" />
        </div>

        <span className="se-metric__label">{label}</span>
      </div>

      <span className="se-metric__value">
        {value}
        {unit ? <span className="se-metric__unit"> {unit}</span> : null}
      </span>
    </article>
  );
}
