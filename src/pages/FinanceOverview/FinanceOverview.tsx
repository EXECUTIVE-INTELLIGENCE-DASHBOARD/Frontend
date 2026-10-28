import { useEffect, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { chartColour, formatUgx, shortSchoolName } from "../../lib/finance.format";
import {
  getFinanceDashboard,
  type DashboardSchool,
  type DashboardSource,
  type FinanceDashboard,
} from "./financeDashboard.api";

import "./FinanceOverview.css";

const notes: Record<DashboardSource, string | null> = {
  api: null,
  empty: "There are no finance records on the server yet.",
  offline: "The finance server could not be reached.",
};

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/** Budget used: red over 100%, amber from 85%, green below. */
const usedTone = (percent: number | null) =>
  percent === null ? "" : percent > 100 ? "is-red" : percent >= 85 ? "is-amber" : "is-green";

type PanelProps = {
  title: string;
  total: string;
  note: string;
  wide?: boolean;
  children: ReactNode;
};

function Panel({ title, total, note, wide, children }: PanelProps) {
  return (
    <article
      className={`finance-overview__panel${wide ? " finance-overview__panel--wide" : ""}`}
      aria-label={title}
    >
      <div className="finance-overview__panel-heading">
        <h2>{title}</h2>
        <div className="finance-overview__total">
          <strong>{total}</strong>
          <span>{note}</span>
        </div>
      </div>
      {children}
    </article>
  );
}

function SchoolBars({
  schools,
  value,
}: {
  schools: DashboardSchool[];
  value: (school: DashboardSchool) => number;
}) {
  const max = Math.max(...schools.map(value), 1);

  return (
    <div className="finance-overview__bars">
      {schools.map((school) => (
        <div className="finance-overview__bar-row" key={school.id}>
          <span>{shortSchoolName(school.name, school.campus)}</span>
          <div className="finance-overview__bar-track">
            <div
              className="finance-overview__bar-fill"
              style={{ width: `${(value(school) / max) * 100}%`, background: chartColour }}
            />
          </div>
          <strong>{formatUgx(value(school))}</strong>
        </div>
      ))}
    </div>
  );
}

function RevenueCard({ data }: { data: FinanceDashboard }) {
  const rows = data.schools.map((school) => ({
    label: shortSchoolName(school.name, school.campus),
    revenue: school.revenue,
  }));

  return (
    <Panel title="Revenue" total={formatUgx(data.totals.revenue)} note="school fees, all schools" wide>
      <div className="finance-overview__revenue-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 22, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={52}
              tickFormatter={formatUgx}
              tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            />
            <Bar dataKey="revenue" fill={chartColour} radius={[5, 5, 0, 0]} maxBarSize={64}
              isAnimationActive={false}>
              <LabelList
                dataKey="revenue"
                position="top"
                formatter={(value) => formatUgx(Number(value))}
                className="finance-overview__bar-label"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function LiabilitiesCard({ data }: { data: FinanceDashboard }) {
  const rows = [
    ...data.schools.map((school) => ({
      key: String(school.id),
      label: shortSchoolName(school.name, school.campus),
      ...school.liabilities,
    })),
    { key: "group", label: "Group (GHL)", ...data.group.liabilities },
  ];

  return (
    <Panel
      title="Liabilities Management"
      total={formatUgx(data.totals.liabilities.owed)}
      note="total owed, incl. group"
    >
      <div className="finance-overview__table-wrap">
        <table className="finance-overview__table">
          <thead>
            <tr>
              <th>School</th>
              <th>Owed</th>
              <th>Due in 30 days</th>
              <th>Overdue</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td>{row.label}</td>
                <td>{formatUgx(row.owed)}</td>
                <td>{formatUgx(row.due_30_days)}</td>
                <td className={row.overdue > 0 ? "is-red" : "is-green"}>
                  {formatUgx(row.overdue)}
                </td>
              </tr>
            ))}
            <tr className="finance-overview__total-row">
              <td>Total</td>
              <td>{formatUgx(data.totals.liabilities.owed)}</td>
              <td>{formatUgx(data.totals.liabilities.due_30_days)}</td>
              <td>{formatUgx(data.totals.liabilities.overdue)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function BudgetCard({ data }: { data: FinanceDashboard }) {
  const { budget } = data.totals;
  // group-wide budgets show as their own row so the rows add up to the total
  const rows = [
    ...data.schools.map((school) => ({
      key: String(school.id),
      label: shortSchoolName(school.name, school.campus),
      ...school.budget,
    })),
    ...(data.group.budget.budget || data.group.budget.spent
      ? [{ key: "group", label: "Group (GHL)", ...data.group.budget }]
      : []),
  ];

  return (
    <Panel
      title="Budget Management"
      total={budget.used_percent === null ? "–" : `${budget.used_percent}%`}
      note="of this year's budget used"
    >
      <div className="finance-overview__table-wrap">
        <table className="finance-overview__table">
          <thead>
            <tr>
              <th>School</th>
              <th>Budget</th>
              <th>Spent</th>
              <th>Used</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td>{row.label}</td>
                <td>{formatUgx(row.budget)}</td>
                <td>{formatUgx(row.spent)}</td>
                <td className={usedTone(row.used_percent)}>
                  {row.used_percent === null ? "–" : `${row.used_percent}%`}
                  <span className="finance-overview__minibar">
                    <i style={{ width: `${Math.min(row.used_percent ?? 0, 100)}%` }} />
                  </span>
                </td>
              </tr>
            ))}
            <tr className="finance-overview__total-row">
              <td>Total</td>
              <td>{formatUgx(budget.budget)}</td>
              <td>{formatUgx(budget.spent)}</td>
              <td>{budget.used_percent === null ? "–" : `${budget.used_percent}%`}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function FinanceOverview() {
  const [data, setData] = useState<FinanceDashboard | null>(null);
  const [source, setSource] = useState<DashboardSource>("api");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;

    getFinanceDashboard().then((result) => {
      if (!live) return;
      setData(result.data);
      setSource(result.source);
      setLoading(false);
    });

    return () => {
      live = false;
    };
  }, []);

  const note = notes[source];

  return (
    <div className="finance-overview">
      <div className="finance-overview__scope">
        <span className="finance-overview__period">
          {data
            ? `This financial year · ${formatDate(data.period.start)} – ${formatDate(data.period.end)}`
            : "This financial year"}
        </span>
      </div>

      {loading && <p className="finance-overview__state">Loading finance figures…</p>}
      {!loading && note && <p className="finance-overview__state">{note}</p>}

      {!loading && data && source === "api" && (
        <section className="finance-overview__grid" aria-label="Finance by school">
          <RevenueCard data={data} />
          <LiabilitiesCard data={data} />
          <BudgetCard data={data} />
          <Panel
            title="Expense Management"
            total={formatUgx(data.totals.expenses)}
            note="spent this year, all schools"
          >
            <SchoolBars schools={data.schools} value={(school) => school.expenses} />
          </Panel>
          <Panel
            title="Procurement Financials"
            total={formatUgx(data.totals.procurement.spend)}
            note={`purchases this year · ${formatUgx(data.totals.procurement.not_yet_paid)} not yet paid`}
          >
            <SchoolBars schools={data.schools} value={(school) => school.procurement.spend} />
          </Panel>
        </section>
      )}
    </div>
  );
}
