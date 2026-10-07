import { ArrowDown } from "lucide-react";

import { supportRows } from "./academicOverview.data";

export function SupportRadar() {
  return (
    <section className="ao-card support">
      <div className="ao-card__header">
        <h2 className="ao-card__title">
          Targeted Student Support &amp; Intervention Radar
        </h2>
      </div>

      <div className="ao-table-wrap">
        <table className="ao-table support-table">
          <thead>
            <tr>
              <th scope="col">Student Group</th>
              <th scope="col">Identified Trend</th>
              <th scope="col">Key Factor / Indicator</th>
              <th scope="col">Estimated Impact</th>
              <th scope="col">Suggested Action</th>
            </tr>
          </thead>

          <tbody>
            {supportRows.map((row) => (
              <tr key={row.id}>
                <td className="support-table__group">{row.group}</td>
                <td className="support-table__trend">{row.trend}</td>
                <td className="support-table__indicator">{row.indicator}</td>

                <td>
                  <span className="impact">
                    <ArrowDown size={13} aria-hidden="true" />
                    {row.impact}%
                  </span>
                </td>

                <td>
                  <span className={`action-pill action-pill--${row.actionTone}`}>
                    {row.action}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
