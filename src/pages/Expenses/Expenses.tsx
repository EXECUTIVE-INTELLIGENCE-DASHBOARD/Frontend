import { RefreshCw } from "lucide-react";
import { filterControls } from "./Expenses.data";
import { FilterCard } from "./FilterCard";
import "./Expenses.css";

export function Expenses() {
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
          Expenses
        </span>
      </nav>

      <div className="exp-heading">
        <div className="exp-heading__text">
          <h1 className="exp-heading__title">Expenses</h1>

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

      <div className="exp-controls">
        <div className="exp-filters">
          {filterControls.map((control) => (
            <FilterCard key={control.id} control={control} />
          ))}
        </div>
      </div>
    </div>
  );
}