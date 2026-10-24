import { DonutChart } from "../../components/DonutChart";
import type { WithdrawalReason } from "../../api/academics.api";
import { dash, formatMetric } from "./studentRetention.data";

/**
 * The backend ships its own reasons and counts, so there is no local weight
 * table any more. Anything it does not report is drawn as an em dash rather than
 * a made-up slice.
 */
const COLORS = ["#0B2E75", "#2AA4DD", "#F1BA1B", "#4B6FAE", "#8FA8D3"];

interface ReasonsCardProps {
  reasons: WithdrawalReason[];
  /** `withdrawals_total` from the API, or `null` when it is missing. */
  total: number | null;
}

export function GenderRetentionCard({ reasons, total }: ReasonsCardProps) {
  const reported = reasons.filter((reason) => (reason.count ?? 0) > 0);

  const sum = reported.reduce((figure, reason) => figure + reason.count, 0);
  const denominator = total && total > 0 ? total : sum;

  const segments = reported.map((reason, index) => ({
    id: reason.reason,
    value: reason.count,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <section className="sr-card sr-gender">
      <div className="sr-card__header">
        <h2 className="sr-card__title">Reasons for Withdrawal</h2>
      </div>

      <div className="sr-gender__body">
        <div className="sr-gender__chart">
          {segments.length === 0 ? (
            <p className="sr-dash sr-dash--chart" title="Not reported by the API">
              {dash}
            </p>
          ) : (
            <DonutChart
              segments={segments}
              centerValue={formatMetric(denominator)}
              centerLabel="Total Withdrawals"
              ariaLabel="Student withdrawals by reason"
              size={150}
              thickness={20}
            />
          )}
        </div>

        <div className="sr-withdrawal__details">
          {segments.length === 0 ? (
            <p className="sr-dash" title="Not reported by the API">
              Withdrawal reasons are not reported by the API.
            </p>
          ) : (
            <ul className="sr-gender__list">
              {reported.map((reason, index) => {
                const color = COLORS[index % COLORS.length];
                const share =
                  reason.share ??
                  (denominator === 0 ? 0 : (reason.count / denominator) * 100);

                return (
                  <li key={reason.reason} className="sr-withdrawal__item">
                    <span
                      className="sr-gender__dot"
                      style={{ background: color }}
                      aria-hidden="true"
                    />

                    <span className="sr-gender__label">{reason.label}</span>

                    <span className="sr-gender__count">
                      {formatMetric(reason.count)}
                    </span>

                    <span
                      className="sr-pill"
                      style={{
                        color,
                        backgroundColor: `${color}20`,
                      }}
                    >
                      {share.toFixed(1)}%
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
