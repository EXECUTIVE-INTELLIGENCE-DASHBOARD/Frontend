
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  Banknote,
  CircleDollarSign,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./FinancialForecasts.css";

type Campus =
  | "All Campuses"
  | "Kibuli"
  | "Buwaate"
  | "Annex/Preschool Branch";

type Section =
  | "All Sections"
  | "Nursery"
  | "Primary"
  | "Secondary"
  | "Preschool";

const sectionsByCampus: Record<Campus, Section[]> = {
  "All Campuses": [
    "All Sections",
    "Nursery",
    "Primary",
    "Secondary",
    "Preschool",
  ],
  Kibuli: ["All Sections", "Nursery", "Primary", "Secondary"],
  Buwaate: ["All Sections", "Nursery", "Primary"],
  "Annex/Preschool Branch": [
    "All Sections",
    "Nursery",
    "Primary",
    "Secondary",
    "Preschool",
  ],
};

const forecastData = [
  { month: "Jan", revenue: 72, expenditure: 48, projectedRevenue: null, projectedExpenditure: null, cashFlow: 24 },
  { month: "Feb", revenue: 76, expenditure: 51, projectedRevenue: null, projectedExpenditure: null, cashFlow: 25 },
  { month: "Mar", revenue: 80, expenditure: 54, projectedRevenue: null, projectedExpenditure: null, cashFlow: 26 },
  { month: "Apr", revenue: 74, expenditure: 52, projectedRevenue: null, projectedExpenditure: null, cashFlow: 22 },
  { month: "May", revenue: 85, expenditure: 56, projectedRevenue: null, projectedExpenditure: null, cashFlow: 29 },
  { month: "Jun", revenue: 88, expenditure: 59, projectedRevenue: null, projectedExpenditure: null, cashFlow: 29 },
  { month: "Jul", revenue: null, expenditure: null, projectedRevenue: 91, projectedExpenditure: 61, cashFlow: 30 },
  { month: "Aug", revenue: null, expenditure: null, projectedRevenue: 94, projectedExpenditure: 64, cashFlow: 30 },
  { month: "Sep", revenue: null, expenditure: null, projectedRevenue: 98, projectedExpenditure: 66, cashFlow: 32 },
  { month: "Oct", revenue: null, expenditure: null, projectedRevenue: 102, projectedExpenditure: 68, cashFlow: 34 },
  { month: "Nov", revenue: null, expenditure: null, projectedRevenue: 108, projectedExpenditure: 72, cashFlow: 36 },
  { month: "Dec", revenue: null, expenditure: null, projectedRevenue: 116, projectedExpenditure: 76, cashFlow: 40 },
];

const cashFlowData = [
  { month: "Jul", opening: 185, inflow: 91, outflow: 61, closing: 215 },
  { month: "Aug", opening: 215, inflow: 94, outflow: 64, closing: 245 },
  { month: "Sep", opening: 245, inflow: 98, outflow: 66, closing: 277 },
  { month: "Oct", opening: 277, inflow: 102, outflow: 68, closing: 311 },
  { month: "Nov", opening: 311, inflow: 108, outflow: 72, closing: 347 },
  { month: "Dec", opening: 347, inflow: 116, outflow: 76, closing: 387 },
];

const assumptions = [
  {
    title: "Revenue growth",
    value: "8% per term",
    description: "Assumes improved fee collection and stable enrolment.",
  },
  {
    title: "Operating costs",
    value: "5% increase",
    description:
      "Allows for expected changes in utilities, supplies and staffing costs.",
  },
  {
    title: "Fee collection",
    value: "92% target",
    description:
      "Assumes most billed school fees are collected within the period.",
  },
  {
    title: "Capital spending",
    value: "Controlled",
    description: "Major purchases remain subject to budget and approval.",
  },
];

const risks = [
  {
    title: "Delayed fee payments",
    description: "Late collections could reduce available cash.",
    level: "Watch",
    tone: "warning",
  },
  {
    title: "Unexpected operating costs",
    description:
      "Unplanned repairs or price increases could affect margins.",
    level: "Monitor",
    tone: "neutral",
  },
  {
    title: "Revenue below forecast",
    description:
      "Lower enrolment or collection rates may reduce income.",
    level: "Watch",
    tone: "warning",
  },
];

