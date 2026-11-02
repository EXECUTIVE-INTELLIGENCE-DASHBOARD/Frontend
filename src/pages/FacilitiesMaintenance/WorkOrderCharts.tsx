import type { CategoryRow, WorkOrder } from "./facilities.types";

const VB_W = 560;
const VB_H = 238;
const PL = 52;
const PR = 14;
const PT = 16;
const PB = 190;
const PW = VB_W - PL - PR;
const PH = PB - PT;

function scale(max: number) {
  const m = Math.max(max, 1);
  const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 5000];
  const step = steps.find((s) => m / s <= 5) ?? 5000;
  const top = Math.ceil(m / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);
  return { top, ticks };
}

function Frame({
  top,
  ticks,
  xTitle,
  yTitle,
  fmt = (v: number) => String(v),
}: {
  top: number;
  ticks: number[];
  xTitle: string;
  yTitle: string;
  fmt?: (v: number) => string;
}) {
  const y = (v: number) => PB - (v / top) * PH;
  return (
    <g>
      {ticks.map((v) => (
        <g key={v}>
          <line className="wo-grid-line" x1={PL} x2={VB_W - PR} y1={y(v)} y2={y(v)} />
          <text x={PL - 6} y={y(v) + 3.5} textAnchor="end">{fmt(v)}</text>
        </g>
      ))}
      <line className="wo-axis" x1={PL} x2={PL} y1={PT} y2={PB} />
      <line className="wo-axis" x1={PL} x2={VB_W - PR} y1={PB} y2={PB} />
      <text className="wo-title" transform="rotate(-90)" x={-(PT + PH / 2)} y={12} textAnchor="middle">{yTitle}</text>
      <text className="wo-title" x={PL + PW / 2} y={VB_H - 6} textAnchor="middle">{xTitle}</text>
    </g>
  );
}

function XLabel({ x, text }: { x: number; text: string }) {
  const [first, ...rest] = text.split(" ");
  const second = rest.join(" ");
  return (
    <>
      <text x={x} y={PB + 13} textAnchor="middle">{first}</text>
      {second && <text x={x} y={PB + 24} textAnchor="middle">{second}</text>}
    </>
  );
}

export interface LegendItem {
  label: string;
  tone: "done" | "open" | "over";
  line?: "solid" | "dash";
}

export function Legend({ items }: { items: LegendItem[] }) {
  return (
    <div className="wo-legend">
      {items.map((it) => (
        <span key={it.label}>
          {it.line ? (
            <svg width="20" height="10" aria-hidden="true">
              <line
                className={`wo-line wo-line--${it.tone}${it.line === "dash" ? " wo-line--dash" : ""}`}
                x1="0" x2="20" y1="5" y2="5"
              />
            </svg>
          ) : (
            <i className={`wo-sw--${it.tone}`} />
          )}
          {it.label}
        </span>
      ))}
    </div>
  );
}

export function StatusDonut({ done, onTime, overdue }: { done: number; onTime: number; overdue: number }) {
  const total = done + onTime + overdue;
  if (!total) return <p className="fm-empty">No work orders</p>;
  const cx = VB_W / 2;
  const cy = 112;
  const r = 70;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const seg = (n: number, tone: string, label: string) => {
    if (!n) return null;
    const len = (n / total) * c;
    const drawn = Math.max(len - 2, 0);
    const el = (
      <circle
        key={tone}
        className={`wo-ring wo-ring--${tone}`}
        cx={cx}
        cy={cy}
        r={r}
        strokeWidth={26}
        strokeDasharray={`${drawn} ${c - drawn}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${cx} ${cy})`}
      >
        <title>{`${label}: ${n}`}</title>
      </circle>
    );
    offset += len;
    return el;
  };
  return (
    <svg className="wo-svg" viewBox={`0 0 ${VB_W} ${VB_H}`} role="img" aria-label={`Status share of ${total} work orders: ${done} done, ${onTime} open on time, ${overdue} overdue`}>
      {seg(done, "done", "Done")}
      {seg(onTime, "open", "Open, on time")}
      {seg(overdue, "over", "Overdue")}
      <text className="wo-big" x={cx} y={cy + 6} textAnchor="middle">{total}</text>
      <text x={cx} y={cy + 24} textAnchor="middle">work orders</text>
    </svg>
  );
}

