import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { IncidentDashboardData } from "../incidentSecurity.types";

interface IncidentTrendPanelProps {
  data: IncidentDashboardData;
}

export function IncidentTrendPanel({ data }: IncidentTrendPanelProps) {
  return (
    <article className="incident-security-panel">
      <div className="incident-security-panel__heading">
        <div>
          <h2>Incidents Against Period</h2>
        </div>
        <span className="incident-security-panel__badge">
          {data.summary.total.toLocaleString()} records
        </span>
      </div>
      <div className="incident-security-chart">
        {data.by_month.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.by_month}
              margin={{ top: 12, right: 12, bottom: 0, left: -18 }}
            >
              <CartesianGrid
                stroke="var(--incident-security-grid)"
                strokeDasharray="3 4"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--incident-security-muted)", fontSize: 10 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--incident-security-muted)", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 10,
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey="incidents"
                name="Incidents"
                stroke="var(--brand-sky)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "var(--color-surface)", strokeWidth: 2 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="incident-security-panel__empty">
            No monthly incident data was returned for this selection.
          </p>
        )}
      </div>
    </article>
  );
}
