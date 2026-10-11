import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Minus } from "lucide-react";

import { classComparison, termOptions } from "./attendanceRates.data";

export function ClassComparisonCard() {
  const [term, setTerm] = useState(termOptions[0]);

  return (
    <section className="ar-card">
      <div className="ar-card__header">
        <div>
          <h2 className="ar-card__title">
            Class, Grade &amp; Student Group Comparison
          </h2>
          <p className="ar-card__subtitle">
            Term-by-term attendance across cohorts
          </p>
        </div>

        <div className="ar-mini-select">
          <select
            aria-label="Select term"
            className="ar-mini-select__select"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
          >
            {termOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown size={14} aria-hidden="true" />
        </div>
      </div>

      <div className="ar-table-wrap">
        <table className="ar-table">
          <thead>
            <tr>
              <th scope="col">Type</th>
              <th scope="col">Class / grade name</th>
              <th scope="col" className="ar-num">
                Term 1
              </th>
              <th scope="col" className="ar-num">
                Term 2
              </th>
              <th scope="col" className="ar-num">
                Term 3
              </th>
              <th scope="col" className="ar-num">
                Change (pts)
              </th>
              <th scope="col">Flag</th>
            </tr>
          </thead>

          <tbody>
            {classComparison.map((row) => {
              const direction =
                row.change > 0 ? "up" : row.change < 0 ? "down" : "flat";
              const DeltaIcon =
                direction === "up"
                  ? ArrowUp
                  : direction === "down"
                    ? ArrowDown
                    : Minus;

              return (
                <tr key={row.id}>
                  <td>
                    <span className="ar-kind">{row.kind}</span>
                  </td>
                  <td className="ar-strong">{row.name}</td>
                  <td className="ar-num">{row.term1.toFixed(1)}%</td>
                  <td className="ar-num">{row.term2.toFixed(1)}%</td>
                  <td className="ar-num">{row.term3.toFixed(1)}%</td>
                  <td className="ar-num">
                    <span className={`ar-delta ar-delta--${direction}`}>
                      <DeltaIcon size={13} aria-hidden="true" />
                      {Math.abs(row.change).toFixed(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`ar-badge ar-tone--${row.tone}`}>
                      {row.flag}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
