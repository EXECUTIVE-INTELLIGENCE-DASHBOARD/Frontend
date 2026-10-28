
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, ClipboardList, Clock } from "lucide-react";
import "../../components/academic-performance/AcademicSummary.css";
import {
  ALL_CAMPUSES,
  DAY,
  LOCATIONS,
  REVIEW_THRESHOLD,
  SCHOOLS,
  SECTIONS,
  categoryRows,
  comparePeriod,
  monthsBetween,
  parseDate,
  schoolDays,
  scopeCampuses,
  shortName,
  ymLabel,
} from "./facilities.data";
import { longDate, num, pct1, shortDate } from "./facilities.format";
import { useFacilities } from "./facilities.hooks";
import type {
  Compare,
  FacilitiesFilters,
  FurnitureRow,
  OrderStatus,
  SectionName,
  WorkOrder,
} from "./facilities.types";
import "./FacilitiesMaintenance.css";
import {
  DEFAULT_FILTERS,
  MAX_DATE,
  MIN_DATE,
  REL,
  TODAY,
} from "./facilities.constants";

type ModalKind = "orders" | "furniture" | null;
type ListStatus = "Completed" | "Outstanding" | "Overdue";

interface Option {
  value: string;
  label: string;
}

const opts = (xs: readonly string[]): Option[] =>
  xs.map((x) => ({ value: x, label: x }));

