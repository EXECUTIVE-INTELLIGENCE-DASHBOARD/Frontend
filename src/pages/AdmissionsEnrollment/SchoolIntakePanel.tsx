import { useMemo, useState } from "react";

import type { IntakeFigure } from "./admissionsEnrollment.data";
import type {
  CohortRow,
  LevelId,
  SchoolSelection,
} from "./admissionsEnrollment.types";
import {
  classLabelFor,
  classOptionsFor,
  formatNumber,
  formatPercent,
  intakeBySchool,
  levelLabels,
  schoolShortNameFor,
  streams,
} from "./admissionsEnrollment.data";

import "./SchoolIntakePanel.css";

/** Class order inside the table's class picker. */
const levels: LevelId[] = ["nursery", "primary", "olevel", "alevel"];

interface SchoolIntakePanelProps {
  rows: CohortRow[];
  /** The campus currently chosen above the table; it scopes the class list. */
  school: SchoolSelection;
  onSelect: (schoolId: string) => void;
}

function MixCell({ figure }: { figure: IntakeFigure | null }) {
  if (!figure) {
    return <span className="ae-muted">—</span>;
  }

  return (
    <span className="ae-intake__mix">
      <span className="ae-intake__mix-label">{figure.label}</span>
      <span className="ae-intake__mix-share">{formatPercent(figure.share)}</span>
    </span>
  );
}

/** A campus that does not take the class reports no figures at all. */
function CountCell({ value }: { value: number }) {
  return (
    <td className="ae-num">
      {value === 0 ? <span className="ae-muted">—</span> : formatNumber(value)}
    </td>
  );
}

/**
 * "Enrolment by school" as a table: one row per campus in scope, with columns
 * for the gender split, boarding and day, age, nationality, faith and school
 * of origin. It opens on the whole-school roll, so every school's enrolment is
 * on screen before anything is drilled into. The class and stream pickers sit
 * on the table itself: choosing a class narrows both the columns and the rows,
 * so a campus that does not run S.1 or S.5 drops out of the table entirely.
 * A row picks its campus, which then rescopes the table's own pickers.
 */
export function SchoolIntakePanel({
  rows,
  school,
  onSelect,
}: SchoolIntakePanelProps) {
  const [classId, setClassId] = useState("all");
  const [stream, setStream] = useState("all");

  // Switching to a campus that does not run the chosen class falls back to the
  // whole roll rather than leaving a picker showing a class it cannot offer.
  const availableClasses = useMemo(() => classOptionsFor(school), [school]);
  const activeClass = availableClasses.some(
    (definition) => definition.id === classId,
  )
    ? classId
    : "all";

  const intake = useMemo(
    () => intakeBySchool(rows, activeClass, stream),
    [rows, activeClass, stream],
  );
  const label = activeClass === "all" ? "Total" : classLabelFor(activeClass);
  const scope = stream === "all" ? label : `${label}, Stream ${stream}`;
  const inView = intake.reduce((sum, row) => sum + row.learners, 0);

  return (
    <section
      className="ae-block ae-block--flush"
      aria-labelledby="ae-intake-heading"
    >
      <div className="ae-block__head">
        <div>
          <h2 className="ae-block__title" id="ae-intake-heading">
            Enrolment by school
          </h2>
        </div>
        <span className="ae-chip">{formatNumber(inView)} in view</span>
      </div>

      <div className="ae-intake__filters">
        <label className="ae-field ae-field--class">
          <span className="ae-field__label">Class</span>
          <span className="ae-select">
            <select
              aria-label="Class"
              value={activeClass}
              onChange={(event) => setClassId(event.target.value)}
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
              value={stream}
              onChange={(event) => setStream(event.target.value)}
            >
              <option value="all">All streams</option>
              {streams.map((option) => (
                <option key={option} value={option}>
                  Stream {option}
                </option>
              ))}
            </select>
          </span>
        </label>
      </div>

      <div className="ae-table-wrap">
        <table className="ae-table ae-table--intake">
          <caption className="ae-sr-only">
            {scope} enrolment by school, with gender, boarding, day, age,
            nationality, faith and school of origin
          </caption>
          <thead>
            <tr>
              <th scope="col">School</th>
              <th scope="col" className="ae-num">
                Girls
              </th>
              <th scope="col" className="ae-num">
                Boys
              </th>
              <th scope="col" className="ae-num">
                Boarding
              </th>
              <th scope="col" className="ae-num">
                Day
              </th>
              <th scope="col">Age</th>
              <th scope="col">Nationality</th>
              <th scope="col">Faith</th>
              <th scope="col">School of origin</th>
            </tr>
          </thead>
          <tbody>
            {intake.length === 0 ? (
              <tr>
                <td className="ae-muted" colSpan={9}>
                  No school in scope runs {label.toLowerCase()}.
                </td>
              </tr>
            ) : null}
            {intake.map((row) => (
              <tr key={row.schoolId} className="ae-intake__row">
                <th scope="row">
                  <button
                    type="button"
                    className="ae-intake__school"
                    aria-label={
                      row.learners === 0
                        ? `${row.schoolName}, no ${label} learners. Drill down`
                        : `${row.schoolName}, ${row.learners} ${label} learners. Drill down`
                    }
                    onClick={() => onSelect(row.schoolId)}
                  >
                    {schoolShortNameFor(row.schoolId)}
                  </button>
                </th>
                <CountCell value={row.girls} />
                <CountCell value={row.boys} />
                <CountCell value={row.boarding} />
                <CountCell value={row.day} />
                <td>
                  <MixCell figure={row.age} />
                </td>
                <td>
                  <MixCell figure={row.nationality} />
                </td>
                <td>
                  <MixCell figure={row.faith} />
                </td>
                <td
                  title={row.origins
                    .filter((origin) => origin.learners > 0)
                    .slice(0, 3)
                    .map(
                      (origin) =>
                        `${origin.label} · ${formatNumber(origin.learners)}`,
                    )
                    .join("\n")}
                >
                  <MixCell figure={row.origin} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
