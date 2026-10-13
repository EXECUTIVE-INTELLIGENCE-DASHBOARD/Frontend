import type { LucideIcon } from "lucide-react";

interface EngagementMetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "accent" | "navy" | "warning";
  /** Bar fill, 0 to 100. */
  progress: number;
}

export function EngagementMetricCard({
  label,
  value,
  icon: Icon,
  tone,
  progress,
}: EngagementMetricCardProps) {
  const fill = Math.min(100, Math.max(0, progress));

  return (
    <article className="cc-metric">
      <div className="cc-metric__top">
        <div className={`cc-metric__icon cc-tone--${tone}`}>
          <Icon size={18} aria-hidden="true" />
        </div>

        <span className="cc-metric__label">{label}</span>
      </div>

      <span className="cc-metric__value">{value}</span>

      <div
        className="cc-metric__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={fill}
      >
        <div
          className={`cc-metric__fill cc-fill--${tone}`}
          style={{ width: `${fill}%` }}
        />
      </div>
    </article>
  );
}