export function CategoryChart({ rows }: { rows: CategoryRow[] }) {
  if (!rows.length) return <p className="fm-empty">No work orders</p>;
  const { top, ticks } = scale(Math.max(...rows.map((r) => r.logged)));
  const k = PH / top;
  const bw = Math.min(44, (PW / rows.length) * 0.62);
  return (
    <svg className="wo-svg" viewBox={`0 0 ${VB_W} ${VB_H}`} role="img" aria-label="Work orders by category: done, open on time and overdue">
      <Frame top={top} ticks={ticks} xTitle="Category" yTitle="Work orders" />
      {rows.map((r, i) => {
        const cx = PL + (PW / rows.length) * (i + 0.5);
        const onTime = Math.max(0, r.open - r.overdue);
        let y = PB;
        const seg = (n: number, cls: string) => {
          const h = n * k;
          y -= h;
          return h > 0 ? <rect key={cls} className={cls} x={cx - bw / 2} y={y} width={bw} height={h} /> : null;
        };
        return (
          <g key={r.category}>
            <title>{`${r.category}: ${r.done} done, ${onTime} open on time, ${r.overdue} overdue`}</title>
            {seg(r.done, "wo-done")}
            {seg(onTime, "wo-open")}
            {seg(r.overdue, "wo-over")}
            <text className="wo-val" x={cx} y={y - 5} textAnchor="middle">{r.logged}</text>
            <XLabel x={cx} text={r.category} />
          </g>
        );
      })}
    </svg>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const monthKey = (ts: number) => {
  const d = new Date(ts);
  return d.getFullYear() * 12 + d.getMonth();
};

function monthBuckets(start: number, end: number) {
  const out: { key: number; label: string; year: number }[] = [];
  const s = new Date(start);
  const e = new Date(end);
  let y = s.getFullYear();
  let m = s.getMonth();
  while (y < e.getFullYear() || (y === e.getFullYear() && m <= e.getMonth())) {
    out.push({
      key: y * 12 + m,
      label: MONTHS[m],
      year: y,
    });
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return out.slice(-12);
}

export function MonthlyChart({ orders, start, end }: { orders: WorkOrder[]; start: number; end: number }) {
  const rows = monthBuckets(start, end).map((b) => {
    const inMonth = orders.filter((o) => monthKey(o.logged) === b.key);
    return { ...b, logged: inMonth.length, done: inMonth.filter((o) => o.done).length };
  });
  if (!rows.length || !orders.length) return <p className="fm-empty">No work orders</p>;
  const { top, ticks } = scale(Math.max(...rows.map((r) => r.logged)));
  const x = (i: number) => PL + (PW * (i + 0.5)) / rows.length;
  const y = (v: number) => PB - (v / top) * PH;
  const years = Array.from(new Set(rows.map((r) => r.year)));
  const yearLabel = years.length === 1 ? String(years[0]) : `${years[0]}–${years[years.length - 1]}`;
  const pts = (pick: (r: (typeof rows)[number]) => number) =>
    rows.map((r, i) => `${x(i)},${y(pick(r))}`).join(" ");
  return (
    <svg className="wo-svg" viewBox={`0 0 ${VB_W} ${VB_H}`} role="img" aria-label="Work orders logged and completed each month">
      <Frame top={top} ticks={ticks} xTitle={`Month logged (${yearLabel})`} yTitle="Work orders" />
      <polyline className="wo-line wo-line--over" points={pts((r) => r.logged)} />
      <polyline className="wo-line wo-line--done wo-line--dash" points={pts((r) => r.done)} />
      {rows.map((r, i) => (
        <g key={r.key}>
          <title>{`${r.label} ${r.year}: ${r.logged} logged, ${r.done} completed`}</title>
          <circle className="wo-over wo-mark" cx={x(i)} cy={y(r.logged)} r={3.5} />
          <rect
            className="wo-done wo-mark"
            x={x(i) - 3.5}
            y={y(r.done) - 3.5}
            width={7}
            height={7}
            transform={`rotate(45 ${x(i)} ${y(r.done)})`}
          />
          <text x={x(i)} y={PB + 13} textAnchor="middle">{r.label}</text>
        </g>
      ))}
    </svg>
  );
}

export function CompletionChart({ rows }: { rows: CategoryRow[] }) {
  const data = rows
    .filter((r) => r.logged > 0)
    .map((r) => ({ name: r.category, done: r.done, logged: r.logged, rate: Math.round((r.done / r.logged) * 100) }))
    .sort((a, b) => b.rate - a.rate);
  if (!data.length) return <p className="fm-empty">No work orders</p>;
  const ticks = [0, 25, 50, 75, 100];
  const bw = Math.min(44, (PW / data.length) * 0.62);
  return (
    <svg className="wo-svg" viewBox={`0 0 ${VB_W} ${VB_H}`} role="img" aria-label="Completion rate by category">
      <Frame top={100} ticks={ticks} xTitle="Category" yTitle="Completion rate (%)" fmt={(v) => `${v}%`} />
      {data.map((d, i) => {
        const cx = PL + (PW / data.length) * (i + 0.5);
        const h = (d.rate / 100) * PH;
        return (
          <g key={d.name}>
            <title>{`${d.name}: ${d.done} of ${d.logged} done (${d.rate}%)`}</title>
            <rect className="wo-done" x={cx - bw / 2} y={PB - h} width={bw} height={h} />
            <text className="wo-val" x={cx} y={PB - h - 5} textAnchor="middle">{d.rate}%</text>
            <XLabel x={cx} text={d.name} />
          </g>
        );
      })}
    </svg>
  );
}
