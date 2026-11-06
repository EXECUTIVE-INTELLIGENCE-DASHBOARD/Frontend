import {
  ArrowRight,
  Building2,
  Divide,
  Receipt,
  Scale,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatUgx, shortSchoolName } from "../../lib/finance.format";
import {
  getFinancialPosition,
  type FinancialPosition,
  type PositionBreakdown,
  type PositionFigures,
} from "./assetsLiabilities.api";

import "./AssetsLiabilities.css";

/* Logo colours only: navy, sky blue and gold, with lighter and darker shades of them. */
const navy = "var(--brand-navy)";
const sky = "var(--brand-sky)";
const gold = "var(--brand-gold)";
const skyLight = "color-mix(in srgb, var(--brand-sky) 45%, white)";
const goldLight = "color-mix(in srgb, var(--brand-gold) 50%, white)";
const goldDark = "color-mix(in srgb, var(--brand-gold) 70%, black)";

const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const showDate = (value: string, year = true) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(year ? { year: "numeric" } : {}),
  });

const ratio = (value: number | null) =>
  value === null ? "–" : `${value.toFixed(2)}×`;

/** "▲ 849M" or "▼ 316M"; navy when the move is good, dark gold when it is not. */
function Change({
  now,
  before,
  goodWhenUp = true,
}: {
  now: number;
  before: number;
  goodWhenUp?: boolean;
}) {
  const diff = now - before;
  if (Math.abs(diff) < 5_000) return <span className="al-change">—</span>;
  const good = diff > 0 === goodWhenUp;
  return (
    <span className={`al-change ${good ? "is-good" : "is-bad"}`}>
      {diff > 0 ? "▲" : "▼"} {formatUgx(Math.abs(diff))}
    </span>
  );
}

function Card({
  title,
  link,
  children,
  className = "",
}: {
  title: string;
  link?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={`al-card ${className}`} aria-label={title}>
      <div className="al-card__head">
        <h2>{title}</h2>
        {link}
      </div>
      {children}
    </article>
  );
}

/* ---------- headline ---------- */

function Headline({ at }: { at: PositionFigures }) {
  const tiles: [string, string, LucideIcon][] = [
    ["Total assets", formatUgx(at.assets), Building2],
    ["Total liabilities", formatUgx(at.liabilities), Receipt],
    ["Net position", formatUgx(at.net), Scale],
    ["Current ratio", ratio(at.current_ratio), Divide],
  ];
  return (
    <section className="al-metrics" aria-label="Headline figures">
      {tiles.map(([label, value, Icon]) => (
        <article className="al-metric" key={label}>
          <span className="al-metric__icon" aria-hidden="true">
            <Icon size={17} />
          </span>
          <div>
            <span className="al-metric__label">{label}</span>
            <strong className="al-metric__value">{value}</strong>
          </div>
        </article>
      ))}
    </section>
  );
}

/* ---------- owned against owed, and the trend ---------- */

function OwnedAgainstOwed({ at, end }: { at: PositionFigures; end: string }) {
  const own: [string, number, string][] = [
    ["Fixed assets", at.fixed, navy],
    ["Bank", at.cash, sky],
    ["Debtors", at.debtors, skyLight],
  ];
  const owe: [string, number, string][] = [
    ["Creditors", at.creditors, gold],
    ["Tax & statutory", at.tax, goldDark],
    [
      "Loans & long-term",
      at.loan_current + at.loan_long + at.other_long_term,
      goldLight,
    ],
  ];
  const scale = Math.max(at.assets, at.liabilities) || 1;
  const bar = (parts: [string, number, string][]) => (
    <div className="al-stack">
      {parts.map(([name, value, colour]) => (
        <i
          key={name}
          title={`${name}: ${formatUgx(value)}`}
          style={{
            width: `${(Math.max(value, 0) / scale) * 100}%`,
            background: colour,
          }}
        />
      ))}
    </div>
  );
  return (
    <Card
      title="Owned against owed"
      link={<span className="al-sub">As at {showDate(end)}</span>}
    >
      <div className="al-compare">
        <span>Own</span>
        {bar(own)}
        <b>{formatUgx(at.assets)}</b>
        <span>Owe</span>
        {bar(owe)}
        <b>{formatUgx(at.liabilities)}</b>
      </div>
      <div className="al-key">
        {[...own, ...owe].map(([name, , colour]) => (
          <span key={name}>
            <i style={{ background: colour }} />
            {name}
          </span>
        ))}
      </div>
    </Card>
  );
}

