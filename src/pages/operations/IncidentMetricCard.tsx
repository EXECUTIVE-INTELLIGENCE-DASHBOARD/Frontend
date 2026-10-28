import type { LucideIcon } from "lucide-react";

import { DashboardMetricCard } from "../../components/DashboardMetricCard";

interface IncidentMetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
}

export function IncidentMetricCard({
  label,
  value,
  icon: Icon,
}: IncidentMetricCardProps) {
  return (
    <DashboardMetricCard
      label={label}
      value={value}
      icon={Icon}
      valueElement="strong"
      iconStrokeWidth={1.7}
    />
  );
}
