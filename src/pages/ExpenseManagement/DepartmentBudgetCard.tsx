/**
 * "Departmental Budget vs. Actual Expenditure" card — one row per department
 * carrying a budgeted bar above an expenditure bar.
 *
 * These are plain CSS bars (`<span>` widths), not SVG: a bar list needs no
 * axes or scaling maths, so the DOM stays accessible and cheap. Both bars in a
 * row share the same scale — the largest single budget — so budget and
 * expenditure are directly comparable, both down a row and across rows.
 * Scaling against the sum of all budgets instead would leave every bar under
 * half full and hard to read.
 */
import { TrendingDown } from "lucide-react";

import {
  departmentSpend,
  formatMillions,
  formatUgx,
  peakDepartmentBudget,
  totalDepartmentActual,
  totalDepartmentBudget,
} from "./expenseManagement.data";

export function DepartmentBudgetCard() {
  return (
    <section className="exp-card">
      <div className="exp-card__header">
        <h2 className="exp-card__title">
          Departmental Budget vs. Actual Expenditure
        </h2>

        {/* Order matches the bars inside each row: budget first, then
            expenditure, so the legend reads top-to-bottom like the chart. */}
        <ul className="exp-legend">
          <li className="exp-legend__item">
            <span
              className="exp-legend__dot"
              style={{ background: "var(--chart-mist)" }}
              aria-hidden="true"
            />
            Budget
          </li>

          <li className="exp-legend__item">
            <span
              className="exp-legend__dot"
              style={{ background: "var(--chart-navy)" }}
              aria-hidden="true"
            />
            Expenditure
          </li>
        </ul>
      </div>

      <div className="exp-card__body">
        <ul className="exp-bars">
          {departmentSpend.map((row) => (
            <li key={row.id} className="exp-bars__row">
              <div className="exp-bars__head">
                <span className="exp-bars__label">{row.department}</span>

                {/* Budget then expenditure, matching the two bars below. */}
                <span className="exp-bars__value">
                  {formatMillions(row.budget)}

                  <span className="exp-bars__share">
                    {formatMillions(row.actual)}
                  </span>
                </span>
              </div>

              {/* Two tracks per row. `role="progressbar"` gives each bar a text
                  equivalent for screen readers, which a styled <span> would
                  not have. */}
              <div
                className="exp-bars__track"
                role="progressbar"
                aria-label={`${row.department} budget`}
                aria-valuenow={row.budget}
                aria-valuemin={0}
                aria-valuemax={peakDepartmentBudget}
              >
                <span
                  className="exp-bars__fill exp-bars__fill--budget"
                  style={{
                    width: `${(row.budget / peakDepartmentBudget) * 100}%`,
                  }}
                />
              </div>

              <div
                className="exp-bars__track"
                role="progressbar"
                aria-label={`${row.department} expenditure`}
                aria-valuenow={row.actual}
                aria-valuemin={0}
                aria-valuemax={peakDepartmentBudget}
              >
                <span
                  className="exp-bars__fill exp-bars__fill--actual"
                  style={{
                    width: `${(row.actual / peakDepartmentBudget) * 100}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>

        {/* Summary line. Every figure here is derived from the same arrays the
            bars are drawn from, so the two cannot drift apart. */}
        <p className="exp-bars__caption">
          <TrendingDown size={14} aria-hidden="true" />

          <strong>{formatUgx(totalDepartmentActual)}</strong> spent against{" "}
          <strong>{formatUgx(totalDepartmentBudget)}</strong> budgeted across{" "}
          {departmentSpend.length} departments.
        </p>
      </div>
    </section>
  );
}
