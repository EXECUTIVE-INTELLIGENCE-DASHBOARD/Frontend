import { Hammer, Package, Wrench } from "lucide-react";

import { formatUgx, shareOfTotal } from "./procurementFinancials.data";
import type { CategoryId, SpendCategory } from "./procurementFinancials.types";

const ICONS = {
  works: Hammer,
  services: Wrench,
  goods: Package,
} as const satisfies Record<CategoryId, unknown>;

interface SpendSummaryCardProps {
  category: SpendCategory;
  totalSpend: number;
}

export function SpendSummaryCard({
  category,
  totalSpend,
}: SpendSummaryCardProps) {
  const Icon = ICONS[category.id];

  return (
    <article className="pf-metric">
      <div className={`pf-metric__icon pf-tone--${category.id}`}>
        <Icon size={20} aria-hidden="true" />
      </div>

      <div className="pf-metric__body">
        <span className="pf-metric__label">{category.label}</span>

        <span className="pf-metric__value">{formatUgx(category.spend)}</span>

        <span className="pf-metric__caption">
          {shareOfTotal(category.spend, totalSpend).toFixed(1)}% of total spend
        </span>
      </div>
    </article>
  );
}
