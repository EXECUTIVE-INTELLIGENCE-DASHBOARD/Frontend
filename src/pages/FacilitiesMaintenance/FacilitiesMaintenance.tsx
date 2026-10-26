import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { CleaningChart } from "./FacilitiesCharts";
import {
  ALL_CAMPUSES, DAY, EMPLOYMENT, LOCATIONS, REVIEW_THRESHOLD, SCHOOLS, SECTIONS, UTILITIES,
  categoryRows, comparePeriod, monthsBetween, parseDate, schoolDays, scopeCampuses, shortName, ymLabel,
} from "./facilities.data";
import { longDate, money, num, pct1, shortDate } from "./facilities.format";
import { useFacilities } from "./facilities.hooks";
import type { Compare, Employment, FacilitiesFilters, FurnitureRow, OrderStatus, SectionName, UtilityRow, WorkOrder } from "./facilities.types";
import "./FacilitiesMaintenance.css";

const DEFAULT_FILTERS: FacilitiesFilters = { employment: "All Employment", campus: ALL_CAMPUSES, section: "", start: "2026-02-01", end: "2026-10-26" };
const MIN_DATE = "2026-01-01";
const MAX_DATE = "2026-10-26";
type ModalKind = "orders" | "furniture" | "utilities" | null;

interface Option { value: string; label: string }
const opts = (xs: readonly string[]): Option[] => xs.map((x) => ({ value: x, label: x }));

