
import { CreditCard, CalendarDays, TriangleAlert } from "lucide-react";

import type { CampusOption } from "../filters/CampusFilter";

import "./LiabilitiesSummary.css";

interface LiabilitiesSummaryProps {
  campus?: CampusOption;
}

interface LiabilityMetric {
  title: string;
  amount: string;
  description: string;
  icon: typeof CreditCard;
  className: string;
}

const sampleMetrics: Record<string, LiabilityMetric[]> = {
  "All Campuses": [
    {
      title: "TOTAL LIABILITIES",
      amount: "UGX 142.5M",
      description: "Total outstanding liabilities across all campuses",
      icon: CreditCard,
      className: "liability-metric--total",
    },
    {
      title: "DUE IN NEXT 30 DAYS",
      amount: "UGX 94.2M",
      description: "Liabilities due within the next 30 days",
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
  ],
  Kibuli: [
    {
      title: "TOTAL LIABILITIES",
      amount: "UGX 62.5M",
      description: "Total outstanding liabilities for Kibuli",
      icon: CreditCard,
      className: "liability-metric--total",
    },
    {
      title: "DUE IN NEXT 30 DAYS",
      amount: "UGX 40.2M",
      description: "Liabilities due within 30 days for Kibuli",
      icon: CalendarDays,
      className: "liability-metric--due",
    },
    {
      title: "OVERDUE PAYABLES",
      amount: "UGX 5.3M",
      description: "Overdue payments for Kibuli",
      icon: TriangleAlert,
      className: "liability-metric--overdue",
    },
  ],
  Buwaate: [
    {
      title: "TOTAL LIABILITIES",
      amount: "UGX 31.0M",
      description: "Total outstanding liabilities for Buwaate",
      icon: CreditCard,
      className: "liability-metric--total",
    },
    {
      title: "DUE IN NEXT 30 DAYS",
      amount: "UGX 20.0M",
      description: "Liabilities due within 30 days for Buwaate",
      icon: CalendarDays,
      className: "liability-metric--due",
    },
    {
      title: "OVERDUE PAYABLES",
      amount: "UGX 2.0M",
      description: "Overdue payments for Buwaate",
      icon: TriangleAlert,
      className: "liability-metric--overdue",
    },
  ],
  "Kansanga International": [
    {
      title: "TOTAL LIABILITIES",
      amount: "UGX 49.0M",
      description: "Total outstanding liabilities for Kansanga International",
      icon: CreditCard,
      className: "liability-metric--total",
    },
    {
      title: "DUE IN NEXT 30 DAYS",
      amount: "UGX 34.0M",
      description: "Liabilities due within 30 days for Kansanga International",
      icon: CalendarDays,
      className: "liability-metric--due",
    },
    {
      title: "OVERDUE PAYABLES",
      amount: "UGX 5.0M",
      description: "Overdue payments for Kansanga International",
      icon: TriangleAlert,
      className: "liability-metric--overdue",
    },
  ],
};

export function LiabilitiesSummary({
  campus = "All Campuses",
}: LiabilitiesSummaryProps) {
  const liabilityMetrics =
    sampleMetrics[String(campus)] ?? sampleMetrics["All Campuses"];

  return (
    <section className="liabilities-summary" aria-label="Liabilities summary">
      {liabilityMetrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <article
            className={`liability-metric ${metric.className}`}
            key={metric.title}
          >
            <span className="liability-metric__icon">
              <Icon size={20} strokeWidth={2} aria-hidden="true" />
            </span>

            <div className="liability-metric__body">
              <p className="liability-metric__title">{metric.title}</p>
              <h2 className="liability-metric__amount">{metric.amount}</h2>
            </div>

            <p className="sr-only">{metric.description}</p>
          </article>
        );
      })}
    </section>
  );
}
