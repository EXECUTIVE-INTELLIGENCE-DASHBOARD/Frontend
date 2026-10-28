import { useMemo, useState } from "react";

import type { DrillDimension, IntakeFigure } from "./admissionsEnrollment.data";
import type { CohortRow } from "./admissionsEnrollment.types";
import {
  classLabelFor,
  formatNumber,
  formatPercent,
  intakeBySchool,
  schoolShortNameFor,
} from "./admissionsEnrollment.data";

import "./SchoolIntakePanel.css";

/**
 * The two entry points a secondary school takes learners at. Enrolment into
 * S.2, S.3, S.4 and S.6 is continuation, not intake, so those classes are not
 * offered here.
 */
const stages = [
  { id: "s1", label: "S.1" },
  { id: "s5", label: "S.5" },
] as const;

type StageId = (typeof stages)[number]["id"];

interface SchoolIntakePanelProps {
  rows: CohortRow[];
  onDrill: (dimension: DrillDimension, value: string) => void;
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
 * for the intake's gender split, boarding and day, age, nationality, faith and
 * school of origin. Every campus keeps a row, so a campus that does not admit
 * the selected class shows a dash rather than vanishing. Rows stay drillable so
 * the class and stream levels remain reachable.
 */
export function SchoolIntakePanel({ rows, onDrill }: SchoolIntakePanelProps) {
  const [stage, setStage] = useState<StageId>("s1");

  const intake = useMemo(() => intakeBySchool(rows, stage), [rows, stage]);
  const label = classLabelFor(stage);
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
          <p className="ae-block__sub">
            Who joins in {label}, and where they come from
          </p>
          <p className="ae-block__note">
            Age, nationality, faith and school of origin are modelled sample
            data — the API does not report them yet. A dash means the campus
            does not admit {label}.
          </p>
        </div>
        <span className="ae-chip">{formatNumber(inView)} in view</span>
      </div>

      <div className="ae-intake__stage" role="group" aria-label="Intake class">
        {stages.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`ae-intake__stage-option${
              option.id === stage ? " is-active" : ""
            }`}
            aria-pressed={option.id === stage}
            onClick={() => setStage(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="ae-table-wrap">
        <table className="ae-table ae-table--intake">
          <caption className="ae-sr-only">
            {label} enrolment by school, with gender, boarding, day, age,
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
            {intake.map((row) => (
              <tr key={row.schoolId} className="ae-intake__row">
                <th scope="row">
                  <button
                    type="button"
                    className="ae-intake__school"
                    aria-label={
                      row.learners === 0
                        ? `${row.schoolName}, no ${label} intake. Drill down`
                        : `${row.schoolName}, ${row.learners} ${label} learners. Drill down`
                    }
                    onClick={() => onDrill("school", row.schoolId)}
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

      <p className="ae-block__foot">
        Select a school to drill into its classes and streams.
      </p>
    </section>
  );
}
