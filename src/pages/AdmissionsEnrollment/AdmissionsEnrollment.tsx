import { useMemo, useState } from "react";
import {
  Building2,
  Search,
  TrendingUp,
  Users,
  Target,
  X,
} from "lucide-react";
import { AcademicFilters } from "../../components/filters/AcademicFilters";
import type { AcademicFilterValues } from "../../components/filters/academicFilters.types";
import { AdmissionsFunnel } from "./AdmissionsFunnel";
import { EnrollmentTrends } from "./EnrollmentTrends";
import { KpiCard } from "./DashboardUi";
import { DrillPanel } from "./DrillPanel";
import { SchoolIntakePanel } from "./SchoolIntakePanel";
import { LearnerDrawer } from "./LearnerDrawer";
import type { RosterLearner } from "./admissionsEnrollment.data";
import {
  aggregate,
  averageAcrossSchools,
  campusForValue,
  defaultFilters,
  filteredRows,
  formatNumber,
  formatPercent,
  learnerRoster,
  schoolNameFor,
  yearIdForValue,
} from "./admissionsEnrollment.data";
import {
  aggregateFromDashboard,
  backendSchoolIdFor,
  useEnrollmentDashboard,
  type AcademicDashboardFilters,
} from "./admissionsEnrollment.api";
import type { Filters, SchoolSelection } from "./admissionsEnrollment.types";

import "./AdmissionsEnrollment.css";

