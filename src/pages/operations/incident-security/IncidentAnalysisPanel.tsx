import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { IncidentDashboardData } from "../incidentSecurity.types";

interface IncidentAnalysisPanelProps {
  data: IncidentDashboardData;
}

const sourceChartColors = [
  "var(--brand-sky)",
  "var(--brand-gold)",
  "var(--brand-navy)",
];

export function IncidentAnalysisPanel({ data }: IncidentAnalysisPanelProps) {
  return (
    <article className="incident-security-panel">
      <div className="incident-security-panel__heading">
        <div>
          <h2>Incident Type &amp; Source Analysis</h2>
        </div>
      </div>
      <div className="incident-security-analysis-grid">
        <section className="incident-security-analysis-section">
          <h3>Incidents by Type</h3>
          {data.by_category.length > 0 ? (
            <div className="incident-security-analysis-chart">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={data.by_category}
                  layout="vertical"
                  margin={{ top: 4, right: 16, bottom: 4, left: 12 }}
                >
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={125}
                    tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="incidents"
                    name="Incidents"
                    fill="var(--brand-sky)"
                    radius={[0, 5, 5, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="incident-security-panel__empty">
              No category data was returned.
            </p>
          )}
        </section>
        <section className="incident-security-analysis-section">
          <h3>Incidents by Source</h3>
          {data.by_source.length > 0 ? (
            <div
              className="incident-security-source-chart"
              aria-label="Incidents by source pie chart"
            >
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data.by_source}
                    dataKey="incidents"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={78}
                  >
                    {data.by_source.map((source, index) => (
                      <Cell
                        key={source.code}
                        fill={sourceChartColors[index % sourceChartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <ul className="incident-security-source-legend">
                {data.by_source.map((source, index) => (
                  <li key={source.code}>
                    <span
                      style={{
                        backgroundColor:
                          sourceChartColors[index % sourceChartColors.length],
                      }}
                      aria-hidden="true"
                    />
                    <span>{source.label}</span>
                    <strong>{source.incidents.toLocaleString()}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="incident-security-panel__empty">
              No source data was returned.
            </p>
          )}
        </section>
      </div>
    </article>
  );
}
