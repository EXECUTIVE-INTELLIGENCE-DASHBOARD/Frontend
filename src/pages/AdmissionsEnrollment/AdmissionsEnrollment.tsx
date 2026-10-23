import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
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
import { AdmissionsFunnel } from "./AdmissionsFunnel";
import { KpiCard } from "./DashboardUi";
import { DrillPanel } from "./DrillPanel";
import { LearnerDrawer } from "./LearnerDrawer";
import { ProfilePanel } from "./ProfilePanel";
import type { DrillDimension, RosterLearner } from "./admissionsEnrollment.data";
import {
  aggregate,
  averageAcrossSchools,
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
  previousYearFor,
  schoolCount,
  schoolNameFor,
  schools,
  streams,
  termOptions,
  years,
} from "./admissionsEnrollment.data";
import type {
  Filters,
  LevelId,
  SchoolSelection,
  TermId,
  YearId,
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

  // Board members looking at the whole group see the mean of the six campuses.
  // The moment they pick a school every figure comes from that school alone.
  const summary = useMemo(
    () => (isAllSchools ? averageAcrossSchools(filters) : totals),
    [isAllSchools, filters, totals],
  );

  const priorYear = previousYearFor(filters.year);
  const prior = useMemo(() => {
    if (!priorYear) {
      return null;
    }

    const previous: Filters = { ...filters, year: priorYear };

    return isAllSchools
      ? averageAcrossSchools(previous)
      : aggregate(filteredRows(previous));
  }, [filters, isAllSchools, priorYear]);

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

  const handleSchoolChange = (event: ChangeEvent<HTMLSelectElement>) => {
    update({
      school: event.target.value as Filters["school"],
      classId: "all",
      stream: "all",
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

  const delta = (current: number, previous: number | undefined) => {
    if (previous === undefined || previous <= 0) return undefined;
    const value = ((current - previous) / previous) * 100;
    if (Math.abs(value) < 0.05) return undefined;
    return { value, label: `vs AY ${priorYear}` };
  };

  const trail: Array<{ label: string; target: DrillDimension }> = [
    { label: "All schools", target: "school" },
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
          <h1 className="ae-head__title">Admissions &amp; enrolment</h1>
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

      <section
        className={`ae-filters${isAllSchools ? " ae-filters--board" : ""}`}
        aria-label="Enrolment filters"
      >
        <label className="ae-field ae-field--school">
          <span className="ae-field__label">School</span>
          <span className="ae-select">
            <select
              aria-label="School"
              value={filters.school}
              onChange={handleSchoolChange}
            >
              <option value="all">All schools</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </span>
        </label>

        {isAllSchools ? null : (
          <>
            <label className="ae-field ae-field--year">
              <span className="ae-field__label">Academic year</span>
              <span className="ae-select">
                <select
                  aria-label="Year"
                  value={filters.year}
                  onChange={(event) =>
                    update({ year: event.target.value as YearId })
                  }
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      AY {year}
                    </option>
                  ))}
                </select>
              </span>
            </label>

            <label className="ae-field ae-field--term">
              <span className="ae-field__label">Term</span>
              <span className="ae-select">
                <select
                  aria-label="Term"
                  value={filters.term}
                  onChange={(event) =>
                    update({ term: event.target.value as TermId })
                  }
                >
                  {termOptions.map((term) => (
                    <option key={term.id} value={term.id}>
                      {term.label}
                    </option>
                  ))}
                </select>
              </span>
            </label>

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

        <span className="ae-trail__hint">
          {dimension === "learners"
            ? "Each total traces down to a named learner"
            : "Filters and clicks narrow the same totals — use either"}
        </span>
      </div>

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

      <section className="ae-kpis" aria-label="Enrolment summary">
        <KpiCard
          icon={Users}
          label={isAllSchools ? "Average learners" : "Total learners"}
          value={formatNumber(summary.learners)}
          detail={`${formatNumber(summary.girls)} girls · ${formatNumber(summary.boys)} boys`}
          tone="navy"
          delta={delta(summary.learners, prior?.learners)}
        />
        <KpiCard
          icon={Building2}
          label={
            isAllSchools ? "Average opening enrolment" : "Opening enrolment"
          }
          value={formatNumber(summary.opening)}
          detail={`${formatPercent(summary.utilization)} of capacity`}
          tone="sky"
          delta={delta(summary.opening, prior?.opening)}
        />
        <KpiCard
          icon={UserPlus}
          label={isAllSchools ? "Average new learners" : "New learners"}
          value={formatNumber(summary.newLearners)}
          detail={`${formatPercent(
            summary.learners === 0
              ? 0
              : (summary.newLearners / summary.learners) * 100,
          )} of the roll`}
          tone="sky"
          delta={delta(summary.newLearners, prior?.newLearners)}
        />
        <KpiCard
          icon={Repeat}
          label={
            isAllSchools ? "Average continuing learners" : "Continuing learners"
          }
          value={formatNumber(summary.continuing)}
          detail={`${formatPercent(summary.retentionRate)} retention`}
          tone="green"
          delta={delta(summary.continuing, prior?.continuing)}
        />
        <KpiCard
          icon={TrendingUp}
          label="Apply → report"
          value={formatPercent(summary.conversionRate)}
          detail={`${formatNumber(summary.reported)} joined of ${formatNumber(
            summary.applicants,
          )}`}
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

        <AdmissionsFunnel summary={summary} />
      </div>

      <LearnerDrawer
        learner={openLearner}
        onClose={() => setOpenLearner(null)}
      />
    </div>
  );
}
