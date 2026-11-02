import { useMemo, useState } from "react";
import type { MouseEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, ClipboardList, Clock } from "lucide-react";
import "../../components/academic-performance/AcademicSummary.css";
import {
  ALL_CAMPUSES,
  DAY,
  LOCATIONS,
  SCHOOLS,
  SECTIONS,
  categoryRows,
  monthsBetween,
  parseDate,
  schoolDays,
  scopeCampuses,
} from "./facilities.data";
import { longDate, num } from "./facilities.format";
import { useFacilities } from "./facilities.hooks";
import type { FacilitiesFilters, SectionName } from "./facilities.types";
import "./FacilitiesMaintenance.css";
import { DEFAULT_FILTERS, MAX_DATE, MIN_DATE } from "./facilities.constants";
import {
  CategoryChart,
  CompletionChart,
  Legend,
  MonthlyChart,
  StatusDonut,
} from "./WorkOrderCharts";

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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  inline?: boolean;
}) {
  const id = `fm-${label.toLowerCase().replace(/\s+/g, "-")}${inline ? "-in" : ""}`;

  return (
    <div className={inline ? "fm-field fm-field--inline" : "fm-field"}>
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
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
              onChange(e.target.value, e.target.value > end ? e.target.value : end)
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
              onChange(e.target.value < start ? e.target.value : start, e.target.value)
            }
          />
        </span>
      </div>
    </div>
  );
}

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

export default function FacilitiesMaintenance() {
  const [filters, setFilters] = useState<FacilitiesFilters>(DEFAULT_FILTERS);
  const [location, setLocation] = useState("");

  const start = parseDate(filters.start);
  const end = parseDate(filters.end);

  const campuses = useMemo(() => scopeCampuses(filters), [filters]);
  const days = useMemo(() => schoolDays(start, end), [start, end]);
  const months = useMemo(() => monthsBetween(start, end), [start, end]);

  const {
    orders: allOrders,
    loading,
    error,
  } = useFacilities({
    campuses,
    section: filters.section,
    days,
    furnitureDate: days[days.length - 1] ?? 0,
    period: months[0],
    compare: "prev",
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
  const onTime = Math.max(0, orders.length - done - overdue);
  const pct = (n: number) => (orders.length ? Math.round((n / orders.length) * 100) : 0);

  const categories = useMemo(
    () => [...categoryRows(orders)].sort((a, b) => b.logged - a.logged),
    [orders]
  );

  const update = (patch: Partial<FacilitiesFilters>) =>
    setFilters((f) => ({ ...f, ...patch }));

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
            <Kpi icon={ClipboardList} label="Work Orders Logged" value={num(orders.length)} />
            <Kpi
              icon={CheckCircle2}
              label="Completed"
              value={num(done)}
              detail={`${pct(done)}% of logged`}
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

          <div className="wo-grid">
            <section className="fm-card">
              <div className="fm-card__head">
                <h3>Status share</h3>
                <span className="wo-note">{num(orders.length)} logged</span>
              </div>
              <StatusDonut done={done} onTime={onTime} overdue={overdue} />
              <Legend
                items={[
                  { label: `Done ${pct(done)}%`, tone: "done" },
                  { label: `Open, on time ${pct(onTime)}%`, tone: "open" },
                  { label: `Overdue ${pct(overdue)}%`, tone: "over" },
                ]}
              />
            </section>

            <section className="fm-card">
              <div className="fm-card__head">
                <h3>Work orders by category</h3>
                <Field
                  inline
                  label="Location"
                  value={location}
                  onChange={setLocation}
                  options={[{ value: "", label: "All Locations" }, ...opts(LOCATIONS)]}
                />
              </div>
              <CategoryChart rows={categories} />
              <Legend
                items={[
                  { label: "Done", tone: "done" },
                  { label: "Open, on time", tone: "open" },
                  { label: "Overdue", tone: "over" },
                ]}
              />
            </section>

            <section className="fm-card">
              <div className="fm-card__head">
                <h3>Logged vs completed by month</h3>
                <span className="wo-note">Completed = done, of orders logged that month</span>
              </div>
              <MonthlyChart orders={orders} start={start} end={end} />
              <Legend
                items={[
                  { label: "Logged", tone: "over", line: "solid" },
                  { label: "Completed", tone: "done", line: "dash" },
                ]}
              />
            </section>

            <section className="fm-card">
              <div className="fm-card__head">
                <h3>Completion rate by category</h3>
                <span className="wo-note">Done of logged</span>
              </div>
              <CompletionChart rows={categories} />
            </section>
          </div>
        </>
      )}
    </div>
  );
}
