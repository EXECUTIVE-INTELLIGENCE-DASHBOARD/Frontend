/**
 * "Spend by Campus" card — one horizontal bar per campus.
 *
 * These are plain CSS bars (`<span>` widths), not SVG: a bar list needs no
 * axes or scaling maths, so the DOM keeps it accessible and cheap.
 */
import { MapPin } from "lucide-react";

import {
  campusShare,
  campusSpend,
  formatUgx,
  topCampus,
} from "./expenseManagement.data";

/**
 * The bar heights are scaled against the *largest* campus rather than the
 * total, so the biggest row always fills its track completely. Scaling against
 * the total would leave every bar under a third full and hard to compare.
 */
const peakSpend = Math.max(...campusSpend.map((row) => row.amount));

export function CampusSpendCard() {
  return (
    <section className="exp-card">
      <div className="exp-card__header">
        <h2 className="exp-card__title">Spend by Campus</h2>
      </div>

      <div className="exp-card__body">
        <ul className="exp-bars">
          {campusSpend.map((row) => {
            const share = campusShare(row.amount);

            return (
              <li key={row.id} className="exp-bars__row">
                <div className="exp-bars__head">
                  <span className="exp-bars__label">{row.campus}</span>

                  <span className="exp-bars__value">
                    {formatUgx(row.amount)}

                    {/* Percentage of the *total*, not of the longest bar —
                        the two measures answer different questions. */}
                    <span className="exp-bars__share">
                      {share.toFixed(1)}%
                    </span>
                  </span>
                </div>

                {/* `role="progressbar"` gives the bar a text equivalent for
                    screen readers, which a styled <span> would not have. */}
                <div
                  className="exp-bars__track"
                  role="progressbar"
                  aria-label={`${row.campus} share of spend`}
                  aria-valuenow={Number(share.toFixed(1))}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span
                    className="exp-bars__fill"
                    style={{ width: `${(row.amount / peakSpend) * 100}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        {/* Calls out the single biggest spender so the card has a takeaway. */}
        <p className="exp-bars__caption">
          <MapPin size={14} aria-hidden="true" />

          <strong>{topCampus.campus}</strong> carries{" "}
          {campusShare(topCampus.amount).toFixed(1)}% of all operating spend.
        </p>
      </div>
    </section>
  );
}
