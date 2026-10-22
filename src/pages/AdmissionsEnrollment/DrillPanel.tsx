import { ChevronRight } from "lucide-react";

import type {
  DrillDimension,
  EnrolmentGroup,
  RosterLearner,
} from "./admissionsEnrollment.data";
import { formatNumber, formatPercent } from "./admissionsEnrollment.data";

interface DrillPanelProps {
  dimension: DrillDimension | "learners";
  groups: EnrolmentGroup[];
  learners: RosterLearner[];
  heading: string;
  sub: string;
  total: number;
  onDrill: (dimension: DrillDimension, value: string) => void;
  onOpenLearner: (learner: RosterLearner) => void;
}

const MAX_ROWS = 60;

export function DrillPanel({
  dimension,
  groups,
  learners,
  heading,
  sub,
  total,
  onDrill,
  onOpenLearner,
}: DrillPanelProps) {
  const max = groups.reduce((peak, group) => Math.max(peak, group.learners), 0);
  const visible = learners.slice(0, MAX_ROWS);

  return (
    <section className="ae-block ae-block--flush" aria-labelledby="ae-drill-heading">
      <div className="ae-block__head">
        <div>
          <h2 className="ae-block__title" id="ae-drill-heading">
            {heading}
          </h2>
          <p className="ae-block__sub">{sub}</p>
        </div>
        <span className="ae-chip">{formatNumber(total)} in view</span>
      </div>

      {dimension === "learners" ? (
        learners.length === 0 ? (
          <p className="ae-empty">No learner matches the current search.</p>
        ) : (
          <>
            <div className="ae-table-wrap ae-table-wrap--roster">
              <table className="ae-table ae-table--roster">
                <caption className="ae-sr-only">
                  Learners in the selected class and stream
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Learner</th>
                    <th scope="col">Admission no.</th>
                    <th scope="col">Gender</th>
                    <th scope="col" className="ae-num">
                      Age
                    </th>
                    <th scope="col">Attendance mode</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((learner) => (
                    <tr
                      key={`${learner.id}-${learner.name}`}
                      className="ae-table__row--action"
                      tabIndex={0}
                      onClick={() => onOpenLearner(learner)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onOpenLearner(learner);
                        }
                      }}
                    >
                      <th scope="row">{learner.name}</th>
                      <td className="ae-muted">{learner.id}</td>
                      <td>{learner.gender}</td>
                      <td className="ae-num">{learner.age}</td>
                      <td>{learner.mode}</td>
                      <td>
                        <span
                          className={`ae-pill ae-pill--${
                            learner.status === "New" ? "positive" : "neutral"
                          }`}
                        >
                          {learner.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="ae-block__foot">
              {learners.length > MAX_ROWS
                ? `Showing the first ${MAX_ROWS} of ${formatNumber(learners.length)} learners · `
                : `${formatNumber(learners.length)} learners · `}
              Select a row to open the learner record.
            </p>
          </>
        )
      ) : (
        <>
          <div className="ae-groups">
            {groups.map((group) => {
              const width = max === 0 ? 0 : (group.learners / max) * 100;
              const girlsShare =
                group.learners === 0 ? 0 : (group.girls / group.learners) * 100;

              return (
                <button
                  key={group.key}
                  type="button"
                  className="ae-group"
                  onClick={() => onDrill(dimension, group.key)}
                  aria-label={`${group.label}, ${group.learners} learners. Drill down`}
                >
                  <span className="ae-group__name">
                    <span className="ae-group__label">{group.label}</span>
                    <span className="ae-group__meta">
                      {formatNumber(group.newLearners)} new ·{" "}
                      {formatPercent(group.retentionRate)} retained
                    </span>
                  </span>

                  <span className="ae-group__track">
                    <span
                      className="ae-group__bar"
                      style={{ width: `${Math.max(width, 6)}%` }}
                    >
                      <span
                        className="ae-group__seg ae-group__seg--girls"
                        style={{ width: `${girlsShare}%` }}
                      />
                      <span className="ae-group__seg ae-group__seg--boys" />
                    </span>
                  </span>

                  <span className="ae-group__count">
                    {formatNumber(group.learners)}
                  </span>

                  <ChevronRight
                    size={15}
                    aria-hidden="true"
                    className="ae-group__chev"
                  />
                </button>
              );
            })}
          </div>

          <div className="ae-legend">
            <span className="ae-legend__item">
              <span className="ae-swatch ae-swatch--navy" aria-hidden="true" />
              Girls
            </span>
            <span className="ae-legend__item">
              <span className="ae-swatch ae-swatch--sky" aria-hidden="true" />
              Boys
            </span>
            <span className="ae-legend__hint">
              Select a bar to drill into the next level.
            </span>
          </div>
        </>
      )}
    </section>
  );
}
