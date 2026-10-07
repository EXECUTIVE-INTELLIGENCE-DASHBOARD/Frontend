import { attentionFootnote, attentionNote, attentionRows } from "./studentEnrollment.data";

export function AttentionCard() {
  return (
    <section className="se-card">
      <div className="se-card__header">
        <h2 className="se-card__title">
          Enrollment Changes Requiring Attention
        </h2>
      </div>

      <p className="se-card__note">{attentionNote}</p>

      <div className="se-table-wrap">
        <table className="se-table se-table--wide">
          <thead>
            <tr>
              <th scope="col">Area</th>
              <th scope="col">Change</th>
              <th scope="col">Suggested follow-up</th>
              <th scope="col">Owner</th>
              <th scope="col">Status</th>
            </tr>
          </thead>

          <tbody>
            {attentionRows.map((row) => (
              <tr key={row.id}>
                <td className="se-table__strong">{row.area}</td>
                <td className="se-table__muted">{row.change}</td>
                <td className="se-table__muted">{row.followUp}</td>
                <td className="se-table__muted">{row.owner}</td>
                <td>
                  <span className={`se-status se-status--${row.tone}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="se-card__footnote">{attentionFootnote}</p>
    </section>
  );
}
