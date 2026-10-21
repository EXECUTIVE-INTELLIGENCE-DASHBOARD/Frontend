
import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Landmark,
  ShieldAlert,
  ClipboardList,
  Clock3,
  PackageCheck,
  Truck,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import "./FinanceOverview.css";

const years = [2024, 2025, 2026, 2027, 2028];
const terms = ["Term 1", "Term 2", "Term 3"];

const sectionsByCampus: Record<string, string[]> = {
  "All Campuses": [
    "All Sections",
    "Nursery",
    "Primary",
    "Secondary",
    "Preschool",
  ],
  "Kibuli Campus": [
    "All Sections",
    "Nursery",
    "Primary",
    "Secondary",
  ],
  "Buwaate Campus": [
    "All Sections",
    "Nursery",
    "Primary",
  ],
  "Annex / Preschool Branch": [
    "All Sections",
    "Preschool",
  ],
};

const metrics = [
  {
    icon: CircleDollarSign,
    label: "Total Revenue",
    value: "UGX 850.0M",
  },
  {
    icon: ArrowDownRight,
    label: "Operational Expenditure",
    value: "UGX 540.0M",
  },
  {
    icon: Landmark,
    label: "Cash & Bank Balances",
    value: "UGX 185.0M",
  },
];

const budgetRows = [
  { label: "Revenue", budget: 900, actual: 850 },
  { label: "Operating expenditure", budget: 600, actual: 540 },
  { label: "Capital expenditure", budget: 200, actual: 145 },
];

const financialIndicators = [
  {
    label: "Cash and bank balances",
    description: "Funds held across bank accounts and cash holdings",
    value: "UGX 185.0M",
  },
  {
    label: "Outstanding receivables",
    description: "Fees and other income awaiting collection",
    value: "UGX 229.5M",
  },
  {
    label: "Outstanding liabilities",
    description: "Supplier balances and other unpaid obligations",
    value: "UGX 142.5M",
  },
  {
    label: "Fee collection",
    description: "Share of expected fees collected",
    value: "73.0%",
  },
  {
    label: "Loan repayments",
    description: "Scheduled repayments requiring cash-flow planning",
    value: "UGX 24.0M",
  },
  {
    label: "Capital expenditure",
    description: "Spending recorded against capital projects",
    value: "UGX 145.0M",
  },
];

const riskItems = [
  {
    level: "Attention",
    title: "Revenue below budget",
    description:
      "Revenue is UGX 50M below the UGX 900M target. Review fee collection, other income sources and the revenue forecast, then agree on corrective actions.",
  },
  {
    level: "Monitor",
    title: "Loan repayment obligations",
    description:
      "Confirm repayment dates and amounts against available cash, expected collections and upcoming payments. Escalate any projected funding shortfall.",
  },
  {
    level: "Monitor",
    title: "Capital project commitments",
    description:
      "Compare approved project budgets with actual expenditure, outstanding purchase commitments and delivery milestones before authorising further spending.",
  },
];

const procurementMetrics = [
  {
    icon: ClipboardList,
    label: "Purchase Orders",
    value: "53",
    note: "Orders recorded in the period",
  },
  {
    icon: Clock3,
    label: "Pending Approvals",
    value: "9",
    note: "Awaiting approval",
  },
  {
    icon: PackageCheck,
    label: "Completed Orders",
    value: "32",
    note: "Orders fulfilled",
  },
  {
    icon: Truck,
    label: "Delayed Deliveries",
    value: "7",
    note: "Require follow-up",
  },
];

const procurementStatusData = [
  { name: "Completed", value: 32, color: "#87CEFA" },
  { name: "Pending approval", value: 9, color: "#d9a441" },
  { name: "In progress", value: 5, color: "#04245b" },
  { name: "Delayed", value: 7, color: "#cf6464" },
];

