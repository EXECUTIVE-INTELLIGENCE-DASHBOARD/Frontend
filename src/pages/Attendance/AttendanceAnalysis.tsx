import { useEffect, useMemo, useRef, useState } from "react";
import { ClassBarChart, ResultsChart, WeeklyChart } from "./AttendanceCharts";
import {
  CAMPUSES, SECTIONS, STREAMS, SUBJECTS, TERMS, YEARS,
  classesFor, groupByClass, summarise, weeklyAttendance, weeklyResults,
} from "./attendance.data";
import { useAttendance } from "./attendance.hooks";
import type { AttendanceFilters, AttendanceRow, Section } from "./attendance.types";
import "./AttendanceAnalysis.css";

const f1 = (n: number) => n.toFixed(1);
const fn = (n: number) => n.toLocaleString("en-US");

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  inline?: boolean;
}

function Field({ label, value, onChange, options, inline }: FieldProps) {
  const id = `at-${label.toLowerCase().replace(/\s+/g, "-")}${inline ? "-in" : ""}`;
  return (
    <div className={inline ? "at-field at-field--inline" : "at-field"}>
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

const opts = (xs: string[]) => xs.map((x) => ({ value: x, label: x }));

function Status({ row }: { row: AttendanceRow }) {
  const low = row.rate < row.target;
  return <span className={low ? "at-chip" : "at-chip at-chip--ok"}>{low ? "▼ Below target" : "✔ On target"}</span>;
}

function Kpi({ icon, label, value, detail }: { icon: string; label: string; value: string; detail: string }) {
  return (
    <div className="at-kpi">
      <span className="at-kpi__icon" aria-hidden="true">{icon}</span>
      <p className="at-kpi__label">{label}</p>
      <p className="at-kpi__value">{value}</p>
      <p className="at-kpi__detail">{detail}</p>
    </div>
  );
}

export default function AttendanceAnalysis() {
  const [filters, setFilters] = useState<AttendanceFilters>({ campus: CAMPUSES[0], section: "", term: 3, year: YEARS[0] });
  const [cls, setCls] = useState("");
  const [stream, setStream] = useState("");
  const [wkClass, setWkClass] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [showAll, setShowAll] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const { rows: allRows, loading, error } = useAttendance(filters);
  const classes = useMemo(() => classesFor(filters.campus, filters.section), [filters.campus, filters.section]);
  const classOptions = useMemo(() => [{ value: "", label: "All Classes" }, ...classes.map((c) => ({ value: c, label: c }))], [classes]);
  const rows = useMemo(() => allRows.filter((r) => (!cls || r.cls === cls) && (!stream || r.stream === stream)), [allRows, cls, stream]);
  const totals = useMemo(() => summarise(rows), [rows]);
  const groups = useMemo(() => groupByClass(rows), [rows]);
  const worst = useMemo(() => [...rows].sort((a, b) => a.rate - a.target - (b.rate - b.target)), [rows]);
  const weekly = useMemo(() => weeklyAttendance(allRows, wkClass), [allRows, wkClass]);
  const results = useMemo(() => weeklyResults(filters, subject, cls, stream, totals.rate), [filters, subject, cls, stream, totals.rate]);

  const update = (patch: Partial<AttendanceFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    if (patch.campus !== undefined || patch.section !== undefined) {
      setCls("");
      setWkClass("");
    }
  };

  useEffect(() => {
    if (!showAll) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowAll(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAll]);

  const classStream = (
    <>
      <Field inline label="Class" value={cls} onChange={setCls} options={classOptions} />
      <Field inline label="Stream" value={stream} onChange={setStream} options={[{ value: "", label: "All Streams" }, ...opts(STREAMS)]} />
    </>
  );

  return (
    <div className="at-page">
      <section className="at-filters" aria-label="Filters">
        <Field label="Campus" value={filters.campus} onChange={(v) => update({ campus: v })} options={opts(CAMPUSES)} />
        <Field label="Section" value={filters.section} onChange={(v) => update({ section: v as Section })} options={SECTIONS} />
        <Field label="Term" value={String(filters.term)} onChange={(v) => update({ term: Number(v) })} options={TERMS.map((t) => ({ value: String(t.value), label: t.label }))} />
        <Field label="Academic Year" value={filters.year} onChange={(v) => update({ year: v })} options={opts(YEARS)} />
      </section>

      {error && <p role="alert" className="at-state">{error}</p>}
      {loading && <p className="at-state" aria-live="polite">Loading…</p>}

      {!loading && !error && (
        <>
          <div className="at-kpis">
            <Kpi icon="%" label="Attendance Rate" value={`${f1(totals.rate)}%`} detail={`Across ${fn(totals.learners)} learners`} />
            <Kpi icon="✔" label="Learner-Days Present" value={fn(totals.present)} detail={`Over ${rows[0]?.days ?? 0} school days`} />
            <Kpi icon="✕" label="Learner-Days Absent" value={fn(totals.absent)} detail={`${f1(100 - totals.rate)}% of learner-days`} />
            <Kpi icon="!" label="Below Target" value={`${totals.below} of ${rows.length}`} detail="Classes and streams" />
          </div>

          <div className="at-grid">
            <section className="at-card">
              <div className="at-card__head"><h3>Attendance by Class</h3><span className="at-muted">{fn(totals.learners)} learners</span></div>
              <ClassBarChart groups={groups} onSelect={(c) => setCls((cur) => (cur === c ? "" : c))} />
              <div className="at-key">
                <span><i className="at-key__sw at-key__sw--ok" />On target</span>
                <span><i className="at-key__sw at-key__sw--low" />Below target</span>
                <span><i className="at-key__sw at-key__sw--goal" />Target</span>
              </div>
            </section>

            <section className="at-card">
              <div className="at-card__head"><h3>Actual vs Target</h3><div className="at-inline">{classStream}</div></div>
              <div className="at-scroll">
                <table className="at-table">
                  <thead><tr><th>Class</th><th>Stream</th><th>Actual</th><th>Target</th><th>Status</th></tr></thead>
                  <tbody>
                    {worst.slice(0, 5).map((r) => (
                      <tr key={r.cls + r.stream} className={r.rate < r.target ? "at-row--low" : ""}>
                        <td>{r.cls}</td><td>{r.stream}</td><td className="at-strong">{f1(r.rate)}%</td><td>{r.target}%</td><td><Status row={r} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" className="at-btn" onClick={() => setShowAll(true)}>View all ({rows.length})</button>
            </section>
          </div>

          <div className="at-grid">
            <section className="at-card">
              <div className="at-card__head"><h3>Weekly Attendance</h3><div className="at-inline"><Field inline label="Class" value={wkClass} onChange={setWkClass} options={classOptions} /></div></div>
              {weekly && <WeeklyChart points={weekly.points} target={weekly.target} />}
              <div className="at-key"><span><i className="at-key__sw at-key__sw--navy" />Attendance</span><span><i className="at-key__sw at-key__sw--goal" />Target</span></div>
            </section>

            <section className="at-card">
              <div className="at-card__head"><h3>Attendance and Average Score</h3><div className="at-inline"><Field inline label="Subject" value={subject} onChange={setSubject} options={opts(SUBJECTS)} /></div></div>
              <ResultsChart data={results} />
              <div className="at-key"><span><i className="at-key__sw at-key__sw--ok" />Attendance %</span><span><i className="at-key__sw at-key__sw--low" />Average score %</span></div>
            </section>
          </div>
        </>
      )}

      {showAll && (
        <div className="at-modal" onClick={() => setShowAll(false)}>
          <div className="at-modal__panel" role="dialog" aria-modal="true" aria-label="Actual vs Target" onClick={(e) => e.stopPropagation()}>
            <div className="at-card__head"><h3>Actual vs Target</h3><button ref={closeRef} type="button" className="at-modal__close" aria-label="Close" onClick={() => setShowAll(false)}>✕</button></div>
            <div className="at-scroll">
              <table className="at-table">
                <thead><tr><th>Class</th><th>Stream</th><th>Learners</th><th>Present</th><th>Absent</th><th>Actual</th><th>Target</th><th>Status</th></tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.cls + r.stream} className={r.rate < r.target ? "at-row--low" : ""}>
                      <td>{r.cls}</td><td>{r.stream}</td><td>{r.learners}</td><td>{fn(r.present)}</td><td>{fn(r.absent)}</td>
                      <td className="at-strong">{f1(r.rate)}%</td><td>{r.target}%</td><td><Status row={r} /></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr><td colSpan={2}>Total</td><td>{totals.learners}</td><td>{fn(totals.present)}</td><td>{fn(totals.absent)}</td><td>{f1(totals.rate)}%</td><td colSpan={2} /></tr></tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
