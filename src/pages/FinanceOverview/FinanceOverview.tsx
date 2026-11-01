import { Banknote, ChartPie, Receipt, ShoppingCart, type LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { chartColour, chartGold, formatUgx, shortSchoolName } from "../../lib/finance.format";
import {
  getFinanceDashboard,
  type DashboardPurchaseMonth,
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

const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const sum = <T,>(rows: T[], value: (row: T) => number) => rows.reduce((total, row) => total + value(row), 0);

/* ---------- chart pieces ---------- */

/** An axis label on two lines ("Kibuli" over "Nursery") so school names don't overlap. */
function TwoLineTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const [first, ...rest] = String(payload?.value ?? "").split(" ");
  return (
    <text x={x} y={y} textAnchor="middle" fill="var(--color-text-muted)" fontSize={11}>
      <tspan x={x} dy={12}>{first}</tspan>
      {rest.length > 0 && <tspan x={x} dy={13}>{rest.join(" ")}</tspan>}
    </text>
  );
}

type TipProps<Row> = { active?: boolean; payload?: ReadonlyArray<{ payload?: Row }> };

/** A hover box (Revenue and Liabilities only): a bold title and a few lines. */
function hoverBox<Row>(content: (row: Row) => { title: string; lines: ReactNode[] }) {
  return function HoverBox({ active, payload }: TipProps<Row>) {
    const row = payload?.[0]?.payload;
    if (!active || !row) return null;
    const { title, lines } = content(row);
    return (
      <div className="finance-overview__tip">
        <strong>{title}</strong>
        {lines.map((line, index) => <span key={index}>{line}</span>)}
      </div>
    );
  };
}

const axisTick = { fill: "var(--color-text-muted)", fontSize: 11 };
const grid = <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />;
const valueLabel = (value: unknown) => formatUgx(Number(value));

type PanelProps = { title: string; total: string; note: string; keys?: [string, string]; children: ReactNode };

function Panel({ title, total, note, keys, children }: PanelProps) {
  return (
    <article className="finance-overview__panel" aria-label={title}>
      <div className="finance-overview__panel-heading">
        <h2>{title}</h2>
        <div className="finance-overview__total">
          <strong>{total}</strong>
          <span>{note}</span>
        </div>
      </div>
      {keys && (
        <div className="finance-overview__key">
          <span><i style={{ background: chartColour }} />{keys[0]}</span>
          <span><i style={{ background: chartGold }} />{keys[1]}</span>
        </div>
      )}
      <div className="finance-overview__chart">{children}</div>
    </article>
  );
}

/* ---------- the five cards ---------- */

type Row = DashboardSchool & { label: string };

function RevenueCard({ rows }: { rows: Row[] }) {
  return (
    <Panel title="Revenue" total={formatUgx(sum(rows, (r) => r.revenue))} note="school fees, all schools">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 20, right: 4, left: 0, bottom: 0 }}>
          {grid}
          <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} height={36} tick={<TwoLineTick />} />
          <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={formatUgx} tick={axisTick} />
          <Tooltip cursor={{ fill: "var(--color-surface-hover)" }} content={hoverBox<Row>((r) => ({
            title: r.label,
            lines: [`Revenue ${formatUgx(r.revenue)}`,
              r.collected_percent == null ? "Nothing billed yet" : `${r.collected_percent}% collected so far`],
          }))} />
          <Bar dataKey="revenue" fill={chartColour} radius={[5, 5, 0, 0]} maxBarSize={56} isAnimationActive={false}>
            <LabelList dataKey="revenue" position="top" formatter={valueLabel} className="finance-overview__bar-label" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}

