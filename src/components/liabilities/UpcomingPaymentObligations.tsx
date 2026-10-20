
import { CalendarClock } from "lucide-react";
import type { CampusOption } from "../filters/CampusFilter";
import "./UpcomingPaymentObligations.css";

interface UpcomingPaymentObligationsProps {
  campus?: CampusOption;
}

interface PaymentObligation {
  id: number;
  creditor: string;
  reference: string;
  dueDate: string;
  amount: number;
  campus: Exclude<CampusOption, "All Campuses">;
  status: "Due soon" | "Scheduled";
}

const sampleObligations: PaymentObligation[] = [
  {
    id: 1,
    creditor: "School Supplies Supplier",
    reference: "PAY-2026-041",
    dueDate: "2026-11-03",
    amount: 18.5,
    campus: "Kibuli Main Campus",
    status: "Due soon",
  },
  {
    id: 2,
    creditor: "Utilities Provider",
    reference: "PAY-2026-042",
    dueDate: "2026-11-07",
    amount: 8.2,
    campus: "Buwaate Campus",
    status: "Due soon",
  },
  {
    id: 3,
    creditor: "Catering Services",
    reference: "PAY-2026-043",
    dueDate: "2026-11-12",
    amount: 22.0,
    campus: "Annex / Preschool Branch",
    status: "Scheduled",
  },
  {
    id: 4,
    creditor: "Facilities and Maintenance",
    reference: "PAY-2026-044",
    dueDate: "2026-11-18",
    amount: 14.7,
    campus: "Kibuli Main Campus",
    status: "Scheduled",
  },
  {
    id: 5,
    creditor: "Learning Materials Supplier",
    reference: "PAY-2026-045",
    dueDate: "2026-11-24",
    amount: 9.6,
    campus: "Buwaate Campus",
    status: "Scheduled",
  },
];

const formatAmount = (amount: number) =>
  `UGX ${amount.toLocaleString("en-UG", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}M`;

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Kampala",
  }).format(new Date(`${date}T12:00:00+03:00`));

export function UpcomingPaymentObligations({
  campus = "All Campuses",
}: UpcomingPaymentObligationsProps) {
  const obligations =
    campus === "All Campuses"
      ? sampleObligations
      : sampleObligations.filter((item) => item.campus === campus);

  const total = obligations.reduce((sum, item) => sum + item.amount, 0);

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
            <h2 id="upcoming-obligations-title">
              Upcoming Payment Obligations
            </h2>
            <p>Payments scheduled for the coming weeks.</p>
          </div>
        </div>

        <div className="upcoming-obligations__total">
          <span>Listed obligations</span>
          <strong>{formatAmount(total)}</strong>
        </div>
      </div>

      <div className="upcoming-obligations__table-wrap">
        <table className="upcoming-obligations__table">
          <thead>
            <tr>
              <th scope="col">Creditor / Supplier</th>
              <th scope="col">Campus</th>
              <th scope="col">Due date</th>
              <th scope="col">Amount</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {obligations.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="upcoming-obligations__creditor">
                    {item.creditor}
                  </span>
                  <span className="upcoming-obligations__reference">
                    {item.reference}
                  </span>
                </td>
                <td>{item.campus}</td>
                <td>{formatDate(item.dueDate)}</td>
                <td className="upcoming-obligations__amount">
                  {formatAmount(item.amount)}
                </td>
                <td>
                  <span
                    className={`upcoming-obligations__status ${
                      item.status === "Due soon"
                        ? "upcoming-obligations__status--soon"
                        : "upcoming-obligations__status--scheduled"
                    }`}
                  >
                    <span />
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
            {obligations.length === 0 && (
              <tr>
                <td colSpan={5} className="upcoming-obligations__empty">
                  No sample payment obligations are listed for this campus.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="upcoming-obligations__note">
        Sample data for interface demonstration. Confirm amounts and due dates
        against approved finance records before making payment decisions.
      </p>
    </section>
  );
}
