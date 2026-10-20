import { DonutChart } from "../../components/DonutChart";
import { formatNumber } from "./studentRetention.data";

const COLORS = {
  financial: "#0B2E75",
  transfer: "#1685E8",
  death: "#F5B51B",
  academic: "#4B6FAE",
} as const;

const withdrawalReasons = [
  {
    id: "financial",
    label: "Financial Constraints",
    value: 44,
    color: COLORS.financial,
  },
  {
    id: "transfer",
    label: "Transfer to Another School",
    value: 34,
    color: COLORS.transfer,
  },
  {
    id: "death",
    label: "Death",
    value: 23,
    color: COLORS.death,
  },
  {
    id: "academic",
    label: "Academic Performance",
    value: 23,
    color: COLORS.academic,
  },
] as const;

const totalWithdrawals = withdrawalReasons.reduce(
  (total, reason) => total + reason.value,
  0,
);

export function GenderRetentionCard() {
  return (
    <section className="sr-card sr-gender">
      <div className="sr-card__header">
        <h2 className="sr-card__title">
          Reasons for Withdrawal
        </h2>
      </div>

      <div className="sr-gender__body">
        <div className="sr-gender__chart">
          <DonutChart
            segments={withdrawalReasons.map((reason) => ({
              id: reason.id,
              value: reason.value,
              color: reason.color,
            }))}
            centerValue={formatNumber(totalWithdrawals)}
            centerLabel="Total Withdrawals"
            ariaLabel="Student withdrawals by reason"
            size={150}
            thickness={20}
          />
        </div>

        <div className="sr-withdrawal__details">
          <ul className="sr-gender__list">
            {withdrawalReasons.map((reason) => {
              const percentage = (
                (reason.value / totalWithdrawals) *
                100
              ).toFixed(1);

              return (
                <li
                  key={reason.id}
                  className="sr-withdrawal__item"
                >
                  <span
                    className="sr-gender__dot"
                    style={{ background: reason.color }}
                    aria-hidden="true"
                  />

                  <span className="sr-gender__label">
                    {reason.label}
                  </span>

                  <span className="sr-gender__count">
                    {formatNumber(reason.value)}
                  </span>

                  <span
                    className="sr-pill"
                    style={{
                      color: reason.color,
                      backgroundColor: `${reason.color}20`,
                    }}
                  >
                    {percentage}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}