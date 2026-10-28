import { Landmark, Wallet } from "lucide-react";

import {
  formatLiabilityCurrency,
  type LoanSummary,
} from "../../pages/Liabilities/liabilitiesDashboard";
import "./LiabilityLoans.css";
import "./LiabilityTables.css";

interface LiabilityLoansProps {
  loans: LoanSummary[];
}

function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function LiabilityLoans({ loans }: LiabilityLoansProps) {
  const totalBorrowed = loans.reduce((total, loan) => total + loan.borrowed, 0);
  const totalPaid = loans.reduce((total, loan) => total + loan.paid, 0);
  const totalBalance = loans.reduce((total, loan) => total + loan.balance, 0);
  const totalInstallment = loans.reduce(
    (total, loan) => total + loan.nextInstallment,
    0,
  );

  return (
    <section className="liability-loans" aria-labelledby="liability-loans-title">
      <div className="liability-loans__header">
        <div>
          <div className="liability-loans__heading">
            <Landmark size={19} aria-hidden="true" />
            <h2 id="liability-loans-title">Loans</h2>
          </div>
          {loans[0] && (
            <p>
              {loans.length === 1
                ? `${loans[0].creditor} · ${loans[0].interestRate}% per year`
                : `${loans.length} active loan accounts`}
            </p>
          )}
        </div>
        <div className="liability-loans__balance">
          <Wallet size={17} aria-hidden="true" />
          <span>Outstanding balance</span>
          <strong>{formatLiabilityCurrency(totalBalance)}</strong>
        </div>
      </div>

      <div className="liability-management__table-wrap">
        <table className="liability-management__table">
          <thead>
            <tr>
              <th scope="col">School / loan</th>
              <th scope="col">Borrowed</th>
              <th scope="col">Paid</th>
              <th scope="col">Balance</th>
              <th scope="col">Next installment</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td>
                  <strong>{loan.school}</strong>
                  <small>
                    {loan.reference} · {loan.creditor}
                  </small>
                </td>
                <td>{formatLiabilityCurrency(loan.borrowed)}</td>
                <td>{formatLiabilityCurrency(loan.paid)}</td>
                <td>{formatLiabilityCurrency(loan.balance)}</td>
                <td>
                  {formatLiabilityCurrency(loan.nextInstallment)}
                  <small>{formatDate(loan.nextDue)}</small>
                </td>
              </tr>
            ))}
            {loans.length === 0 && (
              <tr>
                <td colSpan={5} className="liability-management__empty">
                  No active loan records for this selection.
                </td>
              </tr>
            )}
            {loans.length > 0 && (
              <tr className="liability-management__total-row">
                <th scope="row">Total</th>
                <td>{formatLiabilityCurrency(totalBorrowed)}</td>
                <td>{formatLiabilityCurrency(totalPaid)}</td>
                <td>{formatLiabilityCurrency(totalBalance)}</td>
                <td>{formatLiabilityCurrency(totalInstallment)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
