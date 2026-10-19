import { useEffect, useRef, useState, type ReactNode } from "react";
import { outlets } from "../../lib/services.data";
import type { MonthlySales, OutletFilterValue, Tone } from "../../lib/services.types";


const icons = {
  coins: <><circle cx="12" cy="12" r="9" /><path d="M14.5 9.5a2.5 2 0 0 0-2.5-1.5c-1.4 0-2.5.8-2.5 2s1.1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2a2.5 2 0 0 1-2.5-1.5M12 6v2m0 8v2" /></>,
  trend: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  receipt: <><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z" /><path d="M9 8h6M9 12h6" /></>,
  box: <><path d="M21 8l-9-5-9 5v8l9 5 9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></>,
  alert: <><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18v.01" /></>,
  store: <><path d="M3 9l2-5h14l2 5M4 9v11h16V9" /><path d="M10 20v-5h4v5" /></>,
  wallet: <><path d="M3 7h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M3 7l12-4v4M17 14h2" /></>,
  gauge: <><path d="M4 18a8 8 0 1 1 16 0" /><path d="M12 18l4-6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
} satisfies Record<string, ReactNode>;

export type KpiIcon = keyof typeof icons;

interface KpiProps {
  icon: KpiIcon;
  title: string;
  value: ReactNode;
  unit?: string;
  note?: string;
  tone?: "ok" | "bad";
}

export function Kpi({ icon, title, value, unit, note, tone }: KpiProps) {
  return (
    <div className="svc-kpi">
      <span className="svc-kic">
        <svg viewBox="0 0 24 24" aria-hidden="true">{icons[icon]}</svg>
      </span>
      <div>
        <div className="svc-kt">{title}</div>
        <div className="svc-kv">{value}{unit && <small>{unit}</small>}</div>
        {note && <div className={`svc-kd ${tone ?? ""}`}>{note}</div>}
      </div>
    </div>
  );
}

export const KpiRow = ({ children }: { children: ReactNode }) => <div className="svc-kpis">{children}</div>;


export const Pill = ({ tone, children }: { tone: Tone; children: ReactNode }) => (
  <span className={`svc-pill ${tone}`}>{children}</span>
);


interface FilterBarProps {
  value: OutletFilterValue;
  onChange: (v: OutletFilterValue) => void;
  showOutlet?: boolean;
}

/** Date-range + outlet selects shown above each screen. */
export function FilterBar({ value, onChange, showOutlet = true }: FilterBarProps) {
  return (
    <div className="svc-fl">
      <select aria-label="Date range" defaultValue="">
        <option value="">01 Feb 2026 → 17 Oct 2026</option>
        <option>Term 3 2026</option>
        <option>Last 30 days</option>
      </select>
      {showOutlet && (
        <select aria-label="Outlet" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="all">All Outlets</option>
          {outlets.map((o) => (
            <option key={o.id} value={o.id}>{o.name} – {o.type}</option>
          ))}
        </select>
      )}
    </div>
  );
}


export interface Column<T> {
  header: string;
  unit?: string;
  numeric?: boolean;
  cell: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  title: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  collapsedCount?: number;
  note?: ReactNode;
  onExport?: () => void;
}

