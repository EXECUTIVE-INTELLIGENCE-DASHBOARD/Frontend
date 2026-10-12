import { useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  campusOptions,
  prototypeNote,
  spendCategories,
} from "./procurementFinancials.data";
import { SpendSummaryCard } from "./SpendSummaryCard";
import { TopVendorsCard } from "./TopVendorsCard";
import { SpendAllocationCard } from "./SpendAllocationCard";
import { SettlementAnalysisCard } from "./SettlementAnalysisCard";

import "./ProcurementFinancials.css";

export function ProcurementFinancials() {
  const [campus, setCampus] = useState(campusOptions[0]);

  return (
    <div className="pf-page">
      <nav className="pf-breadcrumb" aria-label="Breadcrumb">
        <span className="pf-breadcrumb__item">Finance &amp; Procurement</span>

        <span className="pf-breadcrumb__sep" aria-hidden="true">
          /
        </span>

        <span
          className="pf-breadcrumb__item pf-breadcrumb__item--current"
          aria-current="page"
        >
          Procurement Financials
        </span>
      </nav>

      <div className="pf-heading">
        <h1 className="pf-heading__title">Procurement Financials</h1>

        <p className="pf-heading__subtitle">
          Track procurement spend, top vendors and settlement status across
          works, services and goods.
        </p>
      </div>

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

      <div className="pf-metrics">
        {spendCategories.map((category) => (
          <SpendSummaryCard key={category.id} category={category} />
        ))}
      </div>

      <p className="pf-note">{prototypeNote}</p>

      <div className="pf-grid">
        <TopVendorsCard />
        <SpendAllocationCard />
      </div>

      <SettlementAnalysisCard />
    </div>
  );
}
