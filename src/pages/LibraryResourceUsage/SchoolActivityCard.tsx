import {
  schoolActivityFootnote,
  schoolActivityNote,
  schoolActivityRows,
} from "./libraryResourceUsage.data";

export function SchoolActivityCard() {
  return (
    <section className="lr-card">
      <div className="lr-card__header">
        <h2 className="lr-card__title">Activity by School &amp; Period</h2>
      </div>

      <p className="lr-card__note">{schoolActivityNote}</p>

      <div className="lr-table-wrap">
        <table className="lr-table">
          <thead>
            <tr>
              <th scope="col">School</th>
              <th scope="col">Checkouts</th>
              <th scope="col">Returns</th>
              <th scope="col">Net</th>
            </tr>
          </thead>

          <tbody>
            {schoolActivityRows.map((row) => (
              <tr
                key={row.id}
                className={
                  row.id === "total" ? "lr-table__row--total" : undefined
                }
              >
                <td className="lr-table__strong">{row.school}</td>
                <td>{row.checkouts}</td>
                <td>{row.returns}</td>
                <td className="lr-table__strong">{row.net}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="lr-card__footnote">{schoolActivityFootnote}</p>
    </section>
  );
}
