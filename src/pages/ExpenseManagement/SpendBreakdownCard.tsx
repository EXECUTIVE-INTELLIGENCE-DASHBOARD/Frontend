/**
 * "Spend Composition" card — a donut showing how the four overhead categories
 * make up total operating spend, with the exact figures listed beside it.
 *
 * Slices are sorted largest-first so the ring reads from big to small, which
 * matches the order of the legend rows next to it.
 */
import { DonutChart } from "../../components/DonutChart";

import {
  formatUgx,
  overheadShare,
  overheads,
  totalOverheads,
} from "./expenseManagement.data";
import type { OverheadTone } from "./expenseManagement.types";

/**
 * Tone -> slice colour.
 *
 * This is deliberately a four-stop *blue* ramp (navy, blue, sky, mist) rather
 * than the four distinct tone colours used by the KPI cards. A donut with
 * green/amber/violet slices would look like it belonged to four different
 * charts; a single-hue ramp reads as one series and still separates cleanly.
 * The legend labels carry the meaning, so hue only has to encode rank.
 *
 * The four `--chart-*` tokens are theme-aware: they resolve to different
 * values in dark mode without any code change here.
 */
const COLORS: Record<OverheadTone, string> = {
  blue: "var(--chart-navy)",
  green: "var(--chart-blue)",
  amber: "var(--chart-sky)",
  violet: "var(--chart-mist)",
};

/**
 * Copy before sorting — `[...overheads]` avoids mutating the shared array that
 * every other card on the page also imports.
 */
const ranked = [...overheads].sort((a, b) => b.amount - a.amount);

export function SpendBreakdownCard() {
  return (
    <section className="exp-card">
      <div className="exp-card__header">
        <div>
          <h2 className="exp-card__title">Spend Composition</h2>

          <p className="exp-card__subtitle">
            Total overheads {formatUgx(totalOverheads)}
          </p>
        </div>
      </div>

      {/* Donut on the left, figures on the right. Wraps to two rows once the
          card gets narrow — see `.exp-allocation` in the CSS. */}
      <div className="exp-allocation">
        {/* `size` and `thickness` are props on the shared donut so each card
            can pick a ring that suits its column width. */}
        <DonutChart
          segments={ranked.map((overhead) => ({
            id: overhead.id,
            value: overhead.amount,
            color: COLORS[overhead.tone],
          }))}
          centerValue={`${totalOverheads.toFixed(1)}M`}
          centerLabel="UGX total"
          ariaLabel="Operating overheads split by category"
          size={148}
          thickness={20}
        />

        {/* The donut shows proportion; this list gives the exact numbers, which
            the ring alone cannot convey. Same order as the slices. */}
        <ul className="exp-allocation__list">
          {ranked.map((overhead) => (
            <li key={overhead.id} className="exp-allocation__item">
              {/* Swatch colour is set inline because it depends on the data
                  (the overhead's tone), not on a static CSS rule. */}
              <span
                className="exp-allocation__dot"
                style={{ background: COLORS[overhead.tone] }}
                aria-hidden="true"
              />

              <span className="exp-allocation__text">
                <span className="exp-allocation__name">{overhead.label}</span>

                <span className="exp-allocation__meta">
                  {formatUgx(overhead.amount)} (
                  {overheadShare(overhead.amount).toFixed(1)}%)
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
