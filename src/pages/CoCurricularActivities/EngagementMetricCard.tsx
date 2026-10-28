import type { LucideIcon } from "lucide-react";

import { DashboardMetricCard } from "../../components/DashboardMetricCard";

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
    <DashboardMetricCard
      label={label}
      value={value}
      icon={Icon}
      cardClassName="cc-metric"
      iconClassName={`cc-metric__icon cc-tone--${tone}`}
    />
  );
}