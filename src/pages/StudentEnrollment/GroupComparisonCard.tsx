import { cohortNote, cohortRows, comparisonStats } from "./studentEnrollment.data";

export function GroupComparisonCard() {
  return (
    <section className="se-card">
      <div className="se-card__header">
        <h2 className="se-card__title">Student Group Comparison</h2>
      </div>

      <div className="se-card__body">
        <ul className="se-stats">
          {comparisonStats.map((stat) => (
            <li key={stat.id} className="se-stat">
              <span className="se-stat__label">{stat.label}</span>

              <span className="se-stat__value">
                {stat.value}
                {stat.note ? (
                  <span className="se-stat__note">{stat.note}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>

        <p className="se-section-label">Cohort Comparison</p>

        <div className="se-table-wrap">
          <table className="se-table">
            <thead>
              <tr>
                <th scope="col">Group</th>
                <th scope="col">Sciences</th>
                <th scope="col">Arts</th>
                <th scope="col">Total</th>
              </tr>
            </thead>

            <tbody>
              {cohortRows.map((row) => (
                <tr key={row.id}>
                  <td className="se-table__strong">{row.group}</td>
                  <td>{row.sciences}</td>
                  <td>{row.arts}</td>
                  <td className="se-table__strong">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="se-card__footnote">{cohortNote}</p>
    </section>
  );
}
