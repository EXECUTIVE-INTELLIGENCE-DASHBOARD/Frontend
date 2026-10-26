import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  Download,
  MoreHorizontal,
  Repeat,
  RotateCcw,
  Search,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { buildCsv, csvFileName, downloadCsv } from "../../lib/csv";
import { AcademicFilters } from "../../components/filters/AcademicFilters";
import type { AcademicFilterValues } from "../../components/filters/academicFilters.types";
import { AdmissionsFunnel } from "./AdmissionsFunnel";
import { KpiCard } from "./DashboardUi";
import { DrillPanel } from "./DrillPanel";
import { LearnerDrawer } from "./LearnerDrawer";
import { ProfilePanel } from "./ProfilePanel";
import type { DrillDimension, RosterLearner } from "./admissionsEnrollment.data";
import {
  aggregate,
  averageAcrossSchools,
  campusForValue,
  classBreakdown,
  classLabelFor,
  classOptionsFor,
  defaultFilters,
  filteredRows,
  formatNumber,
  formatPercent,
  groupRows,
  learnerRoster,
  levelLabels,
  schoolCount,
  schoolNameFor,
  streams,
  yearIdForValue,
} from "./admissionsEnrollment.data";
import {
  aggregateFromDashboard,
  backendSchoolIdFor,
  useEnrollmentDashboard,
  type AcademicDashboardFilters,
} from "./admissionsEnrollment.api";
import type {
  Filters,
  LevelId,
  SchoolSelection,
} from "./admissionsEnrollment.types";

import "./AdmissionsEnrollment.css";

const levels: LevelId[] = ["nursery", "primary", "olevel", "alevel"];

const dimensionCopy: Record<DrillDimension, { heading: string; sub: string }> = {
  school: {
    heading: "Enrolment by school",
    sub: "Select a school bar to see how its classes are enrolled",
  },
  class: {
    heading: "Enrolment by class",
    sub: "Select a class bar to see how its streams are enrolled",
  },
  stream: {
    heading: "Enrolment by stream",
    sub: "Select a stream bar to list every learner in it",
  },
};

