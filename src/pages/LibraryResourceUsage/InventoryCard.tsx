import { inventoryFootnote, inventoryNote, inventoryRows } from "./libraryResourceUsage.data";

export function InventoryCard() {
  return (
    <section className="lr-card">
      <div className="lr-card__header">
        <h2 className="lr-card__title">Resource Availability &amp; Inventory</h2>
      </div>

      <p className="lr-card__note">{inventoryNote}</p>

      <div className="lr-table-wrap">
        <table className="lr-table lr-table--inventory">
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Available</th>
              <th scope="col">Borrowed</th>
              <th scope="col">Reserved</th>
              <th scope="col">Unavailable</th>
            </tr>
          </thead>

          <tbody>
            {inventoryRows.map((row) => (
              <tr
                key={row.id}
                className={
                  row.id === "total" ? "lr-table__row--total" : undefined
                }
              >
                <td className="lr-table__strong">{row.category}</td>
                <td className="lr-table__strong">{row.available}</td>
                <td>{row.borrowed}</td>
                <td>{row.reserved}</td>
                <td>{row.unavailable}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="lr-card__footnote">{inventoryFootnote}</p>
    </section>
  );
}
