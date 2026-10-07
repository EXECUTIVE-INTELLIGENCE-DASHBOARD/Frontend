import { supportRoster } from "./academicPerformance.data";

export function SupportRosterCard() {
  return (
    <section className="ap-card">
      <div className="ap-card__header">
        <h2 className="ap-card__title">
          Early Intervention &amp; Student Support Roster
        </h2>
      </div>

      <div className="ap-table-wrap">
        <table className="ap-table ap-table--roster">
          <thead>
            <tr>
              <th scope="col">Student</th>
              <th scope="col">Risk signal</th>
              <th scope="col">Route</th>
              <th scope="col">Support plan</th>
              <th scope="col">Owner / review</th>
              <th scope="col">Status</th>
            </tr>
          </thead>

          <tbody>
            {supportRoster.map((row) => (
              <tr key={row.id}>
                <td>
                  <span className="ap-learner">
                    <span className="ap-learner__name">{row.learner}</span>
                    <span className="ap-learner__cohort">{row.cohort}</span>
                  </span>
                </td>
                <td className="ap-table__muted">{row.signal}</td>
                <td>
                  <span className="ap-route">{row.route}</span>
                </td>
                <td className="ap-table__muted">{row.support}</td>
                <td className="ap-table__muted">{row.owner}</td>
                <td>
                  <span className={`ap-status ap-status--${row.statusTone}`}>
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