function Field({ label, value, onChange, options, inline, disabled }: {
  label: string; value: string; onChange: (v: string) => void; options: Option[]; inline?: boolean; disabled?: boolean;
}) {
  const id = `fm-${label.toLowerCase().replace(/\s+/g, "-")}${inline ? "-in" : ""}`;
  return (
    <div className={inline ? "fm-field fm-field--inline" : "fm-field"}>
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function DateRange({ start, end, onChange }: { start: string; end: string; onChange: (s: string, e: string) => void }) {
  const pick = (e: MouseEvent<HTMLInputElement>) => {
    try { e.currentTarget.showPicker?.(); } catch { /* not supported */ }
  };
  return (
    <div className="fm-field">
      <label id="fm-range">Date range</label>
      <div className="fm-range" role="group" aria-labelledby="fm-range">
        <span aria-hidden="true">▦</span>
        <span className="fm-date">{longDate(parseDate(start))}
          <input type="date" aria-label="Start date" value={start} min={MIN_DATE} max={MAX_DATE} onClick={pick}
            onChange={(e) => e.target.value && onChange(e.target.value, e.target.value > end ? e.target.value : end)} />
        </span>
        <i aria-hidden="true">→</i>
        <span className="fm-date">{longDate(parseDate(end))}
          <input type="date" aria-label="End date" value={end} min={MIN_DATE} max={MAX_DATE} onClick={pick}
            onChange={(e) => e.target.value && onChange(e.target.value < start ? e.target.value : start, e.target.value)} />
        </span>
      </div>
    </div>
  );
}

const Chip = ({ children, tone }: { children: ReactNode; tone?: "ok" | "n" }) => (
  <span className={tone ? `fm-chip fm-chip--${tone}` : "fm-chip"}>{children}</span>
);

const orderChip = (s: OrderStatus) =>
  s === "Overdue" ? <Chip>⚠ Overdue</Chip> : s === "Completed" ? <Chip tone="ok">✔ Completed</Chip> : <Chip tone="n">In progress</Chip>;

const changeText = (c: number) => `${c >= 0 ? "▲ +" : "▼ −"}${pct1(Math.abs(c * 100))}%`;

function Kpi({ icon, label, value, detail }: { icon: string; label: string; value: string; detail: string }) {
  return (
    <div className="fm-kpi">
      <span className="fm-kpi__icon" aria-hidden="true">{icon}</span>
      <p className="fm-kpi__label">{label}</p>
      <p className="fm-kpi__value">{value}</p>
      <p className="fm-kpi__detail">{detail}</p>
    </div>
  );
}

function FurnitureCells({ r }: { r: FurnitureRow }) {
  return (
    <>
      <td className={r.chairs < r.learners ? "fm-strong" : ""}>{r.chairs < r.learners ? "▼ " : ""}{r.chairs}</td>
      <td className={r.desks < r.learners ? "fm-strong" : ""}>{r.desks < r.learners ? "▼ " : ""}{r.desks}</td>
    </>
  );
}

export default function FacilitiesMaintenance() {
  const [filters, setFilters] = useState<FacilitiesFilters>(DEFAULT_FILTERS);
  const [location, setLocation] = useState("");
  const [furDateStr, setFurDateStr] = useState("");
  const [periodStr, setPeriodStr] = useState("");
  const [compare, setCompare] = useState<Compare>("prev");
  const [modal, setModal] = useState<ModalKind>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);

  const start = parseDate(filters.start);
  const end = parseDate(filters.end);
  const campuses = useMemo(() => scopeCampuses(filters), [filters]);
  const days = useMemo(() => schoolDays(start, end), [start, end]);
  const furDate = days.includes(Number(furDateStr)) ? Number(furDateStr) : days[days.length - 1] ?? 0;
  const months = useMemo(() => monthsBetween(start, end), [start, end]);
  const period = months.includes(Number(periodStr)) ? Number(periodStr) : months[0];

  const { orders: allOrders, cleaning, furniture, utilities, loading, error } = useFacilities({
    campuses, section: filters.section, days, furnitureDate: furDate, period, compare,
  });

  const orders = useMemo(
    () => allOrders.filter((o) => o.logged >= start && o.logged <= end + DAY - 1 && (!location || o.location === location)),
    [allOrders, start, end, location],
  );
  const done = orders.filter((o) => o.done).length;
  const overdue = orders.filter((o) => o.status === "Overdue").length;
  const categories = useMemo(() => categoryRows(orders), [orders]);
  const utilitiesByChange = useMemo(() => [...utilities].sort((a, b) => b.change - a.change), [utilities]);
  const summaries = UTILITIES.map((u) => {
    const rows = utilities.filter((r) => r.utility === u.name);
    const cur = rows.reduce((a, r) => a + r.current, 0);
    const prev = rows.reduce((a, r) => a + r.previous, 0);
    return { name: u.name, cur, change: prev ? (cur - prev) / prev : 0 };
  });

  const update = (patch: Partial<FacilitiesFilters>) =>
    setFilters((f) => {
      const next = { ...f, ...patch };
      if (next.employment === "GSL") next.campus = ALL_CAMPUSES;
      return next;
    });

  const openModal = (k: Exclude<ModalKind, null>) => { setStatusFilter(""); setModal(k); };
  useEffect(() => {
    if (!modal) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setModal(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  const gslOnly = filters.employment === "GSL";
  const prevLabel = ymLabel(comparePeriod(period, compare));
  const orderList = orders.filter((o) => !statusFilter || o.status === statusFilter).sort((a, b) => a.due - b.due);

  const utilityRow = (r: UtilityRow, full: boolean) => (
    <tr key={r.campus + r.utility} className={r.change >= REVIEW_THRESHOLD ? "fm-row--flag" : ""}>
      <td>{shortName(r.campus)}</td><td>{r.utility}</td>
      {full && <><td>{num(r.current)}</td><td>{num(r.previous)}</td></>}
      <td className="fm-strong">{changeText(r.change)}</td>
      <td>{r.change >= REVIEW_THRESHOLD ? <Chip>Review</Chip> : <Chip tone="n">Normal</Chip>}</td>
    </tr>
  );

  return (
    <div className="fm-page">
      <section className="fm-filters" aria-label="Filters">
        <Field label="Employment" value={filters.employment} onChange={(v) => update({ employment: v as Employment })} options={opts(EMPLOYMENT)} />
        <Field label="Campus" value={filters.campus} disabled={gslOnly} onChange={(v) => update({ campus: v })} options={opts([ALL_CAMPUSES, ...SCHOOLS])} />
        <Field label="Section" value={filters.section} onChange={(v) => update({ section: v as SectionName })} options={SECTIONS} />
        <DateRange start={filters.start} end={filters.end} onChange={(s, e) => update({ start: s, end: e })} />
      </section>

      {error && <p role="alert" className="fm-state">{error}</p>}
      {loading && <p className="fm-state" aria-live="polite">Loading…</p>}

      {!loading && !error && (
        <>
          <div className="fm-kpis">
            <Kpi icon="▤" label="Work Orders Logged" value={num(orders.length)} detail={`${shortDate(start)} to ${shortDate(end)}`} />
            <Kpi icon="✔" label="Completed" value={num(done)} detail={`${orders.length ? Math.round((done / orders.length) * 100) : 0}% of logged`} />
            <Kpi icon="◔" label="Outstanding" value={num(orders.length - done)} detail="Not yet completed" />
            <Kpi icon="!" label="Overdue" value={num(overdue)} detail="Past deadline" />
          </div>

          <div className="fm-grid">
            <section className="fm-card">
              <div className="fm-card__head"><h3>Work Orders</h3><div className="fm-inline"><Field inline label="Location" value={location} onChange={setLocation} options={[{ value: "", label: "All Locations" }, ...opts(LOCATIONS)]} /></div></div>
              <div className="fm-scroll">
                <table className="fm-table">
                  <thead><tr><th>Category</th><th>Logged</th><th>Done</th><th>Open</th><th>Overdue</th></tr></thead>
                  <tbody>
                    {categories.map((r) => (
                      <tr key={r.category} className={r.overdue ? "fm-row--flag" : ""}>
                        <td>{r.category}</td><td>{r.logged}</td><td>{r.done}</td><td>{r.open}</td><td>{r.overdue ? <Chip>⚠ {r.overdue}</Chip> : 0}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr><td>Total</td><td>{orders.length}</td><td>{done}</td><td>{orders.length - done}</td><td>{overdue}</td></tr></tfoot>
                </table>
              </div>
              <button type="button" className="fm-btn" onClick={() => openModal("orders")}>View all ({orders.length})</button>
            </section>

            <section className="fm-card">
              <div className="fm-card__head"><h3>Cleaning Completion</h3></div>
              <CleaningChart days={cleaning} campuses={campuses.length} />
              <div className="fm-key">
                <span><i className="fm-key__sw fm-key__sw--done" />Complete</span>
                <span><i className="fm-key__sw fm-key__sw--partial" />Incomplete</span>
                <span><i className="fm-key__sw fm-key__sw--none" />No record</span>
              </div>
              <div className="fm-card__head">
                <p className="fm-sub">Chairs and Desks</p>
                <div className="fm-inline">
                  <Field inline label="Date" value={String(furDate)} onChange={setFurDateStr} options={days.map((d) => ({ value: String(d), label: shortDate(d) }))} />
                </div>
              </div>
              <div className="fm-scroll">
                <table className="fm-table">
                  <thead><tr><th>Class</th><th>Learners</th><th>Chairs</th><th>Desks</th><th>Status</th></tr></thead>
                  <tbody>
                    {furniture.length === 0 && <tr><td colSpan={5} className="fm-empty">No classes</td></tr>}
                    {furniture.slice(0, 4).map((r) => (
                      <tr key={r.campus + r.cls} className={r.short ? "fm-row--flag" : ""}>
                        <td>{r.cls}<small className="fm-muted">{shortName(r.campus)}</small></td><td>{r.learners}</td>
                        <FurnitureCells r={r} />
                        <td>{r.short ? <Chip>▼ Short</Chip> : <Chip tone="ok">✔ OK</Chip>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" className="fm-btn" onClick={() => openModal("furniture")}>View all ({furniture.length})</button>
            </section>

            <section className="fm-card">
              <div className="fm-card__head">
                <h3>Utility Costs</h3>
                <div className="fm-inline">
                  <Field inline label="Period" value={String(period)} onChange={setPeriodStr} options={months.map((m) => ({ value: String(m), label: ymLabel(m) }))} />
                  <Field inline label="Compare with" value={compare} onChange={(v) => setCompare(v as Compare)} options={[{ value: "prev", label: "Previous month" }, { value: "year", label: "Same month last year" }]} />
                </div>
              </div>
              <div className="fm-mini">
                {summaries.map((s) => (
                  <div key={s.name} className="fm-mini__item">
                    <small>{s.name}</small><b>UGX {money(s.cur)}</b>
                    <Chip tone={s.change >= REVIEW_THRESHOLD ? undefined : "ok"}>{changeText(s.change)}</Chip>
                  </div>
                ))}
              </div>
              <div className="fm-scroll">
                <table className="fm-table">
                  <thead><tr><th>Campus</th><th>Utility</th><th>Change</th><th>Status</th></tr></thead>
                  <tbody>{utilitiesByChange.slice(0, 5).map((r) => utilityRow(r, false))}</tbody>
                </table>
              </div>
              <button type="button" className="fm-btn" onClick={() => openModal("utilities")}>View all ({utilities.length})</button>
            </section>
          </div>
        </>
      )}

      {modal && (
        <div className="fm-modal" onClick={() => setModal(null)}>
          <div className="fm-modal__panel" role="dialog" aria-modal="true" aria-labelledby="fm-modal-title" onClick={(e) => e.stopPropagation()}>
            <div className="fm-modal__head">
              <h3 id="fm-modal-title">
                {modal === "orders" && "Work Orders"}
                {modal === "furniture" && `Chairs and Desks · ${shortDate(furDate)}`}
                {modal === "utilities" && `Utility Costs · ${ymLabel(period)} vs ${prevLabel}`}
              </h3>
              {modal === "orders" && (
                <Field inline label="Status" value={statusFilter} onChange={setStatusFilter} options={[{ value: "", label: "All Statuses" }, ...opts(["Completed", "In progress", "Overdue"])]} />
              )}
              <button ref={closeRef} type="button" className="fm-modal__close" aria-label="Close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="fm-scroll">
              <table className="fm-table">
                {modal === "orders" && (
                  <>
                    <thead><tr><th>ID</th><th>Campus</th><th>Category</th><th>Location</th><th>Type</th><th>Service provider</th><th>Deadline</th><th>Status</th></tr></thead>
                    <tbody>
                      {orderList.length === 0 && <tr><td colSpan={8} className="fm-empty">No work orders</td></tr>}
                      {orderList.map((o: WorkOrder) => (
                        <tr key={o.id} className={o.status === "Overdue" ? "fm-row--flag" : ""}>
                          <td>{o.id}</td><td>{shortName(o.campus)}</td><td>{o.category}</td><td>{o.location}</td><td>{o.type}</td><td>{o.provider}</td><td>{longDate(o.due)}</td><td>{orderChip(o.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
                {modal === "furniture" && (
                  <>
                    <thead><tr><th>Class</th><th>Campus</th><th>Learners</th><th>Chairs</th><th>Desks</th><th>Status</th></tr></thead>
                    <tbody>
                      {furniture.map((r) => (
                        <tr key={r.campus + r.cls} className={r.short ? "fm-row--flag" : ""}>
                          <td>{r.cls}</td><td>{shortName(r.campus)}</td><td>{r.learners}</td><FurnitureCells r={r} />
                          <td>{r.short ? <Chip>▼ Short</Chip> : <Chip tone="ok">✔ OK</Chip>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
                {modal === "utilities" && (
                  <>
                    <thead><tr><th>Campus</th><th>Utility</th><th>{ymLabel(period)} (UGX)</th><th>{prevLabel} (UGX)</th><th>Change</th><th>Status</th></tr></thead>
                    <tbody>{utilitiesByChange.map((r) => utilityRow(r, true))}</tbody>
                  </>
                )}
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
