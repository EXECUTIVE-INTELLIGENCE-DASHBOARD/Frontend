import { titleRows, titlesFootnote, titlesNote } from "./libraryResourceUsage.data";

export function TitleRequestsCard() {
  return (
    <section className="lr-card">
      <div className="lr-card__header">
        <h2 className="lr-card__title">
          Frequently Requested &amp; Under-used Titles
        </h2>
      </div>

      <p className="lr-card__note">{titlesNote}</p>

      <div className="lr-table-wrap">
        <table className="lr-table lr-table--titles">
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Copies</th>
              <th scope="col">Available</th>
              <th scope="col">Borrowed / reserved</th>
              <th scope="col">Waiting requests</th>
              <th scope="col">Usage &amp; planning signal</th>
            </tr>
          </thead>

          <tbody>
            {titleRows.map((row) => (
              <tr key={row.id}>
                <td className="lr-table__strong">{row.title}</td>
                <td>{row.copies}</td>
                <td>{row.available}</td>
                <td>{row.borrowedReserved}</td>
                <td className="lr-table__strong">{row.waiting}</td>
                <td>
                  <span className={`lr-signal lr-signal--${row.tone}`}>
                    {row.signal}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="lr-card__footnote">{titlesFootnote}</p>
    </section>
  );
}