export function AdmissionsEnrollment() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [openLearner, setOpenLearner] = useState<RosterLearner | null>(null);
  // The shared row is controlled, so the page holds its raw backend values.
  const [filterValues, setFilterValues] = useState<AcademicFilterValues>({
    school: "",
    campus: "",
    section: "",
    term: "",
    year: "",
  });

  const rows = useMemo(() => filteredRows(filters), [filters]);
  const totals = useMemo(() => aggregate(rows), [rows]);

  // The intake table carries its own S.1 / S.5 switch, so the class and stream
  // filters must not narrow it: picking S.2 would leave every row empty even
  // though the S.1 and S.5 figures are still wanted beside the drill-down.
  const intakeRows = useMemo(
    () => filteredRows({ ...filters, classId: "all", stream: "all" }),
    [filters],
  );

  const isAllSchools = filters.school === "all";

  // Campus and term are backend values from the shared filter row. School
  // drill-down uses a local slug, so translate it to the API's numeric id.
  const liveFilters = useMemo<AcademicDashboardFilters>(() => {
    const schoolId = backendSchoolIdFor(filters.school);
    const term = Number(filterValues.term);

    return {
      ...(filterValues.campus ? { campus: filterValues.campus } : {}),
      ...(Number.isInteger(term) && term > 0 ? { term } : {}),
      ...(schoolId === undefined ? {} : { school: schoolId }),
    };
  }, [filters.school, filterValues.campus, filterValues.term]);

  const live = useEnrollmentDashboard(liveFilters);
  const isLive = live.data !== null;

  // Board members looking at the whole group see the mean of the six campuses.
  // The moment they pick a school every figure comes from that school alone.
  // These seeded rows are now only the fallback: live figures win whenever the
  // endpoint answers, and the fallback covers an offline backend.
  const seededSummary = useMemo(
    () => (isAllSchools ? averageAcrossSchools(filters) : totals),
    [isAllSchools, filters, totals],
  );

  const summary = useMemo(
    () => (live.data ? aggregateFromDashboard(live.data) : seededSummary),
    [live.data, seededSummary],
  );

  const query = filters.student.trim();
  const searchMode = query.length >= 2;

  // Class and stream are narrowed by the pickers on the enrolment table, so the
  // page's own list is only ever the learner search result.
  const matches = useMemo(() => {
    if (!searchMode) {
      return [];
    }

    const needle = query.toLowerCase();

    return learnerRoster(rows, filters.year).filter(
      (learner) =>
        learner.name.toLowerCase().includes(needle) ||
        learner.id.toLowerCase().includes(needle),
    );
  }, [query, rows, searchMode, filters.year]);

  const update = (patch: Partial<Filters>) =>
    setFilters((current) => ({ ...current, ...patch }));

  // The shared row reports backend values; translate them into this page's own
  // shape. An unanswered year keeps whatever was already selected.
  const handleFilterChange = (next: AcademicFilterValues) => {
    const scopeChanged =
      next.campus !== filterValues.campus ||
      next.section !== filterValues.section;

    setFilterValues(next);

    const year = yearIdForValue(next.year);

    update({
      campus: campusForValue(next.campus),
      section: next.section,
      ...(scopeChanged ? { school: "all", classId: "all", stream: "all" } : {}),
      ...(year ? { year } : {}),
    });
  };

  // A school is picked from the table itself, which then offers that campus's
  // classes and streams, so the page only ever moves at campus level.
  const selectSchool = (schoolId: string) => {
    update({
      school: schoolId as SchoolSelection,
      classId: "all",
      stream: "all",
    });
  };

  const clearSchool = () => {
    update({ school: "all", classId: "all", stream: "all" });
  };

  const trail: string[] = ["All campuses"];

  if (filters.school !== "all") {
    trail.push(schoolNameFor(filters.school));
  }
  return (
    <div className="ae-page">
      <section className="ae-filters" aria-label="Enrolment filters">
        <AcademicFilters values={filterValues} onChange={handleFilterChange} />

        {isAllSchools ? null : (
          <label className="ae-field ae-field--grow">
            <span className="ae-field__label">Find a learner</span>

            <span className="ae-search">
              <Search size={15} aria-hidden="true" />

              <input
                type="search"
                aria-label="Find a learner"
                value={filters.student}
                placeholder="Name or admission number"
                onChange={(event) => update({ student: event.target.value })}
              />

              {filters.student.length > 0 ? (
                <button
                  type="button"
                  className="ae-search__clear"
                  onClick={() => update({ student: "" })}
                  aria-label="Clear learner filter"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              ) : null}
            </span>
          </label>
        )}
      </section>

      {filters.school === "all" ? null : (
        <div className="ae-trail-row">
          <nav className="ae-trail" aria-label="Drill-down path">
            {trail.map((step, index) => {
              const isLast = index === trail.length - 1;

              return (
                <span key={`${step}-${index}`} className="ae-trail__step">
                  {isLast ? (
                    <strong aria-current="page">{step}</strong>
                  ) : (
                    <button type="button" onClick={clearSchool}>
                      {step}
                    </button>
                  )}

                  {isLast ? null : (
                    <span className="ae-trail__sep" aria-hidden="true">
                      /
                    </span>
                  )}
                </span>
              );
            })}
          </nav>
        </div>
      )}

      {searchMode ? (
        <div className="ae-student-banner" role="status">
          <p>
            Searching every learner in scope for <strong>“{query}”</strong> —{" "}
            {formatNumber(matches.length)} match
            {matches.length === 1 ? "" : "es"}.
          </p>

          <button
            type="button"
            className="ae-button ae-button--ghost"
            onClick={() => update({ student: "" })}
          >
            Clear
          </button>
        </div>
      ) : null}

      {live.error ? (
        <p className="ae-empty" role="alert">
          Live enrolment data unavailable ({live.error}). Every figure stays at
          “—” until the endpoint answers.
        </p>
      ) : null}

      <section className="ae-kpis" aria-label="Enrolment summary">

  <KpiCard
    icon={Users}
    label="Total Students"
    value={isLive ? formatNumber(summary.learners) : "—"}
    detail={
      isLive
        ? "Active enrolment reported by the API"
        : "Waiting on confirmed enrolment data"
    }
    tone="navy"
  />

  <KpiCard
    icon={Building2}
    label="School Capacity"
    value={isLive ? formatNumber(summary.capacity) : "—"}
    detail="Maximum school capacity"
    tone="sky"
  />

  <KpiCard
    icon={Target}
    label="Minimum Enrolment"
    value="—"
    detail="Awaiting minimum figures from Finance"
    tone="amber"
  />

  <KpiCard
    icon={TrendingUp}
    label="Capacity Utilisation"
    value={isLive ? formatPercent(summary.utilization) : "—"}
    detail="Percentage of school capacity occupied"
    tone="sky"
  />

</section>

      <div className="ae-analysis-row">
        <EnrollmentTrends filters={filters} />
        <AdmissionsFunnel summary={summary} live={isLive} />
      </div>

      
        <SchoolIntakePanel
        rows={intakeRows}
        school={filters.school}
        onSelect={selectSchool}
      />

      

      {searchMode ? (
        <DrillPanel
          learners={matches}
          heading="Learner matches"
          total={matches.length}
          onOpenLearner={setOpenLearner}
        />
      ) : null}

      <LearnerDrawer
        learner={openLearner}
        onClose={() => setOpenLearner(null)}
      />
    </div>
  );
}
