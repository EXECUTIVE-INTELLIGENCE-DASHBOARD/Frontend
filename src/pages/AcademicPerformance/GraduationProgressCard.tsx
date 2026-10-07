import { graduationRows } from "./academicPerformance.data";

export function GraduationProgressCard() {
  return (
    <section className="ap-card">
      <div className="ap-card__header">
        <h2 className="ap-card__title">
          Graduation &amp; Completion Progress
        </h2>
      </div>

      <div className="ap-table-wrap">
        <table className="ap-table">
          <thead>
            <tr>
              <th scope="col">Cohort</th>
              <th scope="col">Completed</th>
              <th scope="col">Eligible</th>
              <th scope="col">Term 2</th>
              <th scope="col">Term 3</th>
            </tr>
          </thead>

          <tbody>
            {graduationRows.map((row) => (
              <tr key={row.id}>
                <td className="ap-table__strong">{row.cohort}</td>
                <td>{row.completed}</td>
                <td>{row.eligible}</td>
                <td>
                  <span className="ap-progress">
                    <span
                      className="ap-progress__track"
                      role="progressbar"
                      aria-label={`${row.cohort} Term 2 completion`}
                      aria-valuenow={row.term2}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <span
                        className="ap-progress__fill"
                        style={{ width: `${row.term2}%` }}
                      />
                    </span>
                    <span className="ap-progress__value">
                      {row.term2.toFixed(1)}%
                    </span>
                  </span>
                </td>
                <td>
                  <span className="ap-progress">
                    <span
                      className="ap-progress__track"
                      role="progressbar"
                      aria-label={`${row.cohort} Term 3 completion`}
                      aria-valuenow={row.term3}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <span
                        className="ap-progress__fill ap-progress__fill--accent"
                        style={{ width: `${row.term3}%` }}
                      />
                    </span>
                    <span className="ap-progress__value">
                      {row.term3.toFixed(1)}%
                    </span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