export function DataTable<T>({ title, columns, rows, rowKey, collapsedCount = 6, note, onExport }: DataTableProps<T>) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? rows : rows.slice(0, collapsedCount);

  return (
    <section className="svc-panel">
      <div className="svc-ph">
        <h2>{title}</h2>
        <button className="svc-btn" onClick={onExport ?? (() => alert("Export placeholder"))}>Export Report</button>
      </div>
      {note}
      <div className="svc-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.header} className={c.numeric ? "r" : undefined}>
                  {c.header}
                  {c.unit && <><br /><span>{c.unit}</span></>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((c) => (
                  <td key={c.header} className={c.numeric ? "r" : undefined}>{c.cell(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > collapsedCount && (
        <button className="svc-va" onClick={() => setExpanded((e) => !e)}>
          {expanded ? "Show less ⌃" : `View all (${rows.length}) ⌄`}
        </button>
      )}
    </section>
  );
}

export const OutletName = ({ icon, name }: { icon?: string; name: string }) => (
  <div className="svc-nm">{icon && <span className="svc-ic">{icon}</span>}{name}</div>
);


const H = 220, T = 24, B = 180, L = 48, PAD = 16;
const ticks = [40, 60, 80, 100, 120];
const axis = { fontFamily: "Inter, sans-serif", fontSize: 12, fill: "var(--svc-mut)" };
const label = { ...axis, fontWeight: 600 };

export function SalesTrendChart({ data }: { data: MonthlySales[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(900);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(320, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const R = w - PAD;
  const x = (i: number) => L + ((i + 0.5) * (R - L)) / data.length;
  const y = (v: number) => B - ((v - 40) / 80) * (B - T);

  return (
    <div className="svc-panel">
      <div className="svc-ph"><h2>Monthly Sales Trend</h2></div>
      <div ref={ref} style={{ padding: "0 20px 8px" }}>
        <svg width={w} height={H} role="img" aria-label="Monthly sales trend, UGX millions">
          {ticks.map((v) => (
            <g key={v}>
              <line x1={L} x2={R} y1={y(v)} y2={y(v)} stroke="var(--svc-line)" />
              <text x={L - 8} y={y(v) + 4} textAnchor="end" style={axis}>{v}</text>
            </g>
          ))}
          <line x1={L} x2={L} y1={T} y2={B} stroke="var(--svc-mut)" />
          <line x1={L} x2={R} y1={B} y2={B} stroke="var(--svc-mut)" />
          <polyline fill="none" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" stroke="var(--svc-blue)"
            points={data.map((m, i) => `${x(i)},${y(m.value)}`).join(" ")} />
          {data.map((m, i) => (
            <g key={m.month}>
              <circle cx={x(i)} cy={y(m.value)} r={4.5} fill="var(--svc-blue)" />
              <text x={x(i)} y={y(m.value) - 10} textAnchor="middle" style={{ ...label, fill: "var(--svc-ink)" }}>{m.value}</text>
              <text x={x(i)} y={B + 18} textAnchor="middle" style={axis}>{m.month}</text>
            </g>
          ))}
          <text x={(L + R) / 2} y={H - 4} textAnchor="middle" style={label}>Month (2026)</text>
          <text transform={`translate(12 ${(T + B) / 2}) rotate(-90)`} textAnchor="middle" style={label}>UGX millions</text>
        </svg>
      </div>
    </div>
  );
}
const H = 220, T = 24, B = 180, L = 48, PAD = 16;
const ticks = [40, 60, 80, 100, 120];
const axis = { fontFamily: "Inter, sans-serif", fontSize: 12, fill: "var(--svc-mut)" };
const label = { ...axis, fontWeight: 600 };

export function SalesTrendChart({ data }: { data: MonthlySales[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(900);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(320, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const R = w - PAD;
  const x = (i: number) => L + ((i + 0.5) * (R - L)) / data.length;
  const y = (v: number) => B - ((v - 40) / 80) * (B - T);

  return (
    <div className="svc-panel">
      <div className="svc-ph"><h2>Monthly Sales Trend</h2></div>
      <div ref={ref} style={{ padding: "0 20px 8px" }}>
        <svg width={w} height={H} role="img" aria-label="Monthly sales trend, UGX millions">
          {ticks.map((v) => (
            <g key={v}>
              <line x1={L} x2={R} y1={y(v)} y2={y(v)} stroke="var(--svc-line)" />
              <text x={L - 8} y={y(v) + 4} textAnchor="end" style={axis}>{v}</text>
            </g>
          ))}
          <line x1={L} x2={L} y1={T} y2={B} stroke="var(--svc-mut)" />
          <line x1={L} x2={R} y1={B} y2={B} stroke="var(--svc-mut)" />
          <polyline fill="none" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" stroke="var(--svc-blue)"
            points={data.map((m, i) => `${x(i)},${y(m.value)}`).join(" ")} />
          {data.map((m, i) => (
            <g key={m.month}>
              <circle cx={x(i)} cy={y(m.value)} r={4.5} fill="var(--svc-blue)" />
              <text x={x(i)} y={y(m.value) - 10} textAnchor="middle" style={{ ...label, fill: "var(--svc-ink)" }}>{m.value}</text>
              <text x={x(i)} y={B + 18} textAnchor="middle" style={axis}>{m.month}</text>
            </g>
          ))}
          <text x={(L + R) / 2} y={H - 4} textAnchor="middle" style={label}>Month (2026)</text>
          <text transform={`translate(12 ${(T + B) / 2}) rotate(-90)`} textAnchor="middle" style={label}>UGX millions</text>
        </svg>
      </div>
    </div>
  );
}
const H = 220, T = 24, B = 180, L = 48, PAD = 16;
const ticks = [40, 60, 80, 100, 120];
const axis = { fontFamily: "Inter, sans-serif", fontSize: 12, fill: "var(--svc-mut)" };
const label = { ...axis, fontWeight: 600 };

export function SalesTrendChart({ data }: { data: MonthlySales[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(900);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(320, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const R = w - PAD;
  const x = (i: number) => L + ((i + 0.5) * (R - L)) / data.length;
  const y = (v: number) => B - ((v - 40) / 80) * (B - T);

  return (
    <div className="svc-panel">
      <div className="svc-ph"><h2>Monthly Sales Trend</h2></div>
      <div ref={ref} style={{ padding: "0 20px 8px" }}>
        <svg width={w} height={H} role="img" aria-label="Monthly sales trend, UGX millions">
          {ticks.map((v) => (
            <g key={v}>
              <line x1={L} x2={R} y1={y(v)} y2={y(v)} stroke="var(--svc-line)" />
              <text x={L - 8} y={y(v) + 4} textAnchor="end" style={axis}>{v}</text>
            </g>
          ))}
          <line x1={L} x2={L} y1={T} y2={B} stroke="var(--svc-mut)" />
          <line x1={L} x2={R} y1={B} y2={B} stroke="var(--svc-mut)" />
          <polyline fill="none" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" stroke="var(--svc-blue)"
            points={data.map((m, i) => `${x(i)},${y(m.value)}`).join(" ")} />
          {data.map((m, i) => (
            <g key={m.month}>
              <circle cx={x(i)} cy={y(m.value)} r={4.5} fill="var(--svc-blue)" />
              <text x={x(i)} y={y(m.value) - 10} textAnchor="middle" style={{ ...label, fill: "var(--svc-ink)" }}>{m.value}</text>
              <text x={x(i)} y={B + 18} textAnchor="middle" style={axis}>{m.month}</text>
            </g>
          ))}
          <text x={(L + R) / 2} y={H - 4} textAnchor="middle" style={label}>Month (2026)</text>
          <text transform={`translate(12 ${(T + B) / 2}) rotate(-90)`} textAnchor="middle" style={label}>UGX millions</text>
        </svg>
      </div>
    </div>
  );
}
