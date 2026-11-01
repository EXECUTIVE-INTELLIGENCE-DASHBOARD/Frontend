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
 * This year's terms that have started, one per term number, newest first. A term is
 * billed to the learners enrolled in it, so a term's fees always sit beside its own
 * enrolment. A second record for the same term (as SMIS once created for Term 1, with
 * its own academic-year label) is left out: the year's own label wins.
 */
export function thisYearsTerms(terms: TermOption[], year = new Date().getFullYear()): TermOption[] {
  const ofYear = terms.filter((term) => term.start_date.startsWith(String(year)));
  const preferred = [...ofYear].sort((a, b) =>
    Number(b.academic_year === String(year)) - Number(a.academic_year === String(year)));
  const byNumber = new Map<number, TermOption>();
  for (const term of preferred) if (!byNumber.has(term.number)) byNumber.set(term.number, term);
  return [...byNumber.values()].sort((a, b) => b.start_date.localeCompare(a.start_date));
}

/**
 * Revenue: school fees per school, or per class when one school is chosen, for one term
 * (the current term unless another is picked), beside that term's enrolment.
 * Day-only schools (the nurseries and GIS) show no boarding figures at all.
 */
export function Revenue() {
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [terms, setTerms] = useState<TermOption[]>([]);
  const [school, setSchool] = useState("");
  // "" is the current term; the server picks it, so the first load needs no term list.
  const [term, setTerm] = useState("");
  const [data, setData] = useState<SchoolFeesDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getSchools().then(setSchools).catch(() => setSchools([]));
    getStartedTerms().then((all) => setTerms(thisYearsTerms(all))).catch(() => setTerms([]));
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
              {terms.length === 0 && <option value="">Current term</option>}
              {terms.map((option, index) => (
                // the newest term is the current one: "" lets the server pick it
                <option key={option.id} value={index === 0 ? "" : option.id}>
                  Term {option.number}
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
