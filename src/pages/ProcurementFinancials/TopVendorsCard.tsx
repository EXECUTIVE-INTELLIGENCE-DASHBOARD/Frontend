import { ArrowRight } from "lucide-react";

import {
  formatUgx,
  spendCategories,
  topVendors,
  totalVendorCount,
} from "./procurementFinancials.data";

const categoryLabel = (id: string) =>
  spendCategories.find((category) => category.id === id)?.shortLabel ?? id;

export function TopVendorsCard() {
  return (
    <section className="pf-card">
      <div className="pf-card__header">
        <div>
          <h2 className="pf-card__title">Top 5 Vendors by Total Spend</h2>
          <p className="pf-card__subtitle">Highest paid suppliers this year</p>
        </div>
      </div>

      <ol className="pf-vendors">
        {topVendors.map((vendor) => (
          <li key={vendor.id} className="pf-vendor">
            <span className="pf-vendor__rank">#{vendor.rank}</span>

            <span className="pf-vendor__name">{vendor.name}</span>

            <span className={`pf-badge pf-tone--${vendor.category}`}>
              {categoryLabel(vendor.category)}
            </span>

            <span className="pf-vendor__amount">{formatUgx(vendor.spend)}</span>
          </li>
        ))}
      </ol>

      <div className="pf-card__footer">
        <button type="button" className="pf-link-button">
          View All {totalVendorCount} Vendors
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
