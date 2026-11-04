import { DonutChart } from "../../components/DonutChart";
import {
  formatUgx,
  shareOfTotal,
} from "./procurementFinancials.data";
import type { SpendCategory } from "./procurementFinancials.types";

/* Navy, steel blue and amber, as in the design reference. */
const COLORS = {
  works: "var(--color-heading)",
  services: "var(--pal-steel)",
  goods: "var(--pal-amber)",
} as const;

interface SpendAllocationCardProps {
  categories: SpendCategory[];
  totalSpend: number;
}

export function SpendAllocationCard({
  categories,
  totalSpend,
}: SpendAllocationCardProps) {
  const ranked = [...categories].sort((a, b) => b.spend - a.spend);

  return (
    <section className="pf-card">
      <div className="pf-card__header">
        <div>
          <h2 className="pf-card__title">Spend Allocation by Category</h2>
          <p className="pf-card__subtitle">
            Total outflow {formatUgx(totalSpend)}
          </p>
        </div>
      </div>

      <div className="pf-allocation">
        <DonutChart
          segments={ranked.map((category) => ({
            id: category.id,
            value: category.spend,
            color: COLORS[category.id],
          }))}
          centerValue={`${totalSpend.toFixed(1)}M`}
          centerLabel="UGX total"
          ariaLabel="Spend allocation by category"
          size={148}
          thickness={20}
        />

        <ul className="pf-allocation__list">
          {ranked.map((category) => (
            <li key={category.id} className="pf-allocation__item">
              <span
                className="pf-allocation__dot"
                style={{ background: COLORS[category.id] }}
                aria-hidden="true"
              />

              <span className="pf-allocation__text">
                <span className="pf-allocation__name">
                  {category.allocationLabel}
                </span>

                <span className="pf-allocation__meta">
                  {formatUgx(category.spend)} (
                  {shareOfTotal(category.spend, totalSpend).toFixed(1)}%)
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
