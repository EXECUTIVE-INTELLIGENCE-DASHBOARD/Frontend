import { CalendarClock } from "lucide-react";

import {
  formatLiabilityCurrency,
  type StatutoryPayment,
} from "../../pages/Liabilities/liabilitiesDashboard";
import "./UpcomingPaymentObligations.css";

interface UpcomingPaymentObligationsProps {
  payments: StatutoryPayment[];
  total: number;
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));

function statusClass(status: string): string {
  switch (status) {
    case "Overdue":
      return "upcoming-obligations__status--overdue";
    case "Paid":
      return "upcoming-obligations__status--paid";
    case "Paid late":
      return "upcoming-obligations__status--late";
    default:
      return "upcoming-obligations__status--scheduled";
  }
}

export function UpcomingPaymentObligations({
  payments,
  total,
}: UpcomingPaymentObligationsProps) {
  return (
    <section
      className="upcoming-obligations"
      aria-labelledby="upcoming-obligations-title"
    >
      <div className="upcoming-obligations__header">
        <div className="upcoming-obligations__title">
          <span className="upcoming-obligations__icon">
            <CalendarClock size={19} aria-hidden="true" />
          </span>
          <div>
            <h2 id="upcoming-obligations-title">Tax and statutory payments</h2>
            <p>Payment records and due dates from the liability register.</p>
          </div>
        </div>
        <div className="upcoming-obligations__total">
          <span>Outstanding statutory balance</span>
          <strong>{formatLiabilityCurrency(total)}</strong>
        </div>
      </div>

      <div className="upcoming-obligations__table-wrap">
        <table className="upcoming-obligations__table">
          <thead>
            <tr>
              <th scope="col">Payment</th>
              <th scope="col">Period</th>
              <th scope="col">Due date</th>
              <th scope="col">Amount</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>
                  <span className="upcoming-obligations__creditor">
                    {payment.creditor}
                  </span>
                  <span className="upcoming-obligations__reference">
                    {payment.reference}
                  </span>
                </td>
                <td>{payment.period}</td>
                <td>{formatDate(payment.dueDate)}</td>
                <td className="upcoming-obligations__amount">
                  {formatLiabilityCurrency(payment.amount)}
                </td>
                <td>
                  <span
                    className={`upcoming-obligations__status ${statusClass(
                      payment.status,
                    )}`}
                  >
                    <span />
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={5} className="upcoming-obligations__empty">
                  No statutory payment records for this selection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
