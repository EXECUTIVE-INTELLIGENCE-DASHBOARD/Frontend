import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { CategoryRow, WorkOrder } from "./facilities.types";

interface Geo {
  w: number;
  h: number;
  pl: number;
  pr: number;
  pt: number;
  pb: number;
  ph: number;
}

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(360);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const read = () => setW(Math.max(240, Math.round(el.clientWidth)));
    read();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function Box({
  label,
  children,
  overlay,
}: {
  label: string;
  children: (g: Geo) => ReactNode;
  overlay?: (g: Geo) => ReactNode;
}) {
  const [ref, w] = useWidth();
  const h = Math.min(330, Math.max(214, Math.round(w * 0.52)));
  const g: Geo = { w, h, pl: 46, pr: 12, pt: 16, pb: h - 50, ph: h - 66 };
  return (
    <div ref={ref} className="wo-box">
      <svg className="wo-svg" width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
        {children(g)}
      </svg>
      {overlay?.(g)}
    </div>
  );
}

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
  g,
  top,
  ticks,
  xTitle,
  yTitle,
  fmt = (v: number) => String(v),
}: {
  g: Geo;
  top: number;
  ticks: number[];
  xTitle: string;
  yTitle: string;
  fmt?: (v: number) => string;
}) {
  const y = (v: number) => g.pb - (v / top) * g.ph;
  return (
    <g>
      {ticks.map((v) => (
        <g key={v}>
          <line className="wo-grid-line" x1={g.pl} x2={g.w - g.pr} y1={y(v)} y2={y(v)} />
          <text x={g.pl - 6} y={y(v) + 3.5} textAnchor="end">{fmt(v)}</text>
        </g>
      ))}
      <line className="wo-axis" x1={g.pl} x2={g.pl} y1={g.pt} y2={g.pb} />
      <line className="wo-axis" x1={g.pl} x2={g.w - g.pr} y1={g.pb} y2={g.pb} />
      <text className="wo-title" transform="rotate(-90)" x={-(g.pt + g.ph / 2)} y={12} textAnchor="middle">{yTitle}</text>
      <text className="wo-title" x={g.pl + (g.w - g.pl - g.pr) / 2} y={g.h - 6} textAnchor="middle">{xTitle}</text>
    </g>
  );
}

function XLabel({ g, x, text }: { g: Geo; x: number; text: string }) {
  const [first, ...rest] = text.split(" ");
  const second = rest.join(" ");
  return (
    <>
      <text x={x} y={g.pb + 14} textAnchor="middle">{first}</text>
      {second && <text x={x} y={g.pb + 26} textAnchor="middle">{second}</text>}
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
  return (
    <Box label={`Status share of ${total} work orders: ${done} done, ${onTime} open on time, ${overdue} overdue`}>
      {(g) => {
        const cx = g.w / 2;
        const cy = g.h / 2 - 4;
        const r = Math.min(80, (g.h - 70) / 2);
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
          <>
            {seg(done, "done", "Done")}
            {seg(onTime, "open", "Open, on time")}
            {seg(overdue, "over", "Overdue")}
            <text className="wo-big" x={cx} y={cy + 6} textAnchor="middle">{total}</text>
            <text x={cx} y={cy + 24} textAnchor="middle">work orders</text>
          </>
        );
      }}
    </Box>
  );
}

export function CategoryChart({ rows }: { rows: CategoryRow[] }) {
  if (!rows.length) return <p className="fm-empty">No work orders</p>;
  const { top, ticks } = scale(Math.max(...rows.map((r) => r.logged)));
  return (
    <Box label="Work orders by category: done, open on time and overdue">
      {(g) => {
        const pw = g.w - g.pl - g.pr;
        const k = g.ph / top;
        const bw = Math.min(44, (pw / rows.length) * 0.62);
        return (
          <>
            <Frame g={g} top={top} ticks={ticks} xTitle="Category" yTitle="Work orders" />
            {rows.map((r, i) => {
              const cx = g.pl + (pw / rows.length) * (i + 0.5);
              const onTime = Math.max(0, r.open - r.overdue);
              let y = g.pb;
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
                  <XLabel g={g} x={cx} text={r.category} />
                </g>
              );
            })}
          </>
        );
      }}
    </Box>
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
    out.push({ key: y * 12 + m, label: MONTHS[m], year: y });
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return out.slice(-12);
}

interface MonthRow {
  key: number;
  label: string;
  year: number;
  logged: number;
  done: number;
}