type Point = FinancialPosition["trend"][number];

function TrendHover({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: Point }>;
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className="al-tip">
      <strong>{showDate(point.date)}</strong>
      <span>Assets {formatUgx(point.assets)}</span>
      <span>Liabilities {formatUgx(point.liabilities)}</span>
      <span>Net position {formatUgx(point.net)}</span>
    </div>
  );
}

function PositionTrend({ trend }: { trend: Point[] }) {
  const lines: [keyof Point, string, string][] = [
    ["assets", "Assets", navy],
    ["liabilities", "Liabilities", gold],
    ["net", "Net position", sky],
  ];
  return (
    <Card title="How the position moved" className="al-card--wide">
      <div className="al-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trend}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border)"
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
              tickFormatter={(value: string) => showDate(value, false)}
              minTickGap={16}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={52}
              tickFormatter={formatUgx}
              tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            />
            <Tooltip content={<TrendHover />} />
            {lines.map(([key, name, colour]) => (
              <Line
                key={key}
                dataKey={key}
                name={name}
                type="monotone"
                stroke={colour}
                strokeWidth={2.5}
                dot={{ r: 3, fill: colour, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="al-key">
        {lines.map(([key, name, colour]) => (
          <span key={key}>
            <i className="al-key__line" style={{ background: colour }} />
            {name}
          </span>
        ))}
      </div>
    </Card>
  );
}

/* ---------- the two sides of the balance sheet ---------- */

type Row = { name: string; now: number; before: number; sub?: boolean };

function Group({
  title,
  end,
  rows,
  goodWhenUp,
  extra,
}: {
  title: string;
  end: string;
  rows: Row[];
  goodWhenUp: boolean;
  extra?: ReactNode;
}) {
  return (
    <div className="al-group">
      <div className="al-line al-line--head">
        <span>
          {title}
          {extra}
        </span>
        <span>{showDate(end)}</span>
        <span>Change</span>
      </div>
      {rows.map((row) => (
        <div
          className={`al-line${row.sub ? " al-line--sub" : ""}`}
          key={row.name}
        >
          <span>{row.name}</span>
          <b>{formatUgx(row.now)}</b>
          <Change now={row.now} before={row.before} goodWhenUp={goodWhenUp} />
        </div>
      ))}
    </div>
  );
}

function Total({
  label,
  now,
  before,
  goodWhenUp,
}: {
  label: string;
  now: number;
  before: number;
  goodWhenUp: boolean;
}) {
  return (
    <div className="al-line al-line--total">
      <span>{label}</span>
      <b>{formatUgx(now)}</b>
      <Change now={now} before={before} goodWhenUp={goodWhenUp} />
    </div>
  );
}

function AssetsCard({
  at,
  before,
  end,
}: {
  at: PositionFigures;
  before: PositionFigures;
  end: string;
}) {
  const [showCategories, setShowCategories] = useState(true);
  const earlier = new Map(
    before.fixed_by_category.map((part) => [part.key, part.amount]),
  );
  const toggle = (
    <button
      type="button"
      className="al-toggle"
      onClick={() => setShowCategories((shown) => !shown)}
    >
      {showCategories ? "Hide categories" : "Show categories"}
    </button>
  );
  return (
    <Card title="Assets">
      <Group
        title="Current assets"
        end={end}
        goodWhenUp
        rows={[
          { name: "Bank balance", now: at.cash, before: before.cash },
          {
            name: "Debtors (unpaid school fees)",
            now: at.debtors,
            before: before.debtors,
          },
        ]}
      />
      <Group
        title="Fixed assets · "
        extra={toggle}
        end={end}
        goodWhenUp
        rows={[
          { name: "Asset register", now: at.fixed, before: before.fixed },
          ...(showCategories
            ? at.fixed_by_category.map((part) => ({
                name: part.label,
                now: part.amount,
                before: earlier.get(part.key) ?? 0,
                sub: true,
              }))
            : []),
        ]}
      />
      <Total
        label="Total assets"
        now={at.assets}
        before={before.assets}
        goodWhenUp
      />
    </Card>
  );
}

function LiabilitiesCard({
  at,
  before,
  end,
}: {
  at: PositionFigures;
  before: PositionFigures;
  end: string;
}) {
  const longTerm: Row[] = [
    {
      name: "Loans after 12 months",
      now: at.loan_long,
      before: before.loan_long,
    },
  ];
  if (at.other_long_term || before.other_long_term) {
    longTerm.push({
      name: "Other bills due after 12 months",
      now: at.other_long_term,
      before: before.other_long_term,
    });
  }
  return (
    <Card title="Liabilities">
      <Group
        title="Due within 12 months"
        end={end}
        goodWhenUp={false}
        rows={[
          {
            name: "Creditors (suppliers and utilities)",
            now: at.creditors,
            before: before.creditors,
          },
          {
            name: "Tax and statutory (PAYE, NSSF)",
            now: at.tax,
            before: before.tax,
          },
          {
            name: "Loans: next 12 months",
            now: at.loan_current,
            before: before.loan_current,
          },
        ]}
      />
      <Group title="Long-term" end={end} goodWhenUp={false} rows={longTerm} />
      <Total
        label="Total liabilities"
        now={at.liabilities}
        before={before.liabilities}
        goodWhenUp={false}
      />
    </Card>
  );
}

/* ---------- debtors and asset condition ---------- */

function Split({
  breakdown,
  colours,
}: {
  breakdown: PositionBreakdown;
  colours: string[];
}) {
  const total = breakdown.total || 1;
  return (
    <>
      <div className="al-split">
        {breakdown.parts.map((part, index) => (
          <i
            key={part.key}
            style={{
              width: `${(part.amount / total) * 100}%`,
              background: colours[index],
            }}
          />
        ))}
      </div>
      {breakdown.parts.map((part, index) => (
        <div className="al-kv" key={part.key}>
          <i style={{ background: colours[index] }} />
          <span>{part.label}</span>
          <b>{formatUgx(part.amount)}</b>
          <small>{Math.round((part.amount / total) * 100)}%</small>
        </div>
      ))}
    </>
  );
}

function GoTo({ label, page }: { label: string; page: string }) {
  return (
    <Link to={`/${page}`} className="al-link">
      {label} <ArrowRight size={13} aria-hidden="true" />
    </Link>
  );
}
function DebtorsCard({ data }: { data: FinancialPosition }) {
  return (
    <Card
      title="Debtors"
      link={<GoTo label="Revenue" page="revenue-fee-collection" />}
    >
      <div className="al-mini">
        Unpaid fees {formatUgx(data.debtors.total)} · by how long since billed
      </div>
      <Split breakdown={data.debtors} colours={[navy, sky, gold, goldDark]} />
      <div className="al-mini">By section</div>
      <Split
        breakdown={data.debtor_sections}
        colours={[navy, sky, goldLight]}
      />
    </Card>
  );
}

function ConditionCard({ data }: { data: FinancialPosition }) {
  const { total, parts } = data.asset_condition;
  const atRisk = parts
    .filter((part) => part.key !== "operational")
    .reduce((sum, part) => sum + part.amount, 0);
  return (
    <Card
      title="Asset condition"
      link={<GoTo label="Asset Management" page="asset-management" />}
    >
      <div className="al-mini">
        Register value {formatUgx(total)} · by condition
      </div>
      <Split
        breakdown={data.asset_condition}
        colours={[navy, gold, goldDark]}
      />
      <div className="al-risk">
        <span>Value at risk (servicing and critical)</span>
        <b>{formatUgx(atRisk)}</b>
        <small>
          {total ? Math.round((atRisk / total) * 100) : 0}% of the register
        </small>
      </div>
    </Card>
  );
}

/* ---------- by school ---------- */

function BySchool({ data }: { data: FinancialPosition }) {
  const rows = data.by_school;
  const sum = (
    key:
      | "fixed"
      | "cash"
      | "debtors"
      | "assets"
      | "liabilities"
      | "net"
      | "net_change",
  ) => rows.reduce((total, row) => total + row[key], 0);
  return (
    <Card
      title="By school"
      className="al-card--full"
      link={
        <span className="al-sub">
          As at {showDate(data.period.end)} · net change since{" "}
          {showDate(data.period.start)}
        </span>
      }
    >
      <div className="al-table-wrap">
        <table className="al-table">
          <thead>
            <tr>
              <th>School</th>
              <th>Fixed assets</th>
              <th>Bank</th>
              <th>Debtors</th>
              <th>Total assets</th>
              <th>Liabilities</th>
              <th>Net position</th>
              <th>Net change</th>
              <th>Current ratio</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{shortSchoolName(row.name, row.campus)}</td>
                <td>{formatUgx(row.fixed)}</td>
                <td>{formatUgx(row.cash)}</td>
                <td>{formatUgx(row.debtors)}</td>
                <td>{formatUgx(row.assets)}</td>
                <td>{formatUgx(row.liabilities)}</td>
                <td>
                  <b>{formatUgx(row.net)}</b>
                </td>
                <td>
                  <Change now={row.net_change} before={0} />
                </td>
                <td>{ratio(row.current_ratio)}</td>
              </tr>
            ))}
            <tr className="al-table__total">
              <td>All schools</td>
              <td>{formatUgx(sum("fixed"))}</td>
              <td>{formatUgx(sum("cash"))}</td>
              <td>{formatUgx(sum("debtors"))}</td>
              <td>{formatUgx(sum("assets"))}</td>
              <td>{formatUgx(sum("liabilities"))}</td>
              <td>{formatUgx(sum("net"))}</td>
              <td>
                <Change now={sum("net_change")} before={0} />
              </td>
              <td>{ratio(data.at.current_ratio)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function AssetsLiabilities() {
  const today = iso(new Date());
  const [school, setSchool] = useState("");
  const [start, setStart] = useState(`${today.slice(0, 4)}-01-01`);
  const [end, setEnd] = useState(today);
  const [data, setData] = useState<FinancialPosition | null>(null);
  // Kept between loads, so the School list does not empty while new figures arrive.
  const [schools, setSchools] = useState<FinancialPosition["schools"]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    setLoading(true);
    getFinancialPosition({
      school: school ? Number(school) : undefined,
      start,
      end,
    }).then((result) => {
      if (!live) return;
      setData(result);
      if (result) setSchools(result.schools);
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, [school, start, end]);

  return (
    <div className="al">
      <div className="al-filters" aria-label="Filters">
        <label>
          <span>School</span>
          <select value={school} onChange={(e) => setSchool(e.target.value)}>
            <option value="">All schools</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {shortSchoolName(s.name, s.campus)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>From</span>
          <input
            type="date"
            value={start}
            max={end}
            onChange={(e) => e.target.value && setStart(e.target.value)}
          />
        </label>
        <label>
          <span>To</span>
          <input
            type="date"
            value={end}
            min={start}
            max={today}
            onChange={(e) => e.target.value && setEnd(e.target.value)}
          />
        </label>
      </div>

      {loading && <p className="al-state">Loading the financial position…</p>}
      {!loading && !data && (
        <p className="al-state">The finance server could not be reached.</p>
      )}

      {!loading && data && (
        <>
          <Headline at={data.at} />
          <section className="al-grid al-grid--top">
            <OwnedAgainstOwed at={data.at} end={data.period.end} />
            <PositionTrend trend={data.trend} />
          </section>
          <section className="al-grid" aria-label="Balance sheet">
            <AssetsCard
              at={data.at}
              before={data.before}
              end={data.period.end}
            />
            <LiabilitiesCard
              at={data.at}
              before={data.before}
              end={data.period.end}
            />
          </section>
          <section className="al-grid">
            <DebtorsCard data={data} />
            <ConditionCard data={data} />
          </section>
          {!data.school && <BySchool data={data} />}
        </>
      )}
    </div>
  );
}
