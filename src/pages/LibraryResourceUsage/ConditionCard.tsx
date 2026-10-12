import { conditionFootnote, conditionNote, conditionRows } from "./libraryResourceUsage.data";

export function ConditionCard() {
  return (
    <section className="lr-card">
      <div className="lr-card__header">
        <h2 className="lr-card__title">Overdue, Lost &amp; Damaged Resources</h2>
      </div>

      <p className="lr-card__note">{conditionNote}</p>

      <div className="lr-table-wrap">
        <table className="lr-table lr-table--conditions">
          <thead>
            <tr>
              <th scope="col">Condition</th>
              <th scope="col">Items</th>
              <th scope="col">Action / owner</th>
              <th scope="col">Status</th>
            </tr>
          </thead>

          <tbody>
            {conditionRows.map((row) => (
              <tr
                key={row.id}
                className={
                  row.id === "overdue-total" ? "lr-table__row--total" : undefined
                }
              >
                <td className="lr-table__strong">{row.condition}</td>
                <td className="lr-table__strong">{row.items}</td>
                <td className="lr-table__muted">{row.action}</td>
                <td>
                  {row.status ? (
                    <span className={`lr-status lr-status--${row.tone}`}>
                      {row.status}
                    </span>
                  ) : (
                    <span className="lr-table__muted" aria-hidden="true">
                      —
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="lr-card__footnote">{conditionFootnote}</p>
    </section>
  );
}
