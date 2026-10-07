import { capacityNote, capacityRows } from "./studentEnrollment.data";

export function CapacityPlanningCard() {
  return (
    <section className="se-card">
      <div className="se-card__header">
        <h2 className="se-card__title">Capacity &amp; Resource Planning</h2>
      </div>

      <p className="se-card__note">{capacityNote}</p>

      <div className="se-table-wrap">
        <table className="se-table se-table--wide">
          <thead>
            <tr>
              <th scope="col">Student group</th>
              <th scope="col">Enrolled</th>
              <th scope="col">Capacity</th>
              <th scope="col">Places left</th>
              <th scope="col">Utilization</th>
              <th scope="col">Resource planning / owner</th>
            </tr>
          </thead>

          <tbody>
            {capacityRows.map((row) => (
              <tr
                key={row.id}
                className={row.id === "all" ? "se-table__row--total" : undefined}
              >
                <td className="se-table__strong">{row.group}</td>
                <td className="se-table__strong">{row.enrolled}</td>
                <td>{row.capacity}</td>
                <td>{row.placesLeft}</td>
                <td>{row.utilization}</td>
                <td className="se-table__muted">{row.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