function MonthlyPlot({
  g,
  rows,
  top,
  ticks,
  yearLabel,
}: {
  g: Geo;
  rows: MonthRow[];
  top: number;
  ticks: number[];
  yearLabel: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const pw = g.w - g.pl - g.pr;
  const step = pw / rows.length;
  const x = (i: number) => g.pl + step * (i + 0.5);
  const y = (v: number) => g.pb - (v / top) * g.ph;
  const pts = (pick: (r: MonthRow) => number) =>
    rows.map((r, i) => `${x(i)},${y(pick(r))}`).join(" ");

  const TW = 132;
  const TH = 66;
  const active = hover === null ? null : rows[hover];
  let tip = null;
  if (active && hover !== null) {
    const cx = x(hover);
    const flip = cx + TW + 16 > g.w - 4;
    const tx = flip ? cx - TW - 12 : cx + 12;
    const mid = (y(active.logged) + y(active.done)) / 2;
    const ty = Math.min(Math.max(mid - TH / 2, g.pt), g.pb - TH);
    tip = (
      <g className="wo-tip" pointerEvents="none">
        <rect className="wo-tip__box" x={tx} y={ty} width={TW} height={TH} rx={6} />
        <text className="wo-tip__head" x={tx + 12} y={ty + 20}>{active.label}</text>
        <rect className="wo-tip__sw wo-tip__sw--over" x={tx + 12} y={ty + 28} width={10} height={10} />
        <text className="wo-tip__row" x={tx + 28} y={ty + 37}>{`Logged: ${active.logged}`}</text>
        <rect className="wo-tip__sw wo-tip__sw--done" x={tx + 12} y={ty + 44} width={10} height={10} />
        <text className="wo-tip__row" x={tx + 28} y={ty + 53}>{`Completed: ${active.done}`}</text>
      </g>
    );
  }

  return (
    <>
      <Frame g={g} top={top} ticks={ticks} xTitle={`Month logged (${yearLabel})`} yTitle="Work orders" />
      {hover !== null && (
        <rect className="wo-band" x={g.pl + step * hover} y={g.pt} width={step} height={g.ph} />
      )}
      <polyline className="wo-line wo-line--over" points={pts((r) => r.logged)} />
      <polyline className="wo-line wo-line--done wo-line--dash" points={pts((r) => r.done)} />
      {rows.map((r, i) => {
        const on = hover === i;
        const d = on ? 11 : 9;
        return (
          <g key={r.key}>
            <circle className="wo-over wo-mark" cx={x(i)} cy={y(r.logged)} r={on ? 6 : 4.5} />
            <rect
              className="wo-done wo-mark"
              x={x(i) - d / 2}
              y={y(r.done) - d / 2}
              width={d}
              height={d}
              transform={`rotate(45 ${x(i)} ${y(r.done)})`}
            />
            <text x={x(i)} y={g.pb + 14} textAnchor="middle">{r.label}</text>
          </g>
        );
      })}
      {rows.map((r, i) => (
        <rect
          key={`hit-${r.key}`}
          className="wo-hit"
          x={g.pl + step * i}
          y={g.pt}
          width={step}
          height={g.ph}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
        />
      ))}
      {tip}
    </>
  );
}

export function MonthlyChart({ orders, start, end }: { orders: WorkOrder[]; start: number; end: number }) {
  const rows: MonthRow[] = monthBuckets(start, end).map((b) => {
    const inMonth = orders.filter((o) => monthKey(o.logged) === b.key);
    return { ...b, logged: inMonth.length, done: inMonth.filter((o) => o.done).length };
  });
  if (!rows.length || !orders.length) return <p className="fm-empty">No work orders</p>;
  const { top, ticks } = scale(Math.max(...rows.map((r) => r.logged)));
  const years = Array.from(new Set(rows.map((r) => r.year)));
  const yearLabel = years.length === 1 ? String(years[0]) : `${years[0]}–${years[years.length - 1]}`;
  return (
    <Box label="Work orders logged and completed each month">
      {(g) => <MonthlyPlot g={g} rows={rows} top={top} ticks={ticks} yearLabel={yearLabel} />}
    </Box>
  );
}

export function CompletionChart({ rows }: { rows: CategoryRow[] }) {
  const data = rows
    .filter((r) => r.logged > 0)
    .map((r) => ({ name: r.category, done: r.done, logged: r.logged, rate: Math.round((r.done / r.logged) * 100) }))
    .sort((a, b) => b.rate - a.rate);
  if (!data.length) return <p className="fm-empty">No work orders</p>;
  const ticks = [0, 25, 50, 75, 100];
  return (
    <Box label="Completion rate by category">
      {(g) => {
        const pw = g.w - g.pl - g.pr;
        const bw = Math.min(44, (pw / data.length) * 0.62);
        return (
          <>
            <Frame g={g} top={100} ticks={ticks} xTitle="Category" yTitle="Completion rate (%)" fmt={(v) => `${v}%`} />
            {data.map((d, i) => {
              const cx = g.pl + (pw / data.length) * (i + 0.5);
              const h = (d.rate / 100) * g.ph;
              return (
                <g key={d.name}>
                  <title>{`${d.name}: ${d.done} of ${d.logged} done (${d.rate}%)`}</title>
                  <rect className="wo-done" x={cx - bw / 2} y={g.pb - h} width={bw} height={h} />
                  <text className="wo-val" x={cx} y={g.pb - h - 5} textAnchor="middle">{d.rate}%</text>
                  <XLabel g={g} x={cx} text={d.name} />
                </g>
              );
            })}
          </>
        );
      }}
    </Box>
  );
}
