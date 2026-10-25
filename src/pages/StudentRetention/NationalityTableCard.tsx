import {
  campusShortName,
  formatMetric,
  formatRate,
  retentionTarget,
} from "./studentRetention.data";
import type { NationalityRow } from "./studentRetention.types";

interface NationalityTableCardProps {
  rows: NationalityRow[];
}

function RetentionPill({ rate }: { rate: number | null }) {
  if (rate === null) {
    return (
      <span className="sr-pill" title="Not reported by the API">
        —
      </span>
    );
  }

  return (
    <span
      className={`sr-pill ${rate >= retentionTarget ? "sr-pill--good" : ""}`}
    >
      {formatRate(rate)}
    </span>
  );
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
                    {formatMetric(row.reEnrolled)}
                  </td>
                  <td className="sr-num">
                    <RetentionPill rate={row.retention} />
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
