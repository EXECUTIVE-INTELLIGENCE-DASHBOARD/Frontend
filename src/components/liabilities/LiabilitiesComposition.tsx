import { Info } from "lucide-react";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";

import "./LiabilitiesComposition.css";

const liabilityCategories = [
  {
    name: "Current Payables (0-30 Days)",
    description: "Immediate obligations & invoices",
    amount: 94.2,
    percentage: "66.1%",
    color: "#172448",
  },
  {
    name: "Accrued Expenses & Tax",
    description: "Statutory deductions & utilities",
    amount: 28.5,
    percentage: "20.0%",
    color: "#0ea5e9",
  },
  {
    name: "Long-Term Debt & Commitments",
    description: "Contracts, CapEx & Encumbered",
    amount: 19.8,
    percentage: "13.9%",
    color: "#f59e0b",
  },
];

export function LiabilitiesComposition() {
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

      <div className="liabilities-composition__chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={liabilityCategories}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="85%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              cornerRadius={0}
              stroke="none"
              isAnimationActive={false}
            >
              {liabilityCategories.map((category) => (
                <Cell
                  key={category.name}
                  fill={category.color}
                  stroke={category.color}
                  strokeWidth={1}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="liabilities-composition__chart-center">
          <strong>UGX 142.5M</strong>
          <span>TOTAL LIAB</span>
        </div>
      </div>

      <div className="liabilities-composition__breakdown">
        {liabilityCategories.map((category) => (
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
              <strong>
                UGX {category.amount.toFixed(1)}M
              </strong>
              <span style={{ color: category.color }}>
                {category.percentage}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}