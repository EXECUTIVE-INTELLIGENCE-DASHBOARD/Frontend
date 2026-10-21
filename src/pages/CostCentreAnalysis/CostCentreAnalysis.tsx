
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CircleDollarSign,
  Percent,
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

import "./CostCentreAnalysis.css";

const years = [2024, 2025, 2026, 2027, 2028];
const terms = ["Term 1", "Term 2", "Term 3"];

const campuses = [
  "All Campuses",
  "Kibuli Campus",
  "Buwaate Campus",
  "Annex/Preschool Branch",
];

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
  "Annex/Preschool Branch": [
    "All Sections",
    "Preschool",
    "Primary",
    "Secondary",
  ],
};

const departments = [
  {
    name: "Academics",
    campus: "Kibuli Campus",
    budget: 220,
    actual: 184,
  },
  {
    name: "Boarding",
    campus: "Kibuli Campus",
    budget: 140,
    actual: 126,
  },
  {
    name: "Administration",
    campus: "Kibuli Campus",
    budget: 100,
    actual: 82,
  },
  {
    name: "Transport",
    campus: "Buwaate Campus",
    budget: 70,
    actual: 76,
  },
  {
    name: "ICT",
    campus: "Buwaate Campus",
    budget: 60,
    actual: 42,
  },
  {
    name: "Sports",
    campus: "Annex/Preschool Branch",
    budget: 45,
    actual: 31,
  },
  {
    name: "Health",
    campus: "Annex/Preschool Branch",
    budget: 35,
    actual: 21,
  },
  {
    name: "Facilities",
    campus: "Annex/Preschool Branch",
    budget: 30,
    actual: 18,
  },
];

const formatAmount = (value: number) =>
  `UGX ${value.toLocaleString("en-UG", {
    maximumFractionDigits: 1,
  })}M`;

const formatCompact = (value: number) => `${value}M`;

const formatPercent = (value: number) => `${value.toFixed(1)}%`;


const chartColours = [
  "#203468", // Brand Dark Navy
  "#F1BA1B", // Brand Gold
  "#2AA4DD", // Brand Light Blue
  "#7C83DB",
  "#4e8de6",
  "#C38B65",
  "#8A9BAE",
  "#A68AC7",
];


type FilterProps = {
  year: number;
  term: string;
  onYearChange: (value: number) => void;
  onTermChange: (value: string) => void;
};

