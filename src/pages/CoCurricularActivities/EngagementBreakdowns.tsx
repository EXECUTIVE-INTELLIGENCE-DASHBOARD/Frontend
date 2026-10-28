import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SVGProps } from "react";

import type { CoCurricularDashboardData } from "../../api/academics.api";

interface EngagementBreakdownsProps {
  data: CoCurricularDashboardData;
}

interface CategoryAxisTickProps extends SVGProps<SVGTextElement> {
  payload?: { value?: string };
}

export function categoryAxisLines(label: string) {
  const visualArtsIndex = label.toLowerCase().indexOf("visual");
  if (/^performing and visual arts$/i.test(label) && visualArtsIndex > 0) {
    return [label.slice(0, visualArtsIndex - 1), label.slice(visualArtsIndex)];
  }
  return [label];
}

function CategoryAxisTick({ x = 0, y = 0, payload }: CategoryAxisTickProps) {
  const label = payload?.value ?? "";
  const lines = categoryAxisLines(label);

  return (
    <text
      x={x}
      y={y}
      transform={`rotate(-25 ${x} ${y})`}
      textAnchor="end"
      fill="var(--color-text-secondary)"
      fontSize={9}
    >
      {lines.map((line, index) => (
        <tspan key={line} x={x} dy={index === 0 ? 0 : 12}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function formatRate(value: number | null) {
  return value == null ? "—" : `${value.toFixed(1)}%`;
}

type ClassBand = "primary" | "secondary" | "other";

const earlyYearsOrder = new Map([
  ["baby class", 0],
  ["baby", 0],
  ["middle", 1],
  ["middle class", 1],
  ["top", 2],
  ["top class", 2],
  ["nursery", 3],
]);

function primaryLevelOrder(classLevel: string): number | undefined {
  const normalized = classLevel.trim().toLowerCase();
  const earlyYearsRank = earlyYearsOrder.get(normalized);
  if (earlyYearsRank !== undefined) return earlyYearsRank;

  const primaryMatch = normalized.match(/\b(?:p|primary\s+)([1-7])\b/);
  return primaryMatch ? Number(primaryMatch[1]) + 3 : undefined;
}

function secondaryLevelOrder(classLevel: string): number | undefined {
  const match = classLevel
    .trim()
    .toLowerCase()
    .match(/\b(?:s|secondary\s+|senior\s+)([1-6])\b/);
  return match ? Number(match[1]) - 1 : undefined;
}

function classBand(classLevel: string): ClassBand {
  if (primaryLevelOrder(classLevel) !== undefined) return "primary";
  if (secondaryLevelOrder(classLevel) !== undefined) return "secondary";
  return "other";
}

function classOrder(classLevel: string) {
  const primaryRank = primaryLevelOrder(classLevel);
  if (primaryRank !== undefined) return primaryRank;

  const secondaryRank = secondaryLevelOrder(classLevel);
  if (secondaryRank !== undefined) return secondaryRank;

  return Number.MAX_SAFE_INTEGER;
}

function compareClassRows(
  left: CoCurricularDashboardData["by_class"][number],
  right: CoCurricularDashboardData["by_class"][number],
) {
  const bandOrder: Record<ClassBand, number> = {
    primary: 0,
    secondary: 1,
    other: 2,
  };
  const bandDifference =
    bandOrder[classBand(left.class_level)] -
    bandOrder[classBand(right.class_level)];
  if (bandDifference !== 0) return bandDifference;

  return (
    classOrder(left.class_level) - classOrder(right.class_level) ||
    left.class_level.localeCompare(right.class_level) ||
    left.stream.localeCompare(right.stream)
  );
}

export function EngagementBreakdowns({ data }: EngagementBreakdownsProps) {
  const orderedClassRows = [...data.by_class].sort(compareClassRows);
  const classGroups = [
    {
      label: "Primary",
      rows: orderedClassRows.filter(
        (row) => classBand(row.class_level) === "primary",
      ),
    },
    {
      label: "Secondary / GIS",
      rows: orderedClassRows.filter(
        (row) => classBand(row.class_level) === "secondary",
      ),
    },
    {
      label: "Other",
      rows: orderedClassRows.filter(
        (row) => classBand(row.class_level) === "other",
      ),
    },
  ].filter((group) => group.rows.length > 0);

  return (
    <div className="cc-breakdowns">
      <section className="cc-card cc-breakdown cc-breakdown--category">
        <div className="cc-card__header">
          <h2 className="cc-card__title">Participation by Category</h2>
        </div>
        {data.by_category.length ? (
          <div className="cc-category-chart">
            <div
              className="cc-category-chart__visual"
              aria-label="Participation by category bar chart"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.by_category}
                  margin={{ top: 24, right: 8, bottom: 0, left: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--color-border-soft)"
                  />
                  <XAxis
                    dataKey="label"
                    interval={0}
                    height={58}
                    tick={<CategoryAxisTick />}
                  />
                  <YAxis
                    allowDecimals={false}
                    width={34}
                    tick={{ fill: "var(--color-text-secondary)", fontSize: 9 }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="participants"
                    name="Participants"
                    fill="var(--brand-sky)"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <p className="cc-empty">—</p>
        )}
      </section>

      <section className="cc-card cc-breakdown">
        <div className="cc-card__header">
          <h2 className="cc-card__title">Participation by Class &amp; Stream</h2>
        </div>
        <div className="cc-table-wrap">
          <table className="cc-table cc-class-table">
            <thead>
              <tr>
                <th scope="col">Class</th>
                <th scope="col">Stream</th>
                <th scope="col" className="cc-num">Active learners</th>
                <th scope="col" className="cc-num">Participation rate</th>
              </tr>
            </thead>
            <tbody>
              {classGroups.length ? (
                classGroups.flatMap((group) => [
                  <tr
                    className="cc-class-table__group"
                    key={`group-${group.label}`}
                  >
                    <th colSpan={4} scope="rowgroup">
                      {group.label}
                    </th>
                  </tr>,
                  ...group.rows.map((row) => (
                    <tr key={`${row.class_level}-${row.stream}`}>
                      <td>{row.class_level}</td>
                      <td>{row.stream || "Unassigned"}</td>
                      <td className="cc-num">
                        {row.active_learners.toLocaleString()}
                      </td>
                      <td className="cc-num">{formatRate(row.participation_rate)}</td>
                    </tr>
                  )),
                ])
              ) : (
                <tr>
                  <td colSpan={4} className="cc-muted">
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
