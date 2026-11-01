/**
 * One headline KPI card, e.g. "Total YTD Expenditure — UGX 540.0M".
 *
 * Three of these sit in the `.exp-metrics` grid at the top of the page. Each
 * card shows the metric's name and its figure and nothing else: unlike the
 * categories in the donut below, these three are summaries rather than
 * budgeted line items, so there is no variance to report against them.
 *
 * The card is presentation-only — it receives one `SummaryMetric` and never
 * computes a figure of its own.
 */
import { Clock3, Receipt, School, type LucideIcon, Wallet } from "lucide-react";

import { formatUgx } from "./expenseManagement.data";
import type { SummaryMetric } from "./expenseManagement.types";

/**
 * Metric id -> icon. Adding a fourth KPI means adding one entry here; the
 * `?? Wallet` fallback below keeps the card intact if one is missed.
 */
const METRIC_ICONS: Record<string, LucideIcon> = {
  "total-ytd": Receipt,
  "campus-opex": School,
  "pending-approvals": Clock3,
};

interface SummaryMetricCardProps {
  metric: SummaryMetric;
}

export function SummaryMetricCard({ metric }: SummaryMetricCardProps) {
  // Fall back to a neutral icon rather than rendering nothing.
  const Icon = METRIC_ICONS[metric.id] ?? Wallet;

  return (
    <article className={`exp-metric exp-metric--${metric.tone}`}>
      <span className="exp-metric__icon" aria-hidden="true">
        <Icon size={18} />
      </span>

      <span className="exp-metric__body">
        <span className="exp-metric__label">{metric.label}</span>

        <span className="exp-metric__value">{formatUgx(metric.amount)}</span>
      </span>
    </article>
  );
}