function LiabilitiesCard({ rows }: { rows: Row[] }) {
  const owed = (r: Row) => r.liabilities.owed;
  return (
    <Panel title="Liabilities Management" total={formatUgx(sum(rows, owed))} note="total owed, all schools">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 56, left: 0, bottom: 4 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={118} tick={axisTick} />
          <Tooltip cursor={{ fill: "var(--color-surface-hover)" }} content={hoverBox<Row>((r) => ({
            title: r.label,
            lines: [`Total owed ${formatUgx(r.liabilities.owed)}`, `Overdue ${formatUgx(r.liabilities.overdue)}`,
              `Not yet due ${formatUgx(r.liabilities.owed - r.liabilities.overdue)}`],
          }))} />
          <Bar dataKey={owed} fill={chartColour} radius={[0, 5, 5, 0]} barSize={20} background={{ fill: "var(--color-track)", radius: 5 }}
            isAnimationActive={false}>
            <LabelList dataKey={owed} position="right" formatter={valueLabel} className="finance-overview__bar-label" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}

function BudgetCard({ rows }: { rows: Row[] }) {
  const budget = sum(rows, (r) => r.budget.budget), spent = sum(rows, (r) => r.budget.spent);
  const used = budget ? Math.round((spent / budget) * 1000) / 10 : null;
  return (
    <Panel title="Budget Management" total={used === null ? "–" : `${used}%`} note={`of ${formatUgx(budget)} budget used`}
      keys={["Budget", "Spent"]}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barGap={3}>
          {grid}
          <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} height={36} tick={<TwoLineTick />} />
          <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={formatUgx} tick={axisTick} />
          <Bar dataKey={(r: Row) => r.budget.budget} name="Budget" fill={chartColour} radius={[5, 5, 0, 0]} maxBarSize={26}
            isAnimationActive={false} />
          <Bar dataKey={(r: Row) => r.budget.spent} name="Spent" fill={chartGold} radius={[5, 5, 0, 0]} maxBarSize={26}
            isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}

function ExpenseCard({ data }: { data: FinanceDashboard }) {
  const months = data.expenses_by_month ?? [];
  const total = sum(months, (m) => m.total);
  return (
    <Panel title="Expense Management" total={formatUgx(total)} note="all spending, including shared costs">
      {months.length < 2 ? (
        <p className="finance-overview__chart-note">
          Choose dates that cover two months or more to see the monthly line.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={months} margin={{ top: 24, right: 24, left: 0, bottom: 0 }}>
            {grid}
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick}
              tickFormatter={(label: string) => label.split(" ")[0]} />
            <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={formatUgx} tick={axisTick} />
            <Line type="monotone" dataKey="total" stroke={chartColour} strokeWidth={2.5} isAnimationActive={false}
              dot={{ r: 4, fill: "var(--color-surface)", stroke: chartColour, strokeWidth: 2 }} activeDot={{ r: 6 }}>
              <LabelList dataKey="total" position="top" formatter={valueLabel} className="finance-overview__bar-label" />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      )}
    </Panel>
  );
}

type PurchaseKey = "purchased" | "not_yet_paid";

