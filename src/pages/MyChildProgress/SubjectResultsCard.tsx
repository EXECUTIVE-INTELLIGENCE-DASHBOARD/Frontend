import {
  subjectNote,
  subjectRows,
  subjectSummary,
} from "./myChildProgress.data";

export function SubjectResultsCard() {
  return (
    <section className="mc-card">
      <div className="mc-card__header">
        <h2 className="mc-card__title">Subject Results &amp; Teacher Feedback</h2>
      </div>

      <div className="mc-card__body mc-card__body--flush">
        <div className="mc-table-wrap">
          <table className="mc-table mc-table--subjects">
            <thead>
              <tr>
                <th scope="col">Subject</th>
                <th scope="col">Term 1</th>
                <th scope="col">Term 2</th>
                <th scope="col">Term 3</th>
                <th scope="col">Progress</th>
                <th scope="col">Teacher feedback</th>
                <th scope="col">Follow-up</th>
              </tr>
            </thead>

            <tbody>
              {subjectRows.map((row) => (
                <tr key={row.id}>
                  <td className="mc-table__strong">{row.subject}</td>

                  <td>{row.term1}</td>

                  <td>{row.term2}</td>

                  <td>{row.term3}</td>

                  <td className="mc-table__strong">{row.progress}</td>

                  <td className="mc-table__muted">{row.feedback}</td>

                  <td>
                    <span className={`mc-status mc-status--${row.tone}`}>
                      {row.followUp}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mc-summary-row">{subjectSummary}</p>
      </div>

      <p className="mc-card__footnote">{subjectNote}</p>
    </section>
  );
}
