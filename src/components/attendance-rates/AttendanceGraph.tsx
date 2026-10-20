import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import "./AttendanceGraph.css";

type AttendanceData = {
  day: string;
  nursery: number;
  primary: number;
  oLevel: number;
  aLevel: number;
};

const weeklyData: AttendanceData[] = [
  { day: "Mon", nursery: 96, primary: 94, oLevel: 91, aLevel: 89 },
  { day: "Tue", nursery: 97, primary: 95, oLevel: 92, aLevel: 90 },
  { day: "Wed", nursery: 95, primary: 93, oLevel: 90, aLevel: 88 },
  { day: "Thu", nursery: 98, primary: 96, oLevel: 93, aLevel: 91 },
  { day: "Fri", nursery: 96, primary: 94, oLevel: 91, aLevel: 89 },
];

const divisions = [
  { key: "nursery", label: "Nursery", color: "var(--pal-steel)" },
  { key: "primary", label: "Primary", color: "var(--pal-sky)" },
  { key: "oLevel", label: "O-Level", color: "var(--pal-amber)" },
  { key: "aLevel", label: "A-Level", color: "var(--chart-navy)" },
] as const;

export function AttendanceGraph() {
  const [selectedWeek, setSelectedWeek] = useState("Current Week");

  return (
    <section className="attendance-graph">
      <div className="attendance-graph__header">
        <div>
          <h2 className="attendance-graph__title">Weekly Attendance Trend</h2>
          <p className="attendance-graph__subtitle">
            Attendance by school division
          </p>
        </div>

        <label className="attendance-graph__week">
          <span className="sr-only">Select week</span>
          <select
            value={selectedWeek}
            onChange={(event) => setSelectedWeek(event.target.value)}
          >
            <option value="Current Week">Current Week</option>
            <option value="Previous Week">Previous Week</option>
          </select>
          <ChevronDown size={15} aria-hidden="true" />
        </label>
      </div>

      <div className="attendance-graph__legend">
        {divisions.map((division) => (
          <span className="attendance-graph__legend-item" key={division.key}>
            <span
              className="attendance-graph__legend-dot"
              style={{ backgroundColor: division.color }}
            />
            {division.label}
          </span>
        ))}
      </div>

      <div className="attendance-graph__chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weeklyData}
            margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
            barCategoryGap="24%"
            barGap={3}
          >
            <CartesianGrid
              stroke="var(--color-chart-grid)"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--color-text-muted)",
                fontSize: 11,
              }}
              dy={8}
            />

            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--color-text-muted)",
                fontSize: 10,
              }}
              tickFormatter={(value: number) => `${value}%`}
            />

            <Tooltip
              cursor={{
                fill: "var(--color-surface-hover)",
              }}
              contentStyle={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                color: "var(--color-heading)",
                fontSize: 12,
                boxShadow: "var(--shadow-pop)",
              }}
              itemStyle={{
                color: "var(--color-text)",
              }}
              labelStyle={{
                color: "var(--color-heading)",
                fontWeight: 600,
                marginBottom: 4,
              }}
              formatter={(value, name) => [
                `${value}%`,
                divisions.find((division) => division.key === name)?.label ??
                  name,
              ]}
              labelFormatter={(label) => `${label}`}
            />

            <Bar
              dataKey="nursery"
              name="nursery"
              fill={divisions[0].color}
              radius={[3, 3, 0, 0]}
              maxBarSize={16}
            />

            <Bar
              dataKey="primary"
              name="primary"
              fill={divisions[1].color}
              radius={[3, 3, 0, 0]}
              maxBarSize={16}
            />

            <Bar
              dataKey="oLevel"
              name="oLevel"
              fill={divisions[2].color}
              radius={[3, 3, 0, 0]}
              maxBarSize={16}
            />

            <Bar
              dataKey="aLevel"
              name="aLevel"
              fill={divisions[3].color}
              radius={[3, 3, 0, 0]}
              maxBarSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
