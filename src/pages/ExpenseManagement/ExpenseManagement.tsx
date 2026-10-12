/**
 * Expense Management page — the "Expense Management" entry under
 * Finance & Procurement in the sidebar.
 *
 * This component is only *layout*. It imports finished blocks and arranges
 * them; every number and every piece of markup lives in the child components
 * and in `expenseManagement.data.ts`.
 *
 * Layout, top to bottom:
 *   1. breadcrumb       — where we are in the nav tree
 *   2. heading          — title, subtitle, refresh action
 *   3. `.exp-controls`  — filter rail (left) beside the four overhead KPIs
 *   4. `.exp-split` x2  — donut + trend chart, then campus bars + variance table
 *
 * Note: the component must not render a `<main>` element of its own. `App.tsx`
 * already wraps every page in `<main className="app-shell layout-content">`,
 * so a nested `<main>` here would be invalid HTML. Hence the `<div>` root.
 */
import { RefreshCw } from "lucide-react";

import { filterControls, overheads } from "./expenseManagement.data";
import { FilterCard } from "./FilterCard";
import { OverheadCard } from "./OverheadCard";
import { SpendBreakdownCard } from "./SpendBreakdownCard";
import { SpendTrendCard } from "./SpendTrendCard";
import { CampusSpendCard } from "./CampusSpendCard";
import { BudgetVarianceCard } from "./BudgetVarianceCard";

import "./ExpenseManagement.css";

export function ExpenseManagement() {
  return (
    <div className="exp-page">
      <nav className="exp-breadcrumb" aria-label="Breadcrumb">
        <span className="exp-breadcrumb__item">Finance &amp; Procurement</span>

        <span className="exp-breadcrumb__sep" aria-hidden="true">
          /
        </span>

        <span
          className="exp-breadcrumb__item exp-breadcrumb__item--current"
          aria-current="page"
        >
          Expense Management
        </span>
      </nav>

      <div className="exp-heading">
        <div className="exp-heading__text">
          <h1 className="exp-heading__title">Expense Management</h1>

          <p className="exp-heading__subtitle">
            Tracks operating spend across rent, wages, utilities and marketing.
          </p>
        </div>

        <button
          type="button"
          className="exp-icon-button"
          aria-label="Refresh expense data"
        >
          <RefreshCw size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Either list below can grow without editing this file: the rail is
          driven by `filterControls` and the KPI row by `overheads`. */}
      <div className="exp-controls">
        <div className="exp-filters">
          {filterControls.map((control) => (
            <FilterCard key={control.id} control={control} />
          ))}
        </div>

        <div className="exp-metrics">
          {overheads.map((overhead) => (
            <OverheadCard key={overhead.id} overhead={overhead} />
          ))}
        </div>
      </div>

      {/* `.exp-split` is a two-column grid: a narrow card on the left and a
          wide one on the right. At <=1180px CSS collapses it to one column. */}
      <div className="exp-split">
        <SpendBreakdownCard />
        <SpendTrendCard />
      </div>

      <div className="exp-split">
        <CampusSpendCard />
        <BudgetVarianceCard />
      </div>
    </div>
  );
}