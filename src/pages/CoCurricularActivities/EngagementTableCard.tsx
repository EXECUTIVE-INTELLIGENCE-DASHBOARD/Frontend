import type { CoCurricularActivityRow } from "../../api/academics.api";

import "../../palette.css";
import "./coCurricularPalette.css";

interface EngagementTableCardProps {
  rows: CoCurricularActivityRow[];
}

export function EngagementTableCard({
  rows,
}: EngagementTableCardProps) {
  const safeRows = rows ?? [];

  return (
    <section className="cc-card">
      <div className="cc-card__header">
        <h2 className="cc-card__title">
          <span className="cc-card__dot" aria-hidden="true" />
          Co-Curricular &amp; Club Engagement Summary
        </h2>
      </div>

      <div className="cc-table-wrap">
        <table className="cc-table">
          <thead>
            <tr>
              <th scope="col">Activity</th>
              <th scope="col">Category</th>
              <th scope="col">School</th>
              <th scope="col" className="cc-num">
                Participants
              </th>
            </tr>
          </thead>

          <tbody>
            {safeRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="cc-muted">
                  No activity data is available.
                </td>
              </tr>
            ) : (
              safeRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className="cc-activity">
                      <span className="cc-activity__name">
                        {row.name}
                      </span>
                    </span>
                  </td>

                  <td>{row.category_display}</td>
                  <td>{row.school}</td>
                  <td className="cc-num cc-strong">
                    {row.participants}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
