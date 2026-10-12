/**
 * One overhead KPI card, e.g. "Wages & Salaries — UGX 412.0M".
 *
 * Four of these sit in the `.exp-metrics` grid at the top of the page. Each
 * card shows three things: the category, the actual spend, and a caption
 * giving the category's share of all overheads plus its movement against
 * budget.
 *
 * The card is presentation-only — it receives one `Overhead` and derives
 * everything else through the shared helpers, so no figure is typed twice.
 */
import {
  Building2,
  HandCoins,
  Megaphone,
  Zap,
  type LucideIcon,
} from "lucide-react";

import {
  formatUgx,
  formatVariance,
  overheadShare,
  overheadVariance,
} from "./expenseManagement.data";
import type { Overhead } from "./expenseManagement.types";

/**
 * Category id -> icon. Adding a fifth overhead category means adding one entry
 * here; `?? Building2` below keeps the card intact if one is missed.
 */
const OVERHEAD_ICONS: Record<string, LucideIcon> = {
  rent: Building2,
  wages: HandCoins,
  utilities: Zap,
  marketing: Megaphone,
};

interface OverheadCardProps {
  overhead: Overhead;
}

export function OverheadCard({ overhead }: OverheadCardProps) {
  // Fall back to a neutral icon rather than rendering nothing.
  const Icon = OVERHEAD_ICONS[overhead.id] ?? Building2;

  // Derived, never stored: see the note on `Overhead.budget` in the types file.
  const variance = overheadVariance(overhead);
  const isOverBudget = variance > 0;

  return (
    <article className={`exp-metric exp-metric--${overhead.tone}`}>
      <span className="exp-metric__icon" aria-hidden="true">
        <Icon size={18} />
      </span>

      <span className="exp-metric__body">
        <span className="exp-metric__label">{overhead.label}</span>

        <span className="exp-metric__value">{formatUgx(overhead.amount)}</span>

        <span className="exp-metric__caption">
          {overheadShare(overhead.amount).toFixed(1)}% of overheads
          <span aria-hidden="true"> · </span>
          {/* The middle dot is decorative, so screen readers skip it. */}
          <span
            className={
              isOverBudget
                ? "exp-metric__delta exp-metric__delta--over"
                : "exp-metric__delta exp-metric__delta--under"
            }
          >
            {formatVariance(variance)} vs budget
          </span>
        </span>
      </span>
    </article>
  );
}
