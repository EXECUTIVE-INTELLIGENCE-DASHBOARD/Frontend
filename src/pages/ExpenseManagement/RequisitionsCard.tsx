/**
 * "High-Value Requisitions Pending Approval" card — the detail table behind
 * the "Pending Expense Approvals" KPI.
 *
 * Each row is money already committed but not yet signed off, so these amounts
 * are a subset of the page's total spend rather than an addition to it. Rows
 * arrive largest-first from the data module.
 */
import { formatUgx, pendingRequisitions } from "./expenseManagement.data";

export function RequisitionsCard() {
  return (
    <section className="exp-card">
      <div className="exp-card__header">
        <h2 className="exp-card__title">
          High-Value Requisitions Pending Approval
        </h2>
      </div>

      {/* Wrapper scrolls horizontally on narrow screens so the columns can
          keep their widths instead of wrapping into an unreadable mess. */}
      <div className="exp-table-wrap">
        <table className="exp-table">
          <thead>
            <tr>
              <th scope="col">Requisition ID</th>
              <th scope="col">Item / Vendor Description</th>
              <th scope="col">Amount</th>
              <th scope="col">Campus</th>
              <th scope="col">Approval Status</th>
            </tr>
          </thead>

          <tbody>
            {pendingRequisitions.map((requisition) => (
              <tr key={requisition.id}>
                <td>
                  <span className="exp-table__name">{requisition.code}</span>
                </td>

                <td>
                  {/* The only cell allowed to wrap — see `.exp-table__item`. */}
                  <span className="exp-table__item">
                    {requisition.description}
                  </span>
                </td>

                <td>
                  <span className="exp-table__amount">
                    {formatUgx(requisition.amount)}
                  </span>
                </td>

                <td>
                  <span className="exp-table__campus">
                    {requisition.campus}
                  </span>
                </td>

                <td>
                  {/* Pill tone comes from the data, so a new status only needs
                      one entry in `pendingRequisitions`. */}
                  <span
                    className={`exp-pill exp-pill--${requisition.tone}`}
                  >
                    {requisition.status}
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
