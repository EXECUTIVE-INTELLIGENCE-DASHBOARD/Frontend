import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

import { AllVendorsDialog } from "./AllVendorsDialog";
import {
  formatUgx,
  spendCategories,
  topVendors,
  totalVendorCount,
} from "./procurementFinancials.data";

const categoryLabel = (id: string) =>
  spendCategories.find((category) => category.id === id)?.shortLabel ?? id;

export function TopVendorsCard() {
  const [showAll, setShowAll] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close the dialog and give keyboard focus back to the button that opened
  // it. This works even when the click did not focus the button itself, as
  // happens in Safari and Firefox on a Mac.
  const closeAllVendors = () => {
    setShowAll(false);
    triggerRef.current?.focus();
  };

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
        <button
          ref={triggerRef}
          type="button"
          className="pf-link-button"
          aria-haspopup="dialog"
          onClick={() => setShowAll(true)}
        >
          View All {totalVendorCount} Vendors
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      </div>

      <AllVendorsDialog open={showAll} onClose={closeAllVendors} />
    </section>
  );
}
