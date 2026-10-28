import { useState } from "react";
import { ClipboardList } from "lucide-react";

import {
  formatLiabilityCurrency,
  type CreditorBalance,
} from "../../pages/Liabilities/liabilitiesDashboard";
import "./OutstandingCreditors.css";

interface OutstandingCreditorsProps {
  creditors: CreditorBalance[];
}

export function OutstandingCreditors({
  creditors,
}: OutstandingCreditorsProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleCreditors = showAll ? creditors : creditors.slice(0, 5);
  const maxAmount = visibleCreditors[0]?.owed ?? 0;

  return (
    <section
      className="outstanding-creditors"
      aria-labelledby="outstanding-creditors-title"
    >
      <h2
        className="outstanding-creditors__title"
        id="outstanding-creditors-title"
      >
        <ClipboardList size={20} aria-hidden="true" />
        Top 5 creditors
        <span className="outstanding-creditors__count">{creditors.length}</span>
      </h2>

      <div className="outstanding-creditors__chart">
        {visibleCreditors.map((creditor) => (
          <div className="outstanding-creditors__bar-row" key={creditor.id}>
            <span className="outstanding-creditors__name" title={creditor.name}>
              {creditor.name}
            </span>
            <div
              className="outstanding-creditors__track"
              role="img"
              aria-label={`${creditor.name}: ${formatLiabilityCurrency(creditor.owed)}`}
            >
              <span
                className="outstanding-creditors__bar"
                style={{
                  width: `${maxAmount > 0 ? (creditor.owed / maxAmount) * 100 : 0}%`,
                }}
              />
            </div>
            <strong className="outstanding-creditors__value">
              {formatLiabilityCurrency(creditor.owed)}
            </strong>
          </div>
        ))}
        {creditors.length === 0 && (
          <p className="outstanding-creditors__empty">
            No outstanding creditors for this selection.
          </p>
        )}
      </div>

      {creditors.length > 5 && (
        <button
          className="outstanding-creditors__toggle"
          onClick={() => setShowAll((current) => !current)}
          aria-expanded={showAll}
        >
          {showAll ? "Show fewer" : `Show all ${creditors.length} creditors`}
        </button>
      )}
    </section>
  );
}
