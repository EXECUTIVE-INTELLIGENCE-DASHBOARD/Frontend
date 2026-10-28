import { AlertTriangle, CircleAlert, Shield } from "lucide-react";

import type { IncidentDashboardData } from "../incidentSecurity.types";
import { IncidentMetricCard } from "../IncidentMetricCard";

interface IncidentSummaryProps {
  data: IncidentDashboardData;
}

export function IncidentSummary({ data }: IncidentSummaryProps) {
  return (
    <section
      className="acad-summary incident-security-metrics"
      aria-label="Incident summary"
    >
      <IncidentMetricCard
        label="Incidents Recorded"
        value={data.summary.total.toLocaleString()}
        icon={Shield}
      />
      <IncidentMetricCard
        label="Serious Open"
        value={data.summary.serious_open.toLocaleString()}
        icon={CircleAlert}
      />
      <IncidentMetricCard
        label="Overdue Follow-ups"
        value={data.summary.overdue.toLocaleString()}
        icon={AlertTriangle}
      />
    </section>
  );
}
