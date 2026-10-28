import {
  formatLiabilityCurrency,
  type LiabilitiesDashboardModel,
} from "../../pages/Liabilities/liabilitiesDashboard";
import "./LiabilityManagementDetails.css";
import "./LiabilityTables.css";

interface LiabilityManagementDetailsProps {
  model: LiabilitiesDashboardModel;
}

export function LiabilityManagementDetails({
  model,
}: LiabilityManagementDetailsProps) {
  return (
    <div className="liability-management">
      <section
        className="liability-alerts"
        aria-labelledby="liability-alerts-title"
      >
        <h2 id="liability-alerts-title">Needs attention</h2>
        <div className="liability-alerts__list">
          {model.alerts.map((alert, index) => (
            <article
              className={`liability-alert liability-alert--${alert.tone}`}
              key={`${alert.schoolName ?? alert.message}-${index}`}
            >
              <span className="liability-alert__message">
                {alert.schoolName && (
                  <strong className="liability-alert__school">
                    {alert.schoolName}:
                  </strong>
                )}{" "}
                {alert.message}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section
        className="liability-school-balances"
        aria-labelledby="liability-school-balances-title"
      >
        <h2 id="liability-school-balances-title">Debtors and creditors</h2>
        <div className="liability-balance-cards">
          <article>
            <span>Creditors</span>
            <strong>
              {formatLiabilityCurrency(model.schoolTotals.weOwe)}
            </strong>
            <small>Unpaid bills and loan balances</small>
          </article>
          <article>
            <span>Debtors</span>
            <strong>
              {formatLiabilityCurrency(model.schoolTotals.owedToUs)}
            </strong>
            <small>Unpaid school fees</small>
          </article>
          <article>
            <span>Bank balance</span>
            <strong>
              {formatLiabilityCurrency(model.schoolTotals.bankBalance)}
            </strong>
            <small>
              Forecast {formatLiabilityCurrency(model.schoolTotals.forecast)}
            </small>
          </article>
        </div>

        <div className="liability-management__table-wrap">
          <table className="liability-management__table">
            <thead>
              <tr>
                <th scope="col">School</th>
                <th scope="col">Owed to us</th>
                <th scope="col">We owe</th>
              </tr>
            </thead>
            <tbody>
              {model.schoolBalances.map((school) => (
                <tr key={school.id ?? "group"}>
                  <td>{school.name}</td>
                  <td>{formatLiabilityCurrency(school.owedToUs)}</td>
                  <td>{formatLiabilityCurrency(school.weOwe)}</td>
                </tr>
              ))}
              {model.schoolBalances.length === 0 && (
                <tr>
                  <td colSpan={3} className="liability-management__empty">
                    No school balances are available.
                  </td>
                </tr>
              )}
              {model.schoolBalances.length > 0 && (
                <tr className="liability-management__total-row">
                  <th scope="row">Total</th>
                  <td>{formatLiabilityCurrency(model.schoolTotals.owedToUs)}</td>
                  <td>{formatLiabilityCurrency(model.schoolTotals.weOwe)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