/** Purchasing is not tied to the terms, so this card runs month by month from January. */
function ProcurementCard({ data, rows }: { data: FinanceDashboard; rows: Row[] }) {
  const months = data.procurement_by_month ?? [];
  const spend = sum(months, (m) => m.purchased), unpaid = sum(months, (m) => m.not_yet_paid);
  const labels = new Map(rows.map((r) => [r.id, r.label]));

  // Hovering one bar lists every school's figure for that bar only.
  function SchoolsHover({ active, payload }: { active?: boolean;
    payload?: ReadonlyArray<{ dataKey?: unknown; payload?: DashboardPurchaseMonth }> }) {
    const bar = payload?.[0], month = bar?.payload;
    if (!active || !month) return null;
    const key: PurchaseKey = bar.dataKey === "not_yet_paid" ? "not_yet_paid" : "purchased";
    return (
      <div className="finance-overview__tip">
        <strong>{month.label} · {key === "purchased" ? "Purchased" : "Not yet paid"} {formatUgx(month[key])}</strong>
        {month.schools.map((s) => (
          <span key={s.id} className="finance-overview__tip-row">
            <span>{labels.get(s.id) ?? s.id}</span>
            <span>{formatUgx(s[key])}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <Panel title="Procurement Financials" total={formatUgx(spend)} note={`purchased · ${formatUgx(unpaid)} not yet paid`}
      keys={["Purchased", "Not yet paid"]}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={months} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barGap={2}>
          {grid}
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick}
            tickFormatter={(label: string) => label.split(" ")[0]} />
          <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={formatUgx} tick={axisTick} />
          <Tooltip shared={false} cursor={{ fill: "var(--color-surface-hover)" }} content={<SchoolsHover />} />
          <Bar dataKey="purchased" name="Purchased" fill={chartColour} radius={[4, 4, 0, 0]} maxBarSize={18}
            isAnimationActive={false} />
          <Bar dataKey="not_yet_paid" name="Not yet paid" fill={chartGold} radius={[4, 4, 0, 0]} maxBarSize={18}
            isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}

/* ---------- the page ---------- */

export function FinanceOverview() {
  const today = iso(new Date());
  const [start, setStart] = useState(`${today.slice(0, 4)}-01-01`);
  const [end, setEnd] = useState(today);
  const [data, setData] = useState<FinanceDashboard | null>(null);
  const [source, setSource] = useState<DashboardSource>("api");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    setLoading(true);

    getFinanceDashboard({ start, end }).then((result) => {
      if (!live) return;
      setData(result.data);
      setSource(result.source);
      setLoading(false);
    });

    return () => {
      live = false;
    };
  }, [start, end]);

  const note = notes[source];
  // The six schools only: GHL is the parent company and has no activity of its own.
  const rows: Row[] = (data?.schools ?? []).map((school) => ({
    ...school,
    label: shortSchoolName(school.name, school.campus),
  }));
  const owed = sum(rows, (r) => r.liabilities.owed);
  const budget = sum(rows, (r) => r.budget.budget), spent = sum(rows, (r) => r.budget.spent);
  const bought = sum(rows, (r) => r.procurement.spend);

  return (
    <div className="finance-overview">
      <div className="finance-overview__scope" aria-label="Date range">
        <label>
          <span>From</span>
          <input type="date" value={start} max={end} onChange={(e) => e.target.value && setStart(e.target.value)} />
        </label>
        <label>
          <span>To</span>
          <input type="date" value={end} min={start} onChange={(e) => e.target.value && setEnd(e.target.value)} />
        </label>
      </div>

      {loading && <p className="finance-overview__state">Loading finance figures…</p>}
      {!loading && note && <p className="finance-overview__state">{note}</p>}

      {!loading && data && source === "api" && (
        <>
          <section className="finance-overview__metrics" aria-label="Headline figures">
            {([
              ["Revenue", formatUgx(sum(rows, (r) => r.revenue)), Banknote],
              ["Total owed", formatUgx(owed), Receipt],
              ["Budget used", budget ? `${Math.round((spent / budget) * 1000) / 10}%` : "–", ChartPie],
              ["Procurement", formatUgx(bought), ShoppingCart],
            ] as [string, string, LucideIcon][]).map(([label, value, Icon]) => (
              <article className="finance-overview__metric" key={label}>
                <span className="finance-overview__metric-icon" aria-hidden="true"><Icon size={17} /></span>
                <div className="finance-overview__metric-body">
                  <span className="finance-overview__metric-label">{label}</span>
                  <strong className="finance-overview__metric-value">{value}</strong>
                </div>
              </article>
            ))}
          </section>

          <section className="finance-overview__grid" aria-label="Finance by school">
            <RevenueCard rows={rows} />
            <LiabilitiesCard rows={rows} />
            <BudgetCard rows={rows} />
            <ExpenseCard data={data} />
            <ProcurementCard data={data} rows={rows} />
          </section>
        </>
      )}
    </div>
  );
}