const formatMoney = (value: number) =>
  `UGX ${value.toLocaleString("en-UG", {
    maximumFractionDigits: 0,
  })}M`;

type ReportingFiltersProps = {
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
}: ReportingFiltersProps) {
  return (
    <div className="financial-forecast__filters">
      <label>
        <select
          value={year}
          onChange={(event) =>
            onYearChange(Number(event.target.value))
          }
        >
          <option value={2026}>2026</option>
          <option value={2027}>2027</option>
        </select>
      </label>

      <label>
        <select
          value={term}
          onChange={(event) => onTermChange(event.target.value)}
        >
          <option value="Term 1">Term 1</option>
          <option value="Term 2">Term 2</option>
          <option value="Term 3">Term 3</option>
        </select>
      </label>
    </div>
  );
}

export function FinancialForecasts() {
  const [campus, setCampus] = useState<Campus>("All Campuses");
  const [section, setSection] = useState<Section>("All Sections");

  const availableSections = sectionsByCampus[campus];

  const [revenueYear, setRevenueYear] = useState(2026);
  const [revenueTerm, setRevenueTerm] = useState("Term 1");

  const [cashYear, setCashYear] = useState(2026);
  const [cashTerm, setCashTerm] = useState("Term 1");

  const [assumptionsYear, setAssumptionsYear] = useState(2026);
  const [assumptionsTerm, setAssumptionsTerm] = useState("Term 1");

  const [risksYear, setRisksYear] = useState(2026);
  const [risksTerm, setRisksTerm] = useState("Term 1");

  const multiplier = useMemo(() => {
    const campusFactor: Record<Campus, number> = {
      "All Campuses": 1,
      Kibuli: 0.46,
      Buwaate: 0.29,
      "Annex/Preschool Branch": 0.25,
    };

    return campusFactor[campus];
  }, [campus]);

  const metrics = [
    {
      label: "Projected Revenue",
      value: formatMoney(Math.round(620 * multiplier)),
      icon: TrendingUp,
      tone: "green",
    },
    {
      label: "Projected Expenditure",
      value: formatMoney(Math.round(408 * multiplier)),
      icon: CircleDollarSign,
      tone: "blue",
    },
    {
      label: "Forecast Surplus",
      value: formatMoney(Math.round(212 * multiplier)),
      icon: Banknote,
      tone: "purple",
    },
    {
      label: "Expected Closing Cash",
      value: formatMoney(Math.round(387 * multiplier)),
      icon: Activity,
      tone: "amber",
    },
  ];

  const scaledForecast = forecastData.map((item) => ({
    ...item,
    revenue:
      item.revenue === null
        ? null
        : Math.round(item.revenue * multiplier),
    expenditure:
      item.expenditure === null
        ? null
        : Math.round(item.expenditure * multiplier),
    projectedRevenue:
      item.projectedRevenue === null
        ? null
        : Math.round(item.projectedRevenue * multiplier),
    projectedExpenditure:
      item.projectedExpenditure === null
        ? null
        : Math.round(item.projectedExpenditure * multiplier),
  }));

  const scaledCashFlow = cashFlowData.map((item) => ({
    ...item,
    closing: Math.round(item.closing * multiplier),
  }));

  return (
    <section className="finance-overview financial-forecast">
      <div className="financial-forecast__filters">
        <label>
          <select
            value={campus}
            onChange={(event) => {
              const nextCampus = event.target.value as Campus;
              setCampus(nextCampus);
              setSection("All Sections");
            }}
          >
            <option value="All Campuses">All Campuses</option>
            <option value="Kibuli">Kibuli</option>
            <option value="Buwaate">Buwaate</option>
            <option value="Annex/Preschool Branch">
              Annex/Preschool Branch
            </option>
          </select>
        </label>

        <label>
          <select
            value={section}
            onChange={(event) =>
              setSection(event.target.value as Section)
            }
          >
            {availableSections.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="financial-forecast__metrics">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              className="finance-overview__metric"
              key={metric.label}
            >
              <span
                className={`finance-overview__icon financial-forecast__icon--${metric.tone}`}
              >
                <Icon size={19} />
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
      </div>

      <div className="financial-forecast__chart-grid">
        <article className="finance-overview__panel financial-forecast__chart-panel">
          <div className="finance-overview__panel-heading">
            <div>
              <h2>Revenue vs Expenditure</h2>
              <p>
                Historical results and projected monthly trends · UGX
                millions
              </p>
            </div>

            <ReportingFilters
              year={revenueYear}
              term={revenueTerm}
              onYearChange={setRevenueYear}
              onTermChange={setRevenueTerm}
            />
          </div>

          <div className="financial-forecast__chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={scaledForecast}
                margin={{ top: 12, right: 12, left: 2, bottom: 2 }}
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
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#7c8798", fontSize: 11 }}
                  width={38}
                />
                <Tooltip
                  formatter={(value) =>
                    value == null ? "—" : `${value}M UGX`
                  }
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Actual Revenue"
                  stroke="#2AA4DD"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="expenditure"
                  name="Actual Expenditure"
                  stroke="#203468"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="projectedRevenue"
                  name="Projected Revenue"
                  stroke="#2AA4DD"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={false}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="projectedExpenditure"
                  name="Projected Expenditure"
                  stroke="#203468"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={false}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="finance-overview__panel financial-forecast__chart-panel">
          <div className="finance-overview__panel-heading">
            <div>
              <h2>Projected Cash Position</h2>
              <p>Expected closing cash balance · UGX millions</p>
            </div>

            <ReportingFilters
              year={cashYear}
              term={cashTerm}
              onYearChange={setCashYear}
              onTermChange={setCashTerm}
            />
          </div>

          <div className="financial-forecast__chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={scaledCashFlow}
                margin={{ top: 12, right: 12, left: 2, bottom: 2 }}
              >
                <defs>
                  <linearGradient
                    id="forecastCashFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#c5a334"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="#c5a334"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>

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
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#7c8798", fontSize: 11 }}
                  width={38}
                />
                <Tooltip
                  formatter={(value) =>
                    value == null ? "—" : `${value}M UGX`
                  }
                />

                <Area
                  type="monotone"
                  dataKey="closing"
                  name="Closing Cash"
                  stroke="#F1BA1B"
                  strokeWidth={3}
                  fill="#F1BA1B"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          
        </article>
      </div>

      <div className="financial-forecast__lower-grid">
        <article className="finance-overview__panel">
          <div className="finance-overview__panel-heading">
            <div>
              <h2>Forecast Assumptions</h2>
              <p>Inputs that influence the expected scenario</p>
            </div>

            <ReportingFilters
              year={assumptionsYear}
              term={assumptionsTerm}
              onYearChange={setAssumptionsYear}
              onTermChange={setAssumptionsTerm}
            />
          </div>

          <div className="financial-forecast__assumptions">
            {assumptions.map((item) => (
              <div
                className="financial-forecast__assumption"
                key={item.title}
              >
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="finance-overview__panel">
          <div className="finance-overview__panel-heading">
            <div>
              <h2>Forecast Risk Indicators</h2>
              <p>Areas to review before committing funds</p>
            </div>

            <ReportingFilters
              year={risksYear}
              term={risksTerm}
              onYearChange={setRisksYear}
              onTermChange={setRisksTerm}
            />
          </div>

          <div className="financial-forecast__risks">
            {risks.map((risk) => (
              <div
                className="financial-forecast__risk"
                key={risk.title}
              >
                <span
                  className={`financial-forecast__risk-icon financial-forecast__risk-icon--${risk.tone}`}
                >
                  {risk.tone === "warning" ? (
                    <AlertTriangle size={17} />
                  ) : (
                    <ArrowDownRight size={17} />
                  )}
                </span>

                <div className="financial-forecast__risk-copy">
                  <strong>{risk.title}</strong>
                  <p>{risk.description}</p>
                </div>

                <span
                  className={`financial-forecast__risk-status financial-forecast__risk-status--${risk.tone}`}
                >
                  {risk.level}
                </span>
              </div>
            ))}
          </div>

          
        </article>
      </div>
    </section>
  );
}
