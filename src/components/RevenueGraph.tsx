import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import "./RevenueGraph.css";

interface RevenueMonth {
  month: string;
  realized?: number;
  forecast?: number;
  target: number;
}

const revenueData: RevenueMonth[] = [
  { month: "Jan", realized: 38, target: 40 },
  { month: "Feb", realized: 142, target: 135 },
  { month: "Mar", realized: 96, target: 90 },
  { month: "Apr", realized: 52, target: 50 },
  { month: "May", realized: 138, target: 140 },
  { month: "Jun", realized: 92, target: 85 },
  { month: "Jul", realized: 61, target: 55 },
  { month: "Aug", forecast: 60, target: 60 },
  { month: "Sep", forecast: 140, target: 140 },
  { month: "Oct", forecast: 90, target: 90 },
  { month: "Nov", forecast: 55, target: 55 },
  { month: "Dec", forecast: 35, target: 35 },
];

const realizedMonths = revenueData.filter(
  (month) => month.realized !== undefined,
);

const yearToDateRealized = realizedMonths.reduce(
  (total, month) => total + (month.realized ?? 0),
  0,
);

const yearToDateTarget = realizedMonths.reduce(
  (total, month) => total + month.target,
  0,
);

const performancePercentage =
  yearToDateTarget === 0
    ? 0
    : ((yearToDateRealized - yearToDateTarget) / yearToDateTarget) * 100;

const performanceLabel =
  performancePercentage >= 0
    ? `${performancePercentage.toFixed(1)}% above target`
    : `${Math.abs(performancePercentage).toFixed(1)}% below target`;

function formatMillions(value: number): string {
  return `UGX ${value.toFixed(1)}M`;
}

export function RevenueGraph() {
  return (
    <section
      className="revenue-trend"
      aria-labelledby="revenue-trend-title"
    >
      <header className="revenue-trend__header">
        <div className="revenue-trend__heading">
          <div className="revenue-trend__icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 4h18v13H3z" />
              <path d="m7 13 3-3 3 2 4-5" />
              <path d="M9 21l3-4 3 4" />
            </svg>
          </div>

          <div className="revenue-trend__title-group">
            <div className="revenue-trend__title-line">
              <h2 id="revenue-trend-title">
                Revenue Trend vs. Target
              </h2>

              <span className="revenue-trend__badge">
                ILLUSTRATIVE
              </span>
            </div>

            <p>
              Monthly realized revenue and forecast, FY 2028
            </p>
          </div>
        </div>

        <div className="revenue-trend__summary">
          <div className="revenue-trend__performance">
            <svg
              viewBox="0 0 16 16"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {performancePercentage >= 0 ? (
                <path d="m3 10 5-5 5 5" />
              ) : (
                <path d="m3 6 5 5 5-5" />
              )}
            </svg>

            <span>{performanceLabel}</span>
          </div>

          <p>
            YTD {formatMillions(yearToDateRealized)} realized vs{" "}
            {formatMillions(yearToDateTarget)} target
          </p>
        </div>
      </header>

      <div
        className="revenue-trend__legend"
        aria-label="Chart legend"
      >
        <span className="revenue-trend__legend-item">
          <span className="revenue-trend__legend-square" />
          Realized
        </span>

        <span className="revenue-trend__legend-item">
          <span className="revenue-trend__legend-line" />
          Target / budget
        </span>

        <span className="revenue-trend__legend-item">
          <span className="revenue-trend__legend-forecast" />
          Upcoming months
        </span>
      </div>

      <div
        className="revenue-trend__chart"
        role="img"
        aria-label={`Revenue trend versus target from January to December. Realized revenue is shown through July, with forecast bars from August onward. Year-to-date realized revenue is ${yearToDateRealized} million Ugandan shillings against a target of ${yearToDateTarget} million.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={revenueData}
            margin={{
              top: 10,
              right: 8,
              bottom: 0,
              left: 0,
            }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--color-chart-grid)"
              strokeWidth={1}
            />

            <XAxis
              dataKey="month"
              axisLine={{
                stroke: "var(--color-chart-axis)",
              }}
              tickLine={false}
              tick={{
                fill: "var(--color-text-muted)",
                fontSize: 12,
              }}
              tickMargin={10}
              minTickGap={8}
            />

            <YAxis
              domain={[0, 160]}
              ticks={[0, 40, 80, 120, 160]}
              tickFormatter={(value: number) => `${value}M`}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--color-text-muted)",
                fontSize: 12,
              }}
              width={54}
            />

            <Tooltip
              formatter={(value, name) => {
                const label =
                  name === "Realized"
                    ? "Realized"
                    : name === "Forecast"
                      ? "Forecast"
                      : "Target / budget";

                return [
                  formatMillions(Number(value ?? 0)),
                  label,
                ];
              }}
              labelFormatter={(label) => `Month: ${label}`}
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
                fontSize: 12,
              }}
              cursor={{
                fill: "var(--color-surface-subtle)",
                opacity: 0.45,
              }}
            />

            <Bar
              dataKey="realized"
              name="Realized"
              fill="var(--color-chart-realized)"
              barSize={36}
              radius={[5, 5, 0, 0]}
              isAnimationActive={false}
            />

            <Bar
              dataKey="forecast"
              name="Forecast"
              fill="var(--color-chart-forecast)"
              stroke="var(--color-border-strong)"
              strokeDasharray="3 3"
              strokeWidth={1}
              barSize={36}
              radius={[5, 5, 0, 0]}
              isAnimationActive={false}
            />

            <Line
              dataKey="target"
              name="Target / budget"
              type="linear"
              stroke="#F1BA1B"
              strokeWidth={2.5}
              strokeDasharray="6 5"
              dot={{
                r: 4,
                fill: "var(--color-surface)",
                stroke: "#F1BA1B",
                strokeWidth: 2.5,
              }}
              activeDot={{
                r: 5,
                fill: "var(--color-surface)",
                stroke: "#F1BA1B",
                strokeWidth: 2.5,
              }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}