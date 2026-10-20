
import { Info } from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { CampusOption } from "../filters/CampusFilter";

import "./LiabilitiesComposition.css";

interface LiabilitiesCompositionProps {
  campus?: CampusOption;
}

interface LiabilityCategory {
  name: string;
  description: string;
  amount: number;
  color: string;
}

const categoryData: Record<string, LiabilityCategory[]> = {
  "All Campuses": [
    {
      name: "Current Payables (0–30 Days)",
      description: "Immediate obligations and invoices",
      amount: 94.2,
      color: "#172448",
    },
    {
      name: "Accrued Expenses & Tax",
      description: "Statutory deductions and utilities",
      amount: 28.5,
      color: "#0ea5e9",
    },
    {
      name: "Long-Term Debt & Commitments",
      description: "Contracts, capital expenditure and commitments",
      amount: 19.8,
      color: "#f59e0b",
    },
  ],
  Kibuli: [
    {
      name: "Current Payables (0–30 Days)",
      description: "Immediate obligations and invoices",
      amount: 40.2,
      color: "#172448",
    },
    {
      name: "Accrued Expenses & Tax",
      description: "Statutory deductions and utilities",
      amount: 12.5,
      color: "#0ea5e9",
    },
    {
      name: "Long-Term Debt & Commitments",
      description: "Contracts, capital expenditure and commitments",
      amount: 9.8,
      color: "#f59e0b",
    },
  ],
  Buwaate: [
    {
      name: "Current Payables (0–30 Days)",
      description: "Immediate obligations and invoices",
      amount: 20.0,
      color: "#172448",
    },
    {
      name: "Accrued Expenses & Tax",
      description: "Statutory deductions and utilities",
      amount: 6.5,
      color: "#0ea5e9",
    },
    {
      name: "Long-Term Debt & Commitments",
      description: "Contracts, capital expenditure and commitments",
      amount: 4.5,
      color: "#f59e0b",
    },
  ],
  "Kansanga International": [
    {
      name: "Current Payables (0–30 Days)",
      description: "Immediate obligations and invoices",
      amount: 34.0,
      color: "#172448",
    },
    {
      name: "Accrued Expenses & Tax",
      description: "Statutory deductions and utilities",
      amount: 9.5,
      color: "#0ea5e9",
    },
    {
      name: "Long-Term Debt & Commitments",
      description: "Contracts, capital expenditure and commitments",
      amount: 5.5,
      color: "#f59e0b",
    },
  ],
};

const formatAmount = (amount: number) =>
  `UGX ${amount.toFixed(1)}M`;

export function LiabilitiesComposition({
  campus = "All Campuses",
}: LiabilitiesCompositionProps) {
  const liabilityCategories =
    categoryData[String(campus)] ?? categoryData["All Campuses"];

  const total = liabilityCategories.reduce(
    (sum, category) => sum + category.amount,
    0,
  );

  const chartData = liabilityCategories.map((category) => ({
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
        Liabilities Composition
      </h2>

      <div
        className="liabilities-composition__chart"
        role="img"
        aria-label={`Liabilities composition for ${String(campus)}, total ${formatAmount(total)}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="85%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              stroke="none"
              isAnimationActive={false}
            >
              {chartData.map((category) => (
                <Cell
                  key={category.name}
                  fill={category.color}
                  stroke={category.color}
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                formatAmount(Number(value)),
                String(name),
              ]}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="liabilities-composition__chart-center">
          <strong>{formatAmount(total)}</strong>
          <span>TOTAL LIABILITIES</span>
        </div>
      </div>

      <div className="liabilities-composition__breakdown">
        {chartData.map((category) => (
          <article
            className="liability-breakdown"
            key={category.name}
          >
            <span
              className="liability-breakdown__dot"
              style={{ backgroundColor: category.color }}
              aria-hidden="true"
            />

            <div className="liability-breakdown__details">
              <h3>{category.name}</h3>
              <p>{category.description}</p>
            </div>

            <div className="liability-breakdown__amount">
              <strong>{formatAmount(category.amount)}</strong>
              <span style={{ color: category.color }}>
                {category.percentage.toFixed(1)}%
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
