import {
  attendanceNote,
  attendanceStats,
  missedDayRows,
  missedDaysFootnote,
  missedDaysLabel,
} from "./myChildProgress.data";

export function AttendanceCard() {
  return (
    <section className="mc-card">
      <div className="mc-card__header">
        <h2 className="mc-card__title">Attendance &amp; Follow-up</h2>
      </div>

      <p className="mc-card__note">{attendanceNote}</p>

      <div className="mc-card__body">
        <ul className="mc-stats mc-stats--inline">
          {attendanceStats.map((stat) => (
            <li key={stat.id} className="mc-stat mc-stat--stacked">
              <span className="mc-stat__label">{stat.label}</span>

              <span className="mc-stat__value">{stat.value}</span>

              {stat.note ? (
                <span className="mc-stat__note">{stat.note}</span>
              ) : null}
            </li>
          ))}
        </ul>

        <p className="mc-section-label">{missedDaysLabel}</p>

        <div className="mc-table-wrap">
          <table className="mc-table mc-table--wide">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Reason</th>
                <th scope="col">Follow-up</th>
                <th scope="col">Status</th>
              </tr>
            </thead>

            <tbody>
              {missedDayRows.map((row) => (
                <tr key={row.id}>
                  <td className="mc-table__strong">{row.date}</td>

                  <td className="mc-table__muted">{row.reason}</td>

                  <td className="mc-table__muted">{row.followUp}</td>

                  <td>
                    <span className={`mc-status mc-status--${row.tone}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mc-card__footnote">{missedDaysFootnote}</p>
    </section>
  );
}
