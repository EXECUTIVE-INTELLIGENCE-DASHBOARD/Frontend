import { useEffect, useMemo, useState } from "react";

import { shortSchoolName } from "../lib/finance.format";
import {
  getSchoolFees,
  getSchools,
  type SchoolFeeRow,
  type SchoolFeesDashboard,
  type SchoolOption,
} from "./schoolFees/schoolFees.api";
import {
  DayVsBoarding,
  FeeSummary,
  PayingVsEnrolled,
  RevenueBreakdown,
} from "./schoolFees/SchoolFeeCards";

import "./Revenue.css";

const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/**
 * Revenue: school fees per school, or per class when one school is chosen, for the terms
 * that start between From and To (1 January to today unless changed).
 * Day-only schools (the nurseries and GIS) show no boarding figures at all.
 */
export function Revenue() {
  const today = iso(new Date());
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [school, setSchool] = useState("");
  const [start, setStart] = useState(`${today.slice(0, 4)}-01-01`);
  const [end, setEnd] = useState(today);
  const [data, setData] = useState<SchoolFeesDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getSchools().then(setSchools).catch(() => setSchools([]));
  }, []);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(false);

    getSchoolFees({ school: Number(school) || undefined, start, end })
      .then((result) => live && setData(result))
      .catch(() => live && setError(true))
      .finally(() => live && setLoading(false));

    return () => {
      live = false;
    };
  }, [school, start, end]);

  const campusOf = useMemo(
    () => Object.fromEntries(schools.map((option) => [option.id, option.campus])),
    [schools],
  );
  const rowLabel = (row: SchoolFeeRow) =>
    row.id === null ? row.name : shortSchoolName(row.name, campusOf[row.id] ?? "");

  // schools in the same order as the School filter (Kibuli, Buwaate, GIS)
  const shown = useMemo(() => {
    if (!data || data.breakdown_by !== "school") return data;
    const position = new Map(schools.map((option, index) => [option.id, index]));
    const breakdown = [...data.breakdown].sort(
      (a, b) => (position.get(a.id ?? 0) ?? 99) - (position.get(b.id ?? 0) ?? 99),
    );
    return { ...data, breakdown };
  }, [data, schools]);

  const empty = shown !== null && shown.summary.enrolled === 0;

  return (
    <main className="revenue-page">
      <header className="revenue-page__header">
        <section className="revenue-page__filters" aria-label="Revenue filters">
          <label>
            <span>School</span>
            <select aria-label="School" value={school} onChange={(e) => setSchool(e.target.value)}>
              <option value="">All schools</option>
              {schools.map((option) => (
                <option key={option.id} value={option.id}>
                  {shortSchoolName(option.name, option.campus)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>From</span>
            <input type="date" aria-label="From" value={start} max={end}
              onChange={(e) => e.target.value && setStart(e.target.value)} />
          </label>
          <label>
            <span>To</span>
            <input type="date" aria-label="To" value={end} min={start} max={today}
              onChange={(e) => e.target.value && setEnd(e.target.value)} />
          </label>
        </section>
      </header>

      {loading && <p className="revenue-page__state">Loading school fees…</p>}
      {!loading && error && (
        <p className="revenue-page__state">The finance server could not be reached.</p>
      )}
      {!loading && !error && empty && (
        <p className="revenue-page__state">No term starts in these dates for this selection.</p>
      )}

      {!loading && !error && shown && !empty && (
        <>
          <FeeSummary data={shown} />
          <div className={`revenue-page__row${shown.has_boarding ? "" : " revenue-page__row--single"}`}>
            <RevenueBreakdown data={shown} label={rowLabel} />
            {shown.has_boarding && <DayVsBoarding data={shown} />}
          </div>
          <PayingVsEnrolled data={shown} label={rowLabel} />
        </>
      )}
    </main>
  );
}
