import { useEffect, useMemo, useState } from "react";

import { shortSchoolName } from "../lib/finance.format";
import {
  getSchoolFees,
  getSchools,
  getStartedTerms,
  type SchoolFeeRow,
  type SchoolFeesDashboard,
  type SchoolOption,
  type TermOption,
} from "./schoolFees/schoolFees.api";
import {
  DayVsBoarding,
  FeeSummary,
  PayingVsEnrolled,
  RevenueBreakdown,
} from "./schoolFees/SchoolFeeCards";

import "./Revenue.css";

/**
 * Revenue: school fees per school, or per class when one school is chosen.
 * Day-only schools (the nurseries and GIS) show no boarding figures at all.
 */
export function Revenue() {
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [terms, setTerms] = useState<TermOption[]>([]);
  const [school, setSchool] = useState("");
  const [term, setTerm] = useState("");
  const [data, setData] = useState<SchoolFeesDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getSchools().then(setSchools).catch(() => setSchools([]));
    getStartedTerms().then(setTerms).catch(() => setTerms([]));
  }, []);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(false);

    getSchoolFees({ school: Number(school) || undefined, term: Number(term) || undefined })
      .then((result) => live && setData(result))
      .catch(() => live && setError(true))
      .finally(() => live && setLoading(false));

    return () => {
      live = false;
    };
  }, [school, term]);

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
            <span>Term</span>
            <select aria-label="Term" value={term} onChange={(e) => setTerm(e.target.value)}>
              <option value="">Current term</option>
              {terms.map((option) => (
                <option key={option.id} value={option.id}>
                  Term {option.number} · {option.academic_year}
                </option>
              ))}
            </select>
          </label>
        </section>
      </header>

      {loading && <p className="revenue-page__state">Loading school fees…</p>}
      {!loading && error && (
        <p className="revenue-page__state">The finance server could not be reached.</p>
      )}
      {!loading && !error && empty && (
        <p className="revenue-page__state">No learners are enrolled for this selection.</p>
      )}

      {!loading && !error && shown && !empty && (
        <>
          <FeeSummary
            data={shown}
            schoolLabel={shown.school ? rowLabel({ ...shown.summary, ...shown.school }) : undefined}
          />
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