function ReportingFilters({
  year,
  term,
  onYearChange,
  onTermChange,
}: FilterProps) {
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
          {years.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label>
        
        <select
          value={term}
          onChange={(event) => onTermChange(event.target.value)}
          aria-label="Reporting term"
        >
          {terms.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export function CostCentreAnalysis() {
  const [campus, setCampus] = useState("All Campuses");
const [section, setSection] = useState("All Sections");
const [year, setYear] = useState(2026);
const [term, setTerm] = useState("Term 1");

const availableSections = sectionsByCampus[campus];

  const filteredDepartments = useMemo(
    () =>
      departments.filter(
        (department) =>
          campus === "All Campuses" ||
          department.campus === campus,
      ),
    [campus],
  );

  const totals = useMemo(() => {
    const budget = filteredDepartments.reduce(
      (sum, item) => sum + item.budget,
      0,
    );
    const actual = filteredDepartments.reduce(
      (sum, item) => sum + item.actual,
      0,
    );
    const variance = budget - actual;

    return {
      budget,
      actual,
      variance,
      utilisation: budget ? (actual / budget) * 100 : 0,
      overBudget: filteredDepartments.filter(
        (item) => item.actual > item.budget,
      ).length,
    };
  }, [filteredDepartments]);

  const chartData = filteredDepartments.map((item) => ({
    department: item.name,
    Budget: item.budget,
    Actual: item.actual,
    variance: item.actual - item.budget,
    utilisation: (item.actual / item.budget) * 100,
  }));

  const distributionData = filteredDepartments.map(
    (item, index) => ({
      name: item.name,
      value: item.actual,
      fill: chartColours[index % chartColours.length],
    }),
  );

  return (
    <div className="finance-overview cost-centre">
      

      

      
<section
  className="finance-overview__scope cost-centre__filters"
  aria-label="Cost centre filters"
>
  {/* Campus and Section */}
  <div className="cost-centre__location-filters">
    <label>
      <select
        value={campus}
        onChange={(event) => {
          setCampus(event.target.value);
          setSection("All Sections");
        }}
        aria-label="Campus"
      >
        {campuses.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </label>

    <label>
      <select
        value={section}
        onChange={(event) => setSection(event.target.value)}
        aria-label="Section"
      >
        {availableSections.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </label>
  </div>

 
</section>


      <section
        className="finance-overview__metrics"
        aria-label="Cost centre summary"
      >
        <article className="finance-overview__metric">
          <span className="finance-overview__icon">
            <CircleDollarSign size={21} aria-hidden="true" />
          </span>
          <div className="finance-overview__metric-content">
            <span className="finance-overview__metric-label">
              Actual Expenditure
            </span>
            <strong className="finance-overview__metric-value">
              {formatAmount(totals.actual)}
            </strong>
            <span className="finance-overview__metric-note">
              Across selected cost centres
            </span>
          </div>
        </article>

        <article className="finance-overview__metric">
          <span className="finance-overview__icon">
            <Building2 size={21} aria-hidden="true" />
          </span>
          <div className="finance-overview__metric-content">
            <span className="finance-overview__metric-label">
              Cost Centres
            </span>
            <strong className="finance-overview__metric-value">
              {filteredDepartments.length}
            </strong>
            <span className="finance-overview__metric-note">
              In the selected campus scope
            </span>
          </div>
        </article>

        <article className="finance-overview__metric">
          <span className="finance-overview__icon">
            <Percent size={21} aria-hidden="true" />
          </span>
          <div className="finance-overview__metric-content">
            <span className="finance-overview__metric-label">
              Budget Utilisation
            </span>
            <strong className="finance-overview__metric-value">
              {formatPercent(totals.utilisation)}
            </strong>
            <span className="finance-overview__metric-note">
              Actual expenditure ÷ allocated budget
            </span>
          </div>
        </article>


      </section>

      <section className="finance-overview__grid cost-centre__chart-grid">
        <article className="finance-overview__panel">
          <div className="finance-overview__panel-heading">
            <div>
              <h2>Departmental Expenditure</h2>
              <p>Actual expenditure · UGX millions</p>
            </div>
             <ReportingFilters
    year={year}
    term={term}
    onYearChange={setYear}
    onTermChange={setTerm}
  />
          </div>

          <div className="cost-centre__chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -14, bottom: 8 }}
              >
                <CartesianGrid
                  stroke="var(--fo-border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 10, fill: "var(--fo-muted)" }}
                  angle={-22}
                  textAnchor="end"
                  interval={0}
                  height={55}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--fo-muted)" }}
                  tickFormatter={formatCompact}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [
                    formatAmount(Number(value)),
                    "Actual expenditure",
                  ]}
                  contentStyle={{
                    borderRadius: 9,
                    border: "1px solid var(--fo-border)",
                    fontSize: 11,
                  }}
                />
                <Bar
                  dataKey="Actual"
                  fill="var(--pal-steel)"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={42}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="finance-overview__panel">
          <div className="finance-overview__panel-heading">
            <div>
              <h2>Spending Distribution</h2>
              <p>Share of total actual expenditure</p>
            </div>
             <ReportingFilters
    year={year}
    term={term}
    onYearChange={setYear}
    onTermChange={setTerm}
  />
          </div>

          <div className="cost-centre__donut-layout">
            <div className="cost-centre__donut">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="58%"
                    outerRadius="82%"
                    paddingAngle={2}
                    stroke="var(--color-surface)"
                    strokeWidth={2}
                  >
                    {distributionData.map((item) => (
                      <Cell
                        key={item.name}
                        fill={item.fill}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      formatAmount(Number(value)),
                      "Expenditure",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="cost-centre__legend">
              {distributionData.map((item) => (
                <div
                  className="cost-centre__legend-item"
                  key={item.name}
                >
                  <span
                    className="cost-centre__legend-swatch"
                    style={{ background: item.fill }}
                  />
                  <span>{item.name}</span>
                  <strong>{formatAmount(item.value)}</strong>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="finance-overview__panel">
        <div className="finance-overview__panel-heading">
          <div>
            <h2>Budget vs Actual by Cost Centre</h2>
            <p>
              Compare allocated budgets with actual expenditure ·
              UGX millions
            </p>
          </div>
           <ReportingFilters
    year={year}
    term={term}
    onYearChange={setYear}
    onTermChange={setTerm}
  />
        </div>

        <div className="cost-centre__chart cost-centre__chart--comparison">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 10, left: -12, bottom: 8 }}
            >
              <CartesianGrid
                stroke="var(--fo-border)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="department"
                tick={{ fontSize: 10, fill: "var(--fo-muted)" }}
                interval={0}
                angle={-18}
                textAnchor="end"
                height={48}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--fo-muted)" }}
                tickFormatter={formatCompact}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatAmount(Number(value)),
                  String(name),
                ]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
        dataKey="Budget"
        fill="#203468"
        radius={[4, 4, 0, 0]}
        maxBarSize={30}
              />
              <Bar
        dataKey="Actual"
        fill="#2AA4DD"
        radius={[4, 4, 0, 0]}
        maxBarSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="finance-overview__panel">
        <div className="finance-overview__panel-heading">
          <div>
            <h2>Cost Centre Details</h2>
            <p>
              Allocation, expenditure, variance and utilisation
            </p>
          </div>
           <ReportingFilters
    year={year}
    term={term}
    onYearChange={setYear}
    onTermChange={setTerm}
  />
        </div>

        <div className="cost-centre__table-wrap">
          <table className="cost-centre__table">
            <thead>
              <tr>
                <th>Cost Centre</th>
                <th>Campus</th>
                <th>Budget</th>
                <th>Actual</th>
                <th>Variance</th>
                <th>Utilisation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.map((item) => {
                const variance = item.budget - item.actual;
                const utilisation =
                  (item.actual / item.budget) * 100;
                const overBudget = variance < 0;

                return (
                  <tr key={item.name}>
                    <td className="cost-centre__department">
                      {item.name}
                    </td>
                    <td>{item.campus}</td>
                    <td>{formatAmount(item.budget)}</td>
                    <td>{formatAmount(item.actual)}</td>
                    <td
                      className={
                        overBudget
                          ? "cost-centre__negative"
                          : "cost-centre__positive"
                      }
                    >
                      {overBudget ? "−" : "+"}
                      {formatAmount(variance)}
                    </td>
                    <td>
                      <div className="cost-centre__utilisation">
                        <span>{formatPercent(utilisation)}</span>
                        <span className="cost-centre__progress">
                          <span
                            style={{
                              width: `${Math.min(utilisation, 100)}%`,
                            }}
                          />
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`cost-centre__status ${
                          overBudget
                            ? "cost-centre__status--over"
                            : utilisation >= 90
                              ? "cost-centre__status--watch"
                              : "cost-centre__status--within"
                        }`}
                      >
                        {overBudget
                          ? "Over budget"
                          : utilisation >= 90
                            ? "Monitor"
                            : "Within budget"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={2}>Total</th>
                <th>{formatAmount(totals.budget)}</th>
                <th>{formatAmount(totals.actual)}</th>
                <th
                  className={
                    totals.variance < 0
                      ? "cost-centre__negative"
                      : "cost-centre__positive"
                  }
                >
                  {totals.variance < 0 ? "−" : "+"}
                  {formatAmount(totals.variance)}
                </th>
                <th>{formatPercent(totals.utilisation)}</th>
                <th>—</th>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="finance-overview__footnote">
          A positive variance means expenditure is below budget;
          a negative variance means the allocation has been exceeded.
          Underspend should be assessed alongside commitments,
          invoices and delivery progress.
        </p>
      </section>
    </div>
  );
}