export function AdmissionsEnrollment() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [openLearner, setOpenLearner] = useState<RosterLearner | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  // The shared row is controlled, so the page holds its raw backend values.
  const [filterValues, setFilterValues] = useState<AcademicFilterValues>({
    school: "",
    campus: "",
    section: "",
    term: "",
    year: "",
  });
  const actionsRef = useRef<HTMLDivElement | null>(null);

  // The quick actions menu closes on an outside click or Escape, like a native menu.
  useEffect(() => {
    if (!actionsOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!actionsRef.current?.contains(event.target as Node)) {
        setActionsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [actionsOpen]);

  const rows = useMemo(() => filteredRows(filters), [filters]);
  const totals = useMemo(() => aggregate(rows), [rows]);

  const isAllSchools = filters.school === "all";

  // The API understands its own numeric school ids, not the dashboard slugs,
  // so translate first. An unmapped slug means "no filter", never "zero".
  const liveFilters = useMemo<AcademicDashboardFilters>(() => {
    if (isAllSchools) {
      return {};
    }

    const schoolId = backendSchoolIdFor(filters.school);

    return schoolId === undefined ? {} : { school: schoolId };
  }, [isAllSchools, filters.school]);

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

  const availableClasses = useMemo(
    () => classOptionsFor(filters.school),
    [filters.school],
  );

  const isLeaf =
    filters.school !== "all" &&
    filters.classId !== "all" &&
    filters.stream !== "all";

  const query = filters.student.trim();
  const searchMode = query.length >= 2;

  const roster = useMemo(
    () => (isLeaf || searchMode ? learnerRoster(rows, filters.year) : []),
    [isLeaf, searchMode, rows, filters.year],
  );

  const matches = useMemo(() => {
    if (!searchMode) {
      return roster;
    }

    const needle = query.toLowerCase();

    return roster.filter(
      (learner) =>
        learner.name.toLowerCase().includes(needle) ||
        learner.id.toLowerCase().includes(needle),
    );
  }, [query, roster, searchMode]);

  const dimension: DrillDimension | "learners" =
    searchMode || isLeaf
      ? "learners"
      : filters.school === "all"
        ? "school"
        : filters.classId === "all"
          ? "class"
          : "stream";

  const groups = useMemo(
    () => (dimension === "learners" ? [] : groupRows(rows, dimension)),
    [dimension, rows],
  );

  const update = (patch: Partial<Filters>) =>
    setFilters((current) => ({ ...current, ...patch }));

  // The shared row reports backend values; translate them into this page's own
  // shape. An unanswered year keeps whatever was already selected.
  const handleFilterChange = (next: AcademicFilterValues) => {
    setFilterValues(next);

    const year = yearIdForValue(next.year);

    update({
      campus: campusForValue(next.campus),
      section: next.section,
      ...(year ? { year } : {}),
    });
  };

  const drill = (target: DrillDimension, value: string) => {
    if (target === "school") {
      const nextSchool = value as SchoolSelection;
      const keepsClass = classOptionsFor(nextSchool).some(
        (definition) => definition.id === filters.classId,
      );

      update({
        school: nextSchool,
        classId: keepsClass ? filters.classId : "all",
        stream: "all",
      });
      return;
    }

    if (target === "class") {
      update({ classId: value, stream: "all" });
      return;
    }

    update({ stream: value });
  };

  const clearTo = (level: DrillDimension) => {
    if (level === "school") {
      update({ school: "all", classId: "all", stream: "all" });
      return;
    }

    if (level === "class") {
      update({ classId: "all", stream: "all" });
      return;
    }

    update({ stream: "all" });
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setOpenLearner(null);
    setFilterValues({
      school: "",
      campus: "",
      section: "",
      term: "",
      year: "",
    });
  };

  const handleExport = () => {
    if (dimension === "learners") {
      const csv = buildCsv(
        [
          "Admission no.",
          "Learner",
          "Gender",
          "Age",
          "Attendance mode",
          "Status",
          "School",
          "Class",
          "Stream",
        ],
        matches.map((learner) => [
          learner.id,
          learner.name,
          learner.gender,
          learner.age,
          learner.mode,
          learner.status,
          learner.schoolName,
          learner.classLabel,
          learner.stream,
        ]),
      );

      downloadCsv(
        csvFileName(
          "learners",
          `${filters.school}-${filters.classId}-${filters.stream}-${filters.year.replace("/", "-")}`,
        ),
        csv,
      );
      return;
    }

    const csv = buildCsv(
      [
        "School",
        "Academic year",
        "Term",
        "Class",
        "Level",
        "Stream",
        "Learners",
        "Boys",
        "Girls",
        "Day",
        "Boarding",
        "New",
        "Continuing",
        "Withdrawals",
        "Retention %",
        "Applications",
        "Offers",
        "Accepted",
        "Reported",
      ],
      classBreakdown(rows).map((row) => [
        schoolNameFor(row.schoolId),
        filters.year,
        filters.term === "full" ? "Full year" : filters.term.toUpperCase(),
        row.classLabel,
        levelLabels[row.level],
        row.stream,
        row.learners,
        row.boys,
        row.girls,
        row.day,
        row.boarding,
        row.newLearners,
        row.continuing,
        row.withdrawn,
        row.retentionRate.toFixed(1),
        row.applicants,
        row.offered,
        row.accepted,
        row.reported,
      ]),
    );

    downloadCsv(
      csvFileName(
        "enrolment-admissions",
        `${filters.school}-${filters.year.replace("/", "-")}-${filters.term}`,
      ),
      csv,
    );
  };

  const trail: Array<{ label: string; target: DrillDimension }> = [
    { label: "All campuses", target: "school" },
  ];

  if (filters.school !== "all") {
    trail.push({ label: schoolNameFor(filters.school), target: "class" });
  }

  if (filters.school !== "all" && filters.classId !== "all") {
    trail.push({ label: classLabelFor(filters.classId), target: "stream" });
  }

  if (
    filters.school !== "all" &&
    filters.classId !== "all" &&
    filters.stream !== "all"
  ) {
    trail.push({ label: `Stream ${filters.stream}`, target: "stream" });
  }

  return (
    <div className="ae-page">
      <header className="ae-head">
        <div className="ae-head__text">
          <span className="ae-eyebrow">Academics</span>
        </div>

        <div className="ae-head__actions">
          <div className="ae-actions" ref={actionsRef}>
            <button
              type="button"
              className="ae-icon-button"
              aria-label="Quick actions"
              aria-haspopup="menu"
              aria-expanded={actionsOpen}
              onClick={() => setActionsOpen((open) => !open)}
            >
              <MoreHorizontal size={18} aria-hidden="true" />
            </button>

            {actionsOpen ? (
              <div className="ae-menu" role="menu" aria-label="Quick actions">
                <button
                  type="button"
                  role="menuitem"
                  className="ae-menu__item"
                  onClick={() => {
                    setActionsOpen(false);
                    handleExport();
                  }}
                  disabled={rows.length === 0}
                >
                  <Download size={14} aria-hidden="true" />
                  Export CSV
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="ae-menu__item"
                  onClick={() => {
                    setActionsOpen(false);
                    handleReset();
                  }}
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  Reset filters
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <section className="ae-filters" aria-label="Enrolment filters">
        <AcademicFilters values={filterValues} onChange={handleFilterChange} />

        {isAllSchools ? null : (
          <>
            <label className="ae-field ae-field--class">
              <span className="ae-field__label">Class</span>
              <span className="ae-select">
                <select
                  aria-label="Class"
                  value={filters.classId}
                  onChange={(event) =>
                    update({ classId: event.target.value, stream: "all" })
                  }
                >
                  <option value="all">All classes</option>
                  {levels.map((level) => {
                    const options = availableClasses.filter(
                      (definition) => definition.level === level,
                    );

                    if (options.length === 0) {
                      return null;
                    }

                    return (
                      <optgroup key={level} label={levelLabels[level]}>
                        {options.map((definition) => (
                          <option key={definition.id} value={definition.id}>
                            {definition.label}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </span>
            </label>

            <label className="ae-field ae-field--stream">
              <span className="ae-field__label">Stream</span>
              <span className="ae-select">
                <select
                  aria-label="Stream"
                  value={filters.stream}
                  onChange={(event) => update({ stream: event.target.value })}
                >
                  <option value="all">All streams</option>
                  {streams.map((stream) => (
                    <option key={stream} value={stream}>
                      Stream {stream}
                    </option>
                  ))}
                </select>
              </span>
            </label>

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
          </>
        )}
      </section>

      {filters.school === "all" ? null : (
        <div className="ae-trail-row">
          <nav className="ae-trail" aria-label="Drill-down path">
            {trail.map((step, index) => {
              const isLast = index === trail.length - 1;

              return (
                <span key={`${step.label}-${index}`} className="ae-trail__step">
                  {isLast ? (
                    <strong aria-current="page">{step.label}</strong>
                  ) : (
                    <button type="button" onClick={() => clearTo(step.target)}>
                      {step.label}
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
          label="Total students"
          value={isLive ? formatNumber(summary.learners) : "—"}
          detail={
            !isLive
              ? "Waiting on the API"
              : summary.girls + summary.boys === 0
                ? "Gender split not reported by the API"
                : `${formatNumber(summary.girls)} girls · ${formatNumber(summary.boys)} boys`
          }
          tone="navy"
        />
        <KpiCard
          icon={Building2}
          label="Capacity"
          value={isLive ? formatNumber(summary.capacity) : "—"}
          detail={
            isLive
              ? `${formatPercent(summary.utilization)} utilised`
              : "Waiting on the API"
          }
          tone="sky"
        />
        <KpiCard
          icon={UserPlus}
          label="New students"
          value="—"
          detail="Not reported by the API"
          tone="sky"
        />
        <KpiCard
          icon={Repeat}
          label="Returning"
          value="—"
          detail="Not reported by the API"
          tone="green"
        />
        <KpiCard
          icon={TrendingUp}
          label="Join rate"
          value={isLive ? formatPercent(summary.conversionRate) : "—"}
          detail={
            isLive
              ? `${formatNumber(summary.reported)} of ${formatNumber(
                  summary.applicants,
                )} applicants`
              : "Waiting on the API"
          }
          tone="amber"
        />
      </section>

      <div className="ae-workbench">
        <div className="ae-workbench__main">
          <DrillPanel
            dimension={dimension}
            groups={groups}
            learners={matches}
            heading={
              dimension === "learners"
                ? searchMode
                  ? "Learner matches"
                  : `${classLabelFor(filters.classId)} · Stream ${filters.stream}`
                : dimensionCopy[dimension].heading
            }
            sub={
              dimension === "learners"
                ? searchMode
                  ? "Search results across every cohort in the current filters"
                  : "Select a learner to open their admission record"
                : dimensionCopy[dimension].sub
            }
            total={dimension === "learners" ? matches.length : totals.learners}
            onDrill={drill}
            onOpenLearner={setOpenLearner}
            note="Class, stream and learner records are not on the API yet — this list is sample data."
          />

          <ProfilePanel
            summary={summary}
            sub={
              isAllSchools
                ? `Average of the ${schoolCount} schools · ${formatNumber(
                    totals.learners,
                  )} learners in total`
                : undefined
            }
          />
        </div>

        <AdmissionsFunnel summary={summary} live={isLive} />
      </div>

      <LearnerDrawer
        learner={openLearner}
        onClose={() => setOpenLearner(null)}
      />
    </div>
  );
}
