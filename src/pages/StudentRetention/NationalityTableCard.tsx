import {
  campusShortName,
  formatNumber,
  retentionTarget,
} from "./studentRetention.data";
import type { NationalityRow } from "./studentRetention.types";

interface NationalityTableCardProps {
  rows: NationalityRow[];
}

export function NationalityTableCard({ rows }: NationalityTableCardProps) {
  return (
    <section className="sr-card">
      <div className="sr-card__header">
        <h2 className="sr-card__title">
          <span className="sr-card__dot sr-card__dot--navy" aria-hidden="true" />
          Student Retention by Nationality
        </h2>
      </div>

      <div className="sr-table-wrap">
        <table className="sr-table">
          <thead>
            <tr>
              <th scope="col">Nationality</th>
              <th scope="col">Campus</th>
              <th scope="col" className="sr-num">
                Re-enrolled
              </th>
              <th scope="col" className="sr-num">
                Retention %
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="sr-empty">
                  No nationality data is recorded for this campus yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className="sr-nationality">
                      <span className="sr-nationality__dot" aria-hidden="true" />
                      <span className="sr-nationality__name">
                        {row.nationality}
                      </span>
                    </span>
                  </td>
                  <td className="sr-muted">{campusShortName(row.campus)}</td>
                  <td className="sr-num sr-strong">
                    {formatNumber(row.reEnrolled)}
                  </td>
                  <td className="sr-num">
                    <span
                      className={`sr-pill ${
                        row.retention >= retentionTarget ? "sr-pill--good" : ""
                      }`}
                    >
                      {row.retention.toFixed(1)}%
                    </span>
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
