import { Info } from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  formatLiabilityCurrency,
  type LiabilityCategoryTotal,
} from "../../pages/Liabilities/liabilitiesDashboard";
import "./LiabilitiesComposition.css";

interface LiabilitiesCompositionProps {
  categories: LiabilityCategoryTotal[];
}

export function LiabilitiesComposition({ categories }: LiabilitiesCompositionProps) {
  const total = categories.reduce((sum, category) => sum + category.amount, 0);
  const chartData = categories.map((category) => ({
    ...category,
    percentage: total > 0 ? (category.amount / total) * 100 : 0,
  }));

  return (
    <section
      className="liabilities-composition"
      aria-labelledby="liabilities-composition-title"
    >
      <h2
        className="liabilities-composition__title"
        id="liabilities-composition-title"
      >
        <Info size={20} aria-hidden="true" />
        What is owed, by type
      </h2>
      <div className="liabilities-composition__overview">
        <div
          className="liabilities-composition__chart"
          role="img"
          aria-label={`Liabilities composition, total ${formatLiabilityCurrency(total)}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius="66%"
                outerRadius="88%"
                startAngle={90}
                endAngle={-270}
                stroke="none"
                isAnimationActive={false}
              >
                {chartData.map((category) => (
                  <Cell
                    key={category.label}
                    fill={category.color}
                    stroke={category.color}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  formatLiabilityCurrency(Number(value)),
                  String(name),
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="liabilities-composition__chart-center">
            <strong>{formatLiabilityCurrency(total)}</strong>
            <span>OWED</span>
          </div>
        </div>

        <div className="liabilities-composition__breakdown">
          {chartData.map((category) => (
            <div className="liability-breakdown" key={category.label}>
              <span
                className="liability-breakdown__dot"
                style={{ backgroundColor: category.color }}
                aria-hidden="true"
              />
              <span className="liability-breakdown__name">
                {category.label}
              </span>
              <strong>{formatLiabilityCurrency(category.amount)}</strong>
              <span className="liability-breakdown__percentage">
                {category.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
