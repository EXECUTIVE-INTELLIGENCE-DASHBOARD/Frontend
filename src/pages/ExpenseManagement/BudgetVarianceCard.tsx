/**
 * "Budget Variance by Category" card — the detail table behind the four KPI
 * cards, with a totals row.
 *
 * Each row restates one overhead category as budget vs actual, so a reader can
 * see *where* the money went rather than just the headline figures.
 */
import {
  formatUgx,
  formatVariance,
  overheads,
  overheadShare,
  overheadVariance,
  totalOverheadBudget,
  totalOverheads,
} from "./expenseManagement.data";

/** Pill colours, each mapped to a `.exp-pill--<tone>` class in the CSS. */
type StatusTone = "over" | "on-track" | "under";

interface Status {
  label: string;
  tone: StatusTone;
}

/**
 * Turns a variance percentage into a human-readable status.
 *
 * The ±2% dead band matters: without it, being 0.3% over budget would be
 * labelled a failure and every row would look like an alert. Two percent is
 * treated as "close enough" and shown neutrally.
 */
function statusFor(variance: number): Status {
  if (variance > 2) return { label: "Over budget", tone: "over" };
  if (variance < -2) return { label: "Under budget", tone: "under" };

  return { label: "On track", tone: "on-track" };
}

/**
 * Variance for the whole page, computed from the two grand totals.
 *
 * Note this is *not* the average of the four row variances — a category with a
 * huge budget should carry more weight, and working from the totals does that
 * automatically. Currently +1.5%.
 */
const totalVariance =
  ((totalOverheads - totalOverheadBudget) / totalOverheadBudget) * 100;

export function BudgetVarianceCard() {
  return (
    <section className="exp-card">
      <div className="exp-card__header">
        <h2 className="exp-card__title">Budget Variance by Category</h2>
      </div>

      {/* Wrapper scrolls horizontally on narrow screens so the columns can
          keep their widths instead of wrapping into an unreadable mess. */}
      <div className="exp-table-wrap">
        <table className="exp-table">
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Budget</th>
              <th scope="col">Actual</th>
              <th scope="col">Variance</th>
              <th scope="col">Share</th>
              <th scope="col">Status</th>
            </tr>
          </thead>

          <tbody>
            {/* Same source array as the KPI cards above, so the table and the
                cards always tell the same story. */}
            {overheads.map((overhead) => {
              const variance = overheadVariance(overhead);
              const status = statusFor(variance);

              return (
                <tr key={overhead.id}>
                  <td>
                    <span className="exp-table__name">{overhead.label}</span>
                  </td>

                  <td>
                    <span className="exp-table__amount">
                      {formatUgx(overhead.budget)}
                    </span>
                  </td>

                  <td>
                    <span className="exp-table__amount">
                      {formatUgx(overhead.amount)}
                    </span>
                  </td>

                  <td>
                    {/* Over budget is amber, under budget is green. Both are
                        plain coloured text — the design has no soft tint for
                        either state, so no pill background is used here. */}
                    <span
                      className={
                        variance > 0
                          ? "exp-table__delta exp-table__delta--over"
                          : "exp-table__delta exp-table__delta--under"
                      }
                    >
                      {formatVariance(variance)}
                    </span>
                  </td>

                  <td>
                    <span className="exp-table__share">
                      {overheadShare(overhead.amount).toFixed(1)}%
                    </span>
                  </td>

                  <td>
                    <span className={`exp-pill exp-pill--${status.tone}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Totals row, visually separated by a tinted background. The share
              is hard-coded to 100.0% because that is what the row means. */}
          <tfoot>
            <tr>
              <td>
                <span className="exp-table__name">Total overheads</span>
              </td>

              <td>
                <span className="exp-table__amount">
                  {formatUgx(totalOverheadBudget)}
                </span>
              </td>

              <td>
                <span className="exp-table__amount">
                  {formatUgx(totalOverheads)}
                </span>
              </td>

              <td>
                <span
                  className={
                    totalVariance > 0
                      ? "exp-table__delta exp-table__delta--over"
                      : "exp-table__delta exp-table__delta--under"
                  }
                >
                  {formatVariance(totalVariance)}
                </span>
              </td>

              <td>
                <span className="exp-table__share">100.0%</span>
              </td>

              <td>
                <span className={`exp-pill exp-pill--${statusFor(totalVariance).tone}`}>
                  {statusFor(totalVariance).label}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