const procurementActivityData = [
  { month: "Jan", raised: 12, completed: 9 },
  { month: "Feb", raised: 15, completed: 11 },
  { month: "Mar", raised: 18, completed: 14 },
  { month: "Apr", raised: 14, completed: 12 },
  { month: "May", raised: 21, completed: 16 },
  { month: "Jun", raised: 19, completed: 17 },
];

const supplierPerformanceData = [
  {
    supplier: "Supplier A",
    orders: 14,
    onTime: 93,
    status: "Good",
  },
  {
    supplier: "Supplier B",
    orders: 11,
    onTime: 82,
    status: "Monitor",
  },
  {
    supplier: "Supplier C",
    orders: 8,
    onTime: 75,
    status: "Review",
  },
];

const formatAmount = (amount: number) =>
  `UGX ${Math.abs(amount).toFixed(1)}M`;

type ReportingFilterProps = {
  year: number;
  term: string;
  onYearChange: (year: number) => void;
  onTermChange: (term: string) => void;
};

function ReportingFilters({
  year,
  term,
  onYearChange,
  onTermChange,
}: ReportingFilterProps) {
  return (
    <div className="finance-overview__report-filters">
      <label>
        <select
          value={year}
          onChange={(event) =>
            onYearChange(Number(event.target.value))
          }
          aria-label="Reporting year"
        >
          {years.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        <select
          value={term}
          onChange={(event) =>
            onTermChange(event.target.value)
          }
          aria-label="Reporting term"
        >
          {terms.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export function FinanceOverview() {
  const [campus, setCampus] = useState("All Campuses");
  const [section, setSection] = useState("All Sections");

  const [budgetYear, setBudgetYear] = useState(2026);
  const [budgetTerm, setBudgetTerm] = useState("Term 1");

  const [liquidityYear, setLiquidityYear] = useState(2026);
  const [liquidityTerm, setLiquidityTerm] = useState("Term 1");

  const [riskYear, setRiskYear] = useState(2026);
  const [riskTerm, setRiskTerm] = useState("Term 1");

  const availableSections = sectionsByCampus[campus];

  function handleCampusChange(nextCampus: string) {
    setCampus(nextCampus);
    setSection("All Sections");
  }

  return (
    <div className="finance-overview">
      <section
        className="finance-overview__scope"
        aria-label="Campus filters"
      >
        <label>
          <select
            aria-label="Campus"
            value={campus}
            onChange={(event) =>
              handleCampusChange(event.target.value)
            }
          >
            {Object.keys(sectionsByCampus).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          <select
            aria-label="School section"
            value={section}
            onChange={(event) => setSection(event.target.value)}
          >
            {availableSections.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section
        className="finance-overview__metrics"
        aria-label="Financial summary"
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              className="finance-overview__metric"
              key={metric.label}
            >
              <span className="finance-overview__icon">
                <Icon size={21} aria-hidden="true" />
              </span>

              <div className="finance-overview__metric-content">
                <span className="finance-overview__metric-label">
                  {metric.label}
                </span>

                <strong className="finance-overview__metric-value">
                  {metric.value}
                </strong>
              </div>
            </article>
          );
        })}
      </section>

      <section
        className="finance-overview__procurement"
        aria-label="Procurement summary"
      >
        <div className="finance-overview__section-heading">
          <div>
            <h2>Procurement Performance</h2>
            <p>
              Purchase orders, approvals and supplier fulfilment
            </p>
          </div>

          <span className="finance-overview__sample-tag">
            Illustrative data
          </span>
        </div>

        <div className="finance-overview__procurement-metrics">
          {procurementMetrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <article
                className="finance-overview__metric"
                key={metric.label}
              >
                <span className="finance-overview__icon">
                  <Icon size={21} aria-hidden="true" />
                </span>

                <div className="finance-overview__metric-content">
                  <span className="finance-overview__metric-label">
                    {metric.label}
                  </span>

                  <strong className="finance-overview__metric-value">
                    {metric.value}
                  </strong>

                  <span className="finance-overview__procurement-note">
                    {metric.note}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="finance-overview__grid">
        <article className="finance-overview__panel">
          <div className="finance-overview__panel-heading">
            <div>
              <h2>Budget vs Actual</h2>
              <p>Financial performance · UGX millions</p>
            </div>

            <ReportingFilters
              year={budgetYear}
              term={budgetTerm}
              onYearChange={setBudgetYear}
              onTermChange={setBudgetTerm}
            />
          </div>

          <div className="finance-overview__budget-chart">
            <div className="finance-overview__chart-legend">
              <span>
                <i className="finance-overview__legend-dot finance-overview__legend-dot--budget" />
                Budget
              </span>

              <span>
                <i className="finance-overview__legend-dot finance-overview__legend-dot--actual" />
                Actual
              </span>
            </div>

            {budgetRows.map((row) => {
              const maxAmount = 900;
              const budgetWidth =
                (row.budget / maxAmount) * 100;
              const actualWidth =
                (row.actual / maxAmount) * 100;
              const variance = row.actual - row.budget;
              const percentage =
                (row.actual / row.budget) * 100;

              return (
                <div
                  className="finance-overview__chart-row"
                  key={row.label}
                >
                  <div className="finance-overview__chart-row-heading">
                    <strong>{row.label}</strong>
                    <span>
                      {percentage.toFixed(1)}% of budget
                    </span>
                  </div>

                  <div className="finance-overview__bar-group">
                    <div className="finance-overview__bar-line">
                      <span className="finance-overview__bar-label">
                        Budget
                      </span>

                      <div className="finance-overview__bar-track">
                        <div
                          className="finance-overview__bar finance-overview__bar--budget"
                          style={{
                            width: `${budgetWidth}%`,
                          }}
                        />
                      </div>

                      <span className="finance-overview__bar-amount">
                        {formatAmount(row.budget)}
                      </span>
                    </div>

                    <div className="finance-overview__bar-line">
                      <span className="finance-overview__bar-label">
                        Actual
                      </span>

                      <div className="finance-overview__bar-track">
                        <div
                          className="finance-overview__bar finance-overview__bar--actual"
                          style={{
                            width: `${actualWidth}%`,
                          }}
                        />
                      </div>

                      <span className="finance-overview__bar-amount">
                        {formatAmount(row.actual)}
                      </span>
                    </div>
                  </div>

                  <div className="finance-overview__chart-variance">
                    <span>Variance (actual − budget)</span>

                    <strong
                      className={
                        variance < 0 ? "is-favourable" : ""
                      }
                    >
                      {variance < 0 ? "−" : "+"}
                      {formatAmount(variance)}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="finance-overview__footnote">
            Revenue below budget indicates an income shortfall.
            Expenditure underspend should be reviewed against
            delivery progress, unpaid invoices and outstanding
            commitments.
          </p>
        </article>

        <article className="finance-overview__panel">
          <div className="finance-overview__panel-heading">
            <div>
              <h2>Liquidity &amp; Financial Position</h2>
              <p>Cash resources, collections and obligations</p>
            </div>

            <ReportingFilters
              year={liquidityYear}
              term={liquidityTerm}
              onYearChange={setLiquidityYear}
              onTermChange={setLiquidityTerm}
            />
          </div>

          <div className="finance-overview__position-list">
            {financialIndicators.map((item) => (
              <div
                className="finance-overview__position-row"
                key={item.label}
              >
                <div className="finance-overview__position-details">
                  <span className="finance-overview__position-label">
                    {item.label}
                  </span>

                  <span className="finance-overview__position-description">
                    {item.description}
                  </span>
                </div>

                <strong className="finance-overview__position-value">
                  {item.value}
                </strong>
              </div>
            ))}
          </div>

          <div className="finance-overview__liquidity-note">
            <ShieldAlert size={18} aria-hidden="true" />

            <p>
              Assess liquidity using expected collections, payment
              due dates, restricted funds and the cash-flow forecast.
              Cash balances alone do not establish the ability to
              meet upcoming obligations.
            </p>
          </div>
        </article>
      </section>

      <section
        className="finance-overview__procurement-grid"
        aria-label="Procurement analysis"
      >
        <article className="finance-overview__panel">
          <div className="finance-overview__panel-heading">
            <div>
              <h2>Purchase Order Activity</h2>
              <p>Orders raised versus completed each month</p>
            </div>
            <ClipboardList size={20} aria-hidden="true" />
          </div>

          <div className="finance-overview__procurement-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={procurementActivityData}
                margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e9edf3"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#7c8798", fontSize: 11 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#7c8798", fontSize: 11 }}
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="raised"
                  name="Orders raised"
                  fill="#041d4a"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="completed"
                  name="Orders completed"
                  fill="#87CEFA"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="finance-overview__footnote">
            Compare purchasing activity with fulfilment to identify
            growing backlogs and potential delivery delays.
          </p>
        </article>

        <article className="finance-overview__panel">
          <div className="finance-overview__panel-heading">
            <div>
              <h2>Purchase Order Status</h2>
              <p>Illustrative distribution of order statuses</p>
            </div>
            <PackageCheck size={20} aria-hidden="true" />
          </div>

          <div className="finance-overview__status-layout">
            <div className="finance-overview__status-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={procurementStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="56%"
                    outerRadius="82%"
                    paddingAngle={3}
                  >
                    {procurementStatusData.map((item) => (
                      <Cell
                        key={item.name}
                        fill={item.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="finance-overview__status-legend">
              {procurementStatusData.map((item) => (
                <div
                  className="finance-overview__status-item"
                  key={item.name}
                >
                  <span>
                    <i style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <p className="finance-overview__footnote">
            Delayed orders and requests awaiting approval should be
            reviewed alongside supplier commitments and purchasing policies.
          </p>
        </article>

        <article className="finance-overview__panel finance-overview__supplier-panel">
          <div className="finance-overview__panel-heading">
            <div>
              <h2>Supplier Performance</h2>
              <p>Illustrative on-time delivery indicators</p>
            </div>
            <Truck size={20} aria-hidden="true" />
          </div>

          <div className="finance-overview__supplier-table-wrap">
            <table className="finance-overview__supplier-table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Orders</th>
                  <th>On-time delivery</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {supplierPerformanceData.map((supplier) => (
                  <tr key={supplier.supplier}>
                    <td>{supplier.supplier}</td>
                    <td>{supplier.orders}</td>
                    <td>
                      <div className="finance-overview__delivery-cell">
                        <span>{supplier.onTime}%</span>
                        <div className="finance-overview__delivery-track">
                          <div
                            className="finance-overview__delivery-fill"
                            style={{
                              width: `${supplier.onTime}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`finance-overview__supplier-status finance-overview__supplier-status--${supplier.status.toLowerCase()}`}
                      >
                        {supplier.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="finance-overview__panel finance-overview__risks">
        <div className="finance-overview__panel-heading">
          <div>
            <h2>Financial Risks &amp; Board Attention</h2>
            <p>
              Key financial issues for review, action and oversight
            </p>
          </div>

          <ReportingFilters
            year={riskYear}
            term={riskTerm}
            onYearChange={setRiskYear}
            onTermChange={setRiskTerm}
          />
        </div>

        <div className="finance-overview__risk-list">
          {riskItems.map((item, index) => (
            <div
              className="finance-overview__risk"
              key={item.title}
            >
              <span
                className={`finance-overview__risk-number finance-overview__risk-number--${index + 1}`}
              >
                {index === 0 ? (
                  <ArrowDownRight
                    size={18}
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowUpRight
                    size={18}
                    aria-hidden="true"
                  />
                )}
              </span>

              <div>
                <div className="finance-overview__risk-title">
                  <strong>{item.title}</strong>
                  <span>{item.level}</span>
                </div>

                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
