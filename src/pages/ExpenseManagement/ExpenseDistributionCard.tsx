/**
 * "Expense Distribution" card — a donut showing how total operating spend
 * splits across four categories, with the exact figures listed beside it.
 *
 * Slices are sorted largest-first so the ring reads from big to small, which
 * matches the order of the legend rows next to it.
 */
import { DonutChart } from "../../components/DonutChart";

import {
  distributionShare,
  expenseDistribution,
  formatUgx,
  totalDistribution,
} from "./expenseManagement.data";
import type { SliceTone } from "./expenseManagement.types";

/**
 * Slice tone -> ring colour. These are the page-local brand tokens declared
 * on `.exp-page`, so the ring and the legend dots always agree and a palette
 * change only has to happen in `ExpenseManagement.css`.
 */
const COLORS: Record<SliceTone, string> = {
  navy: "var(--exp-navy)",
  cyan: "var(--exp-cyan)",
  purple: "var(--exp-purple)",
  gold: "var(--exp-gold)",
};

/**
 * Copy before sorting — `[...expenseDistribution]` avoids mutating the shared
 * array that the other cards on the page also import.
 */
const ranked = [...expenseDistribution].sort((a, b) => b.amount - a.amount);

export function ExpenseDistributionCard() {
  return (
    <section className="exp-card exp-card--cyan">
      <div className="exp-card__header">
        <h2 className="exp-card__title">Expense Distribution</h2>
      </div>

      {/* Donut on the left, figures on the right. Wraps to two rows once the
          card gets narrow — see `.exp-allocation` in the CSS. */}
      <div className="exp-allocation">
        <DonutChart
          segments={ranked.map((slice) => ({
            id: slice.id,
            value: slice.amount,
            color: COLORS[slice.tone],
          }))}
          centerValue={`UGX ${totalDistribution}M`}
          centerLabel="Total OpEx"
          ariaLabel="Operating expenses split by category"
          size={148}
          thickness={20}
        />

        {/* The donut shows proportion; this list gives the exact numbers, which
            the ring alone cannot convey. Same order as the slices. */}
        <ul className="exp-allocation__list">
          {ranked.map((slice) => (
            <li key={slice.id} className="exp-allocation__item">
              {/* Swatch colour is set inline because it depends on the data
                  (the slice's tone), not on a static CSS rule. */}
              <span
                className="exp-allocation__dot"
                style={{ background: COLORS[slice.tone] }}
                aria-hidden="true"
              />

              <span className="exp-allocation__text">
                <span className="exp-allocation__name">{slice.label}</span>

                <span className="exp-allocation__meta">
                  {formatUgx(slice.amount)} (
                  {distributionShare(slice.amount).toFixed(1)}%)
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