function Field({
  label,
  value,
  onChange,
  options,
  inline,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  inline?: boolean;
  disabled?: boolean;
}) {
  const id = `fm-${label.toLowerCase().replace(/\s+/g, "-")}${inline ? "-in" : ""}`;

  return (
    <div className={inline ? "fm-field fm-field--inline" : "fm-field"}>
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function DateRange({
  start,
  end,
  onChange,
}: {
  start: string;
  end: string;
  onChange: (s: string, e: string) => void;
}) {
  const pick = (e: MouseEvent<HTMLInputElement>) => {
    try {
      e.currentTarget.showPicker?.();
    } catch {
      /* Not supported by every browser. */
    }
  };

  return (
    <div className="fm-field">
      <label id="fm-range">Date range</label>
      <div className="fm-range" role="group" aria-labelledby="fm-range">
        <span aria-hidden="true">▦</span>

        <span className="fm-date">
          {longDate(parseDate(start))}
          <input
            type="date"
            aria-label="Start date"
            value={start}
            min={MIN_DATE}
            max={MAX_DATE}
            onClick={pick}
            onChange={(e) =>
              e.target.value &&
              onChange(
                e.target.value,
                e.target.value > end ? e.target.value : end
              )
            }
          />
        </span>

        <i aria-hidden="true">→</i>

        <span className="fm-date">
          {longDate(parseDate(end))}
          <input
            type="date"
            aria-label="End date"
            value={end}
            min={MIN_DATE}
            max={MAX_DATE}
            onClick={pick}
            onChange={(e) =>
              e.target.value &&
              onChange(
                e.target.value < start ? e.target.value : start,
                e.target.value
              )
            }
          />
        </span>
      </div>
    </div>
  );
}

const Chip = ({
  children,
  tone,
}: {
  children: ReactNode;
  tone?: "ok" | "n" | "cn";
}) => (
  <span className={tone ? `fm-chip fm-chip--${tone}` : "fm-chip"}>
    {children}
  </span>
);

const orderChip = (s: OrderStatus) =>
  s === "Overdue" ? (
    <Chip>⚠ Overdue</Chip>
  ) : s === "Completed" ? (
    <Chip tone="ok">✔ Completed</Chip>
  ) : (
    <Chip tone="n">In progress</Chip>
  );

const changeText = (c: number) =>
  `${c >= 0 ? "▲ +" : "▼ −"}${pct1(Math.abs(c * 100))}%`;

function Kpi({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <article className="acad-metric">
      <span className="acad-metric__icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <div className="acad-metric__content">
        <span className="acad-metric__label">{label}</span>
        <strong className="acad-metric__value">{value}</strong>
        {detail && <p className="acad-metric__description">{detail}</p>}
      </div>
    </article>
  );
}

function OrderListCard({
  title,
  orders,
  status,
  onViewAll,
}: {
  title: string;
  orders: WorkOrder[];
  status: ListStatus;
  onViewAll: () => void;
}) {
  const sorted = [...orders]
    .sort((a, b) =>
      status === "Completed" ? b.due - a.due : a.due - b.due
    )
    .slice(0, 4);

  const right = (o: WorkOrder) =>
    status === "Overdue" ? (
      <Chip>{Math.max(1, Math.round((TODAY - o.due) / DAY))} days late</Chip>
    ) : status === "Outstanding" && o.status === "Overdue" ? (
      <Chip>Overdue</Chip>
    ) : (
      <em>Due {shortDate(o.due)}</em>
    );

  return (
    <section className="fm-card">
      <div className="fm-card__head">
        <h3>{title}</h3>
        <button type="button" className="fm-btn" onClick={onViewAll}>
          View all ({orders.length})
        </button>
      </div>

      <ul className="fm-list">
        {sorted.length === 0 && (
          <li className="fm-empty">No work orders</li>
        )}

        {sorted.map((o) => (
          <li key={o.id} className="fm-list__item">
            <div>
              <b>{o.id}</b>
              <small>
                {o.category} · {o.provider}
              </small>
            </div>
            {right(o)}
          </li>
        ))}
      </ul>
    </section>
  );
}

function FurnitureCells({ r }: { r: FurnitureRow }) {
  return (
    <>
      <td className={r.chairs < r.learners ? "fm-strong" : ""}>
        {r.chairs < r.learners ? "▼ " : ""}
        {r.chairs}
      </td>
      <td className={r.desks < r.learners ? "fm-strong" : ""}>
        {r.desks < r.learners ? "▼ " : ""}
        {r.desks}
      </td>
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
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const closeRef = useRef<HTMLButtonElement>(null);

  const start = parseDate(filters.start);
  const end = parseDate(filters.end);

  const campuses = useMemo(() => scopeCampuses(filters), [filters]);
  const days = useMemo(() => schoolDays(start, end), [start, end]);

  const furDate = days.includes(Number(furDateStr))
    ? Number(furDateStr)
    : days[days.length - 1] ?? 0;

  const months = useMemo(() => monthsBetween(start, end), [start, end]);

  const period = months.includes(Number(periodStr))
    ? Number(periodStr)
    : months[0];

  const {
    orders: allOrders,
    furniture,
    utilities,
    loading,
    error,
  } = useFacilities({
    campuses,
    section: filters.section,
    days,
    furnitureDate: furDate,
    period,
    compare,
  });

  const orders = useMemo(
    () =>
      allOrders.filter(
        (o) =>
          o.logged >= start &&
          o.logged <= end + DAY - 1 &&
          (!location || o.location === location)
      ),
    [allOrders, start, end, location]
  );

  const done = orders.filter((o) => o.done).length;
  const overdue = orders.filter((o) => o.status === "Overdue").length;

  const categories = useMemo(
    () =>
      [...categoryRows(orders)].sort(
        (a, b) => b.overdue - a.overdue || b.open - a.open
      ),
    [orders]
  );

  const update = (patch: Partial<FacilitiesFilters>) =>
    setFilters((f) => ({ ...f, ...patch }));

  const toggle = (c: string) =>
    setOpen((o) => ({ ...o, [c]: !o[c] }));

  const openModal = (k: Exclude<ModalKind, null>, status = "") => {
    setStatusFilter(status);
    setModal(k);
  };

  useEffect(() => {
    if (!modal) return;

    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setModal(null);

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  const furOpen = !!open.Furniture;
  const utilOpen = Object.entries(REL).some(
    ([c, r]) => r.utility && open[c]
  );

  const prevLabel = ymLabel(comparePeriod(period, compare));

  const orderList = orders
    .filter(
      (o) =>
        !statusFilter ||
        (statusFilter === "Outstanding" ? !o.done : o.status === statusFilter)
    )
    .sort((a, b) => a.due - b.due);

  const furnitureDetail = (
    <>
      <div className="fm-detail__head">
        <span>Chairs and desks · {shortDate(furDate)}</span>
        <button
          type="button"
          className="fm-btn"
          onClick={() => openModal("furniture")}
        >
          View all ({furniture.length})
        </button>
      </div>

      <table className="fm-table fm-table--furn">
        <thead>
          <tr>
            <th>Class</th>
            <th>Campus</th>
            <th>Learners</th>
            <th>Chairs</th>
            <th>Desks</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {furniture.length === 0 && (
            <tr>
              <td colSpan={6} className="fm-empty">
                No classes
              </td>
            </tr>
          )}

          {furniture.slice(0, 5).map((r) => (
            <tr
              key={r.campus + r.cls}
              className={r.short ? "fm-row--flag" : ""}
            >
              <td>{r.cls}</td>
              <td>{shortName(r.campus)}</td>
              <td>{r.learners}</td>
              <FurnitureCells r={r} />
              <td>
                {r.short ? (
                  <Chip>▼ Short</Chip>
                ) : (
                  <Chip tone="ok">✔ OK</Chip>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  const utilityDetail = (title: string, utility: string) => (
    <>
      <div className="fm-detail__head">
        <span>
          {title} · {ymLabel(period)} vs {prevLabel}
        </span>
      </div>

      <table className="fm-table">
        <thead>
          <tr>
            <th>Campus</th>
            <th>{ymLabel(period)} (UGX)</th>
            <th>{prevLabel} (UGX)</th>
            <th>Change</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {utilities
            .filter((r) => r.utility === utility)
            .map((r) => (
              <tr
                key={r.campus}
                className={r.change >= REVIEW_THRESHOLD ? "fm-row--flag" : ""}
              >
                <td>{shortName(r.campus)}</td>
                <td>{num(r.current)}</td>
                <td>{num(r.previous)}</td>
                <td className="fm-strong">{changeText(r.change)}</td>
                <td>
                  {r.change >= REVIEW_THRESHOLD ? (
                    <Chip>Review</Chip>
                  ) : (
                    <Chip tone="n">Normal</Chip>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );

  return (
    <div className="fm-page">
      <section className="fm-filters" aria-label="Filters">
        <Field
          label="Campus"
          value={filters.campus}
          onChange={(v) => update({ campus: v })}
          options={opts([ALL_CAMPUSES, ...SCHOOLS])}
        />
        <Field
          label="Section"
          value={filters.section}
          onChange={(v) => update({ section: v as SectionName })}
          options={SECTIONS}
        />
        <DateRange
          start={filters.start}
          end={filters.end}
          onChange={(s, e) => update({ start: s, end: e })}
        />
      </section>

      {error && <p role="alert" className="fm-state">{error}</p>}
      {loading && <p className="fm-state" aria-live="polite">Loading…</p>}

      {!loading && !error && (
        <>
          <div className="fm-kpis">
            <Kpi
              icon={ClipboardList}
              label="Work Orders Logged"
              value={num(orders.length)}
            />
            <Kpi
              icon={CheckCircle2}
              label="Completed"
              value={num(done)}
              detail={`${orders.length ? Math.round((done / orders.length) * 100) : 0}% of logged`}
            />
            <Kpi
              icon={Clock}
              label="Outstanding"
              value={num(orders.length - done)}
              detail="Not yet completed"
            />
            <Kpi
              icon={AlertTriangle}
              label="Overdue"
              value={num(overdue)}
              detail="Past deadline"
            />
          </div>

<div className="fm-lists">
  {(
    [
      {
        title: "Completed",
        status: "Completed",
        orders: orders.filter((o) => o.done),
      },
      {
        title: "Outstanding",
        status: "Outstanding",
        orders: orders.filter((o) => !o.done),
      },
      {
        title: "Overdue",
        status: "Overdue",
        orders: orders.filter((o) => o.status === "Overdue"),
      },
    ] satisfies {
      title: string;
      status: ListStatus;
      orders: WorkOrder[];
    }[]
  ).map(({ title, status, orders: groupOrders }) => (
    <OrderListCard
      key={title}
      title={title}
      status={status}
      orders={groupOrders}
      onViewAll={() => openModal("orders", title)}
    />
  ))}
</div>

          <section className="fm-card">
            <div className="fm-card__head">
              <h3>Work Orders</h3>
              <div className="fm-inline">
                <Field
                  inline
                  label="Location"
                  value={location}
                  onChange={setLocation}
                  options={[
                    { value: "", label: "All Locations" },
                    ...opts(LOCATIONS),
                  ]}
                />

                {furOpen && (
                  <Field
                    inline
                    label="Date"
                    value={String(furDate)}
                    onChange={setFurDateStr}
                    options={days.map((d) => ({
                      value: String(d),
                      label: shortDate(d),
                    }))}
                  />
                )}

                {utilOpen && (
                  <>
                    <Field
                      inline
                      label="Period"
                      value={String(period)}
                      onChange={setPeriodStr}
                      options={months.map((m) => ({
                        value: String(m),
                        label: ymLabel(m),
                      }))}
                    />
                    <Field
                      inline
                      label="Compare with"
                      value={compare}
                      onChange={(v) => setCompare(v as Compare)}
                      options={[
                        { value: "prev", label: "Previous month" },
                        { value: "year", label: "Same month last year" },
                      ]}
                    />
                  </>
                )}

                <button
                  type="button"
                  className="fm-btn"
                  onClick={() => openModal("orders")}
                >
                  View all ({orders.length})
                </button>
              </div>
            </div>

            <div className="fm-scroll">
              <table className="fm-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Logged</th>
                    <th>Done</th>
                    <th>Open</th>
                    <th>Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((r) => {
                    const rel = REL[r.category];
                    const isOpen = !!open[r.category];

                    return (
                      <Fragment key={r.category}>
                        <tr className={r.overdue ? "fm-row--flag" : ""}>
                          <td>
                            {rel ? (
                              <button
                                type="button"
                                className="fm-link"
                                aria-expanded={isOpen}
                                title={`${isOpen ? "Hide" : "Show"} ${rel.title.toLowerCase()}`}
                                onClick={() => toggle(r.category)}
                              >
                                {r.category}
                              </button>
                            ) : (
                              r.category
                            )}
                          </td>
                          <td>{r.logged}</td>
                          <td>{r.done}</td>
                          <td>{r.open}</td>
                          <td>
                            {r.overdue ? (
                              <Chip tone="cn">{r.overdue}</Chip>
                            ) : (
                              0
                            )}
                          </td>
                        </tr>

                        {rel && isOpen && (
                          <tr className="fm-detail">
                            <td colSpan={5}>
                              {rel.utility
                                ? utilityDetail(rel.title, rel.utility)
                                : furnitureDetail}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td>{orders.length}</td>
                    <td>{done}</td>
                    <td>{orders.length - done}</td>
                    <td>{overdue}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </>
      )}

      {modal && (
        <div className="fm-modal" onClick={() => setModal(null)}>
          <div
            className="fm-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fm-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="fm-modal__head">
              <h3 id="fm-modal-title">
                {modal === "orders" && "Work Orders"}
                {modal === "furniture" &&
                  `Chairs and Desks · ${shortDate(furDate)}`}
              </h3>

              {modal === "orders" && (
                <Field
                  inline
                  label="Status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "", label: "All Statuses" },
                    ...opts([
                      "Completed",
                      "Outstanding",
                      "In progress",
                      "Overdue",
                    ]),
                  ]}
                />
              )}

              <button
                ref={closeRef}
                type="button"
                className="fm-modal__close"
                aria-label="Close"
                onClick={() => setModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="fm-scroll">
              <table className="fm-table">
                {modal === "orders" && (
                  <>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Campus</th>
                        <th>Category</th>
                        <th>Location</th>
                        <th>Type</th>
                        <th>Service provider</th>
                        <th>Deadline</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderList.length === 0 && (
                        <tr>
                          <td colSpan={8} className="fm-empty">
                            No work orders
                          </td>
                        </tr>
                      )}

                      {orderList.map((o: WorkOrder) => (
                        <tr
                          key={o.id}
                          className={o.status === "Overdue" ? "fm-row--flag" : ""}
                        >
                          <td>{o.id}</td>
                          <td>{shortName(o.campus)}</td>
                          <td>{o.category}</td>
                          <td>{o.location}</td>
                          <td>{o.type}</td>
                          <td>{o.provider}</td>
                          <td>{longDate(o.due)}</td>
                          <td>{orderChip(o.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {modal === "furniture" && (
                  <>
                    <thead>
                      <tr>
                        <th>Class</th>
                        <th>Campus</th>
                        <th>Learners</th>
                        <th>Chairs</th>
                        <th>Desks</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {furniture.map((r) => (
                        <tr
                          key={r.campus + r.cls}
                          className={r.short ? "fm-row--flag" : ""}
                        >
                          <td>{r.cls}</td>
                          <td>{shortName(r.campus)}</td>
                          <td>{r.learners}</td>
                          <FurnitureCells r={r} />
                          <td>
                            {r.short ? (
                              <Chip>▼ Short</Chip>
                            ) : (
                              <Chip tone="ok">✔ OK</Chip>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
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
