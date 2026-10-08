import { Download } from "lucide-react";

import { interventionQueue } from "./attendanceRates.data";

export function InterventionQueueCard() {
  return (
    <section className="ar-card">
      <div className="ar-card__header">
        <div>
          <h2 className="ar-card__title">
            Declining Attendance &amp; Intervention Queue
          </h2>
          <p className="ar-card__subtitle">
            Learners and classes requiring follow-up
          </p>
        </div>

        <button type="button" className="ar-ghost-button">
          <Download size={15} aria-hidden="true" />
          Export
        </button>
      </div>

      <div className="ar-table-wrap">
        <table className="ar-table">
          <thead>
            <tr>
              <th scope="col">Class / band</th>
              <th scope="col">Signal</th>
              <th scope="col">Next action</th>
              <th scope="col">Owner</th>
              <th scope="col">Due date</th>
              <th scope="col">Status</th>
            </tr>
          </thead>

          <tbody>
            {interventionQueue.map((row) => (
              <tr key={row.id}>
                <td>
                  <span className="ar-stack">
                    <span className="ar-strong">{row.band}</span>
                    <span className="ar-stack__meta">{row.bandMeta}</span>
                  </span>
                </td>
                <td>
                  <span className="ar-stack">
                    <span className="ar-strong">{row.signal}</span>
                    <span className="ar-stack__meta">{row.signalMeta}</span>
                  </span>
                </td>
                <td>{row.action}</td>
                <td>
                  <span className="ar-stack">
                    <span className="ar-strong">{row.owner}</span>
                    <span className="ar-stack__meta">{row.ownerMeta}</span>
                  </span>
                </td>
                <td>{row.due}</td>
                <td>
                  <span className={`ar-badge ar-tone--${row.tone}`}>
                    {row.status}
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
