import { Banknote, CreditCard, TriangleAlert, Wallet } from "lucide-react";

import {
  formatLiabilityCurrency,
  type LiabilityMetric,
} from "../../pages/Liabilities/liabilitiesDashboard";
import "./LiabilitiesSummary.css";

interface LiabilitiesSummaryProps {
  metrics: LiabilityMetric[];
}

const metricPresentation = {
  total: { icon: CreditCard, className: "liability-metric--total" },
  overdue: { icon: TriangleAlert, className: "liability-metric--overdue" },
  loan: { icon: Banknote, className: "liability-metric--loan" },
  cash: { icon: Wallet, className: "liability-metric--cash" },
} as const;

export function LiabilitiesSummary({ metrics }: LiabilitiesSummaryProps) {
  return (
    <section className="liabilities-summary" aria-label="Liabilities summary">
      {metrics.map((metric) => {
        const { icon: Icon, className } = metricPresentation[metric.kind];

        return (
          <article
            className={`liability-metric ${className}`}
            key={metric.kind}
          >
            <span className="liability-metric__icon">
              <Icon size={20} strokeWidth={2} aria-hidden="true" />
            </span>
            <div className="liability-metric__body">
              <p className="liability-metric__title">{metric.label}</p>
              <h2 className="liability-metric__amount">
                {formatLiabilityCurrency(metric.amount)}
              </h2>
            </div>
          </article>
        );
      })}
    </section>
  );
}
