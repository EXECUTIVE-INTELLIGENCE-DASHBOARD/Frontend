import type { RosterLearner } from "./admissionsEnrollment.data";
import { formatNumber } from "./admissionsEnrollment.data";

interface DrillPanelProps {
  learners: RosterLearner[];
  heading: string;
  total: number;
  onOpenLearner: (learner: RosterLearner) => void;
}

const MAX_ROWS = 60;

/**
 * The learner search result. Class and stream are narrowed by the pickers on
 * the enrolment table itself, so this panel only ever lists learners.
 */
export function DrillPanel({
  learners,
  heading,
  total,
  onOpenLearner,
}: DrillPanelProps) {
  const visible = learners.slice(0, MAX_ROWS);

  return (
    <section className="ae-block ae-block--flush" aria-labelledby="ae-drill-heading">
      <div className="ae-block__head">
        <div>
          <h2 className="ae-block__title" id="ae-drill-heading">
            {heading}
          </h2>
        </div>
        <span className="ae-chip">{formatNumber(total)} in view</span>
      </div>

      {learners.length === 0 ? (
        <p className="ae-empty">No learner matches the current search.</p>
      ) : (
        <>
          <div className="ae-table-wrap ae-table-wrap--roster">
            <table className="ae-table ae-table--roster">
              <caption className="ae-sr-only">
                Learners matching the search
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

          {learners.length > MAX_ROWS ? (
            <p className="ae-block__foot">
              {`Showing the first ${MAX_ROWS} of ${formatNumber(
                learners.length,
              )} learners`}
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
