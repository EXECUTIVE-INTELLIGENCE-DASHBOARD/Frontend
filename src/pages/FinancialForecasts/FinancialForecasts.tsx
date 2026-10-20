
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarRange,
  ChartNoAxesCombined,
  CircleDollarSign,
  ShieldCheck,
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

type Campus = "All Campuses" | "Kibuli" | "Buwaate" | "Kansanga";

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
    description: "Allows for expected changes in utilities, supplies and staffing costs.",
  },
  {
    title: "Fee collection",
    value: "92% target",
    description: "Assumes most billed school fees are collected within the period.",
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
    description: "Unplanned repairs or price increases could affect margins.",
    level: "Monitor",
    tone: "neutral",
  },
  {
    title: "Revenue below forecast",
    description: "Lower enrolment or collection rates may reduce income.",
    level: "Watch",
    tone: "warning",
  },
];

const formatMoney = (value: number) =>
  `UGX ${value.toLocaleString("en-UG", { maximumFractionDigits: 0 })}M`;

export function FinancialForecasts() {
  const [campus, setCampus] = useState<Campus>("All Campuses");
  const [period, setPeriod] = useState("2026");
  const [scenario, setScenario] = useState("Expected");

  const multiplier = useMemo(() => {
    const campusFactor: Record<Campus, number> = {
      "All Campuses": 1,
      Kibuli: 0.46,
      Buwaate: 0.29,
      Kansanga: 0.25,
    };
    const scenarioFactor: Record<string, number> = {
      Conservative: 0.9,
      Expected: 1,
      Optimistic: 1.1,
    };
    return campusFactor[campus] * scenarioFactor[scenario];
  }, [campus, scenario]);

  const metrics = [
    {
      label: "Projected Revenue",
      value: formatMoney(Math.round(620 * multiplier)),
      note: "Full-year estimate",
      icon: TrendingUp,
      tone: "green",
    },
    {
      label: "Projected Expenditure",
      value: formatMoney(Math.round(408 * multiplier)),
      note: "Operating and planned costs",
      icon: CircleDollarSign,
      tone: "blue",
    },
    {
      label: "Forecast Surplus",
      value: formatMoney(Math.round(212 * multiplier)),
      note: "Revenue less expenditure",
      icon: Banknote,
      tone: "purple",
    },
    {
      label: "Expected Closing Cash",
      value: formatMoney(Math.round(387 * multiplier)),
      note: "Illustrative year-end position",
      icon: Activity,
      tone: "amber",
    },
  ];

  const scaledForecast = forecastData.map((item) => ({
    ...item,
    revenue: item.revenue === null ? null : Math.round(item.revenue * multiplier),
    expenditure: item.expenditure === null ? null : Math.round(item.expenditure * multiplier),
    projectedRevenue: item.projectedRevenue === null ? null : Math.round(item.projectedRevenue * multiplier),
    projectedExpenditure: item.projectedExpenditure === null ? null : Math.round(item.projectedExpenditure * multiplier),
  }));

  const scaledCashFlow = cashFlowData.map((item) => ({
    ...item,
    closing: Math.round(item.closing * multiplier),
  }));

  return (
    <section className="finance-overview financial-forecast">
      

      

      <div className="financial-forecast__filters">
        <label>
          <span>Campus</span>
          <select value={campus} onChange={(event) => setCampus(event.target.value as Campus)}>
            <option>All Campuses</option>
            <option>Kibuli</option>
            <option>Buwaate</option>
            <option>Kansanga</option>
          </select>
        </label>
        <label>
          <span>Forecast year</span>
          <select value={period} onChange={(event) => setPeriod(event.target.value)}>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </label>
        <label>
          <span>Scenario</span>
          <select value={scenario} onChange={(event) => setScenario(event.target.value)}>
            <option>Conservative</option>
            <option>Expected</option>
            <option>Optimistic</option>
          </select>
        </label>
      </div>

      <div className="financial-forecast__metrics">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article className="finance-overview__metric" key={metric.label}>
              <span className={`finance-overview__icon financial-forecast__icon--${metric.tone}`}>
                <Icon size={19} />
              </span>
              <div className="finance-overview__metric-content">
                <span className="finance-overview__metric-label">{metric.label}</span>
                <strong className="finance-overview__metric-value">{metric.value}</strong>
                <span className="financial-forecast__metric-note">{metric.note}</span>
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
              <p>Historical results and projected monthly trends · UGX millions</p>
            </div>
            <span className="financial-forecast__panel-icon"><TrendingUp size={18} /></span>
          </div>
          <div className="financial-forecast__chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scaledForecast} margin={{ top: 12, right: 12, left: 2, bottom: 2 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9edf3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#7c8798", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#7c8798", fontSize: 11 }} width={38} />
                <Tooltip formatter={(value) => value == null ? "—" : `${value}M UGX`} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                <Line type="monotone" dataKey="revenue" name="Historical revenue" stroke="#258568" strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
                <Line type="monotone" dataKey="expenditure" name="Historical expenditure" stroke="#4676c8" strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
                <Line type="monotone" dataKey="projectedRevenue" name="Projected revenue" stroke="#258568" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 3 }} connectNulls={false} />
                <Line type="monotone" dataKey="projectedExpenditure" name="Projected expenditure" stroke="#4676c8" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 3 }} connectNulls={false} />
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
            <span className="financial-forecast__panel-icon"><Activity size={18} /></span>
          </div>
          <div className="financial-forecast__chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scaledCashFlow} margin={{ top: 12, right: 12, left: 2, bottom: 2 }}>
                <defs>
                  <linearGradient id="forecastCashFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#258568" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#258568" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9edf3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#7c8798", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#7c8798", fontSize: 11 }} width={38} />
                <Tooltip formatter={(value) => value == null ? "—" : `${value}M UGX`} />
                <Area type="monotone" dataKey="closing" name="Closing cash" stroke="#258568" strokeWidth={2.5} fill="url(#forecastCashFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="financial-forecast__cash-note">
            <ArrowUpRight size={16} />
            <span>Illustrative cash balance trends upward in this scenario.</span>
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
            <CalendarRange size={19} />
          </div>
          <div className="financial-forecast__assumptions">
            {assumptions.map((item) => (
              <div className="financial-forecast__assumption" key={item.title}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
          <p className="financial-forecast__footnote">
            These assumptions are demonstration values and should be replaced with
            approved budgets, enrolment projections and collection history.
          </p>
        </article>

        <article className="finance-overview__panel">
          <div className="finance-overview__panel-heading">
            <div>
              <h2>Forecast Risk Indicators</h2>
              <p>Areas to review before committing funds</p>
            </div>
            <ShieldCheck size={19} />
          </div>
          <div className="financial-forecast__risks">
            {risks.map((risk) => (
              <div className="financial-forecast__risk" key={risk.title}>
                <span className={`financial-forecast__risk-icon financial-forecast__risk-icon--${risk.tone}`}>
                  {risk.tone === "warning" ? <AlertTriangle size={17} /> : <ArrowDownRight size={17} />}
                </span>
                <div className="financial-forecast__risk-copy">
                  <strong>{risk.title}</strong>
                  <p>{risk.description}</p>
                </div>
                <span className={`financial-forecast__risk-status financial-forecast__risk-status--${risk.tone}`}>
                  {risk.level}
                </span>
              </div>
            ))}
          </div>
          <div className="financial-forecast__review-note">
            <ShieldCheck size={17} />
            <p>Review forecasts against actual collections and approved expenditure each month.</p>
          </div>
        </article>
      </div>

      <p className="financial-forecast__footer">
        {period} forecast · {campus} · {scenario} scenario · Figures are illustrative and not connected to live financial data.
      </p>
    </section>
  );
}
