import { CreditCard, CalendarDays, TriangleAlert } from "lucide-react";

import "./LiabilitiesSummary.css";

const liabilityMetrics = [
  {
    title: "TOTAL LIABILITIES",
    amount: "UGX 142.5M",
    description: "Total outstanding liabilities",
    icon: CreditCard,
    className: "liability-metric--total",
  },
  {
    title: "DUE IN NEXT 30 DAYS",
    amount: "UGX 94.2M",
    description: "Liabilities due within 30 days",
    icon: CalendarDays,
    className: "liability-metric--due",
  },
  {
    title: "OVERDUE PAYABLES",
    amount: "UGX 12.3M",
    description: "Outstanding payments past their due date",
    icon: TriangleAlert,
    className: "liability-metric--overdue",
  },
];

export function LiabilitiesSummary() {
  return (
    <section className="liabilities-summary" aria-label="Liabilities summary">
      {liabilityMetrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <article
            className={`liability-metric ${metric.className}`}
            key={metric.title}
          >
            <p className="liability-metric__title">{metric.title}</p>

            <div className="liability-metric__body">
              <span className="liability-metric__icon">
                <Icon size={23} strokeWidth={2} aria-hidden="true" />
              </span>

              <h2 className="liability-metric__amount">{metric.amount}</h2>
            </div>

            <p className="sr-only">{metric.description}</p>
          </article>
        );
      })}
    </section>
  );
}
