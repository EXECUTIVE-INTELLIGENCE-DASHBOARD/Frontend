import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { campusOptions, spendCategories } from "./procurementFinancials.data";
import { SpendSummaryCard } from "./SpendSummaryCard";
import { TopVendorsCard } from "./TopVendorsCard";
import { SpendAllocationCard } from "./SpendAllocationCard";
import { SettlementAnalysisCard } from "./SettlementAnalysisCard";

import "../../palette.css";
import "./ProcurementFinancials.css";

export function ProcurementFinancials() {
  const [campus, setCampus] = useState(campusOptions[0]);

  return (
    <div className="pf-page">
      <div className="pf-toolbar">
        <div className="pf-filter">
          <label className="pf-filter__label" htmlFor="pf-campus-filter">
            Select Campus
          </label>

          <div className="pf-filter__control">
            <select
              id="pf-campus-filter"
              className="pf-filter__select"
              value={campus}
              onChange={(event) => setCampus(event.target.value)}
            >
              {campusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <ChevronDown
              className="pf-filter__caret"
              size={16}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <div className="pf-metrics">
        {spendCategories.map((category) => (
          <SpendSummaryCard key={category.id} category={category} />
        ))}
      </div>

      <div className="pf-grid">
        <TopVendorsCard />
        <SpendAllocationCard />
      </div>

      <SettlementAnalysisCard />
    </div>
  );
}
