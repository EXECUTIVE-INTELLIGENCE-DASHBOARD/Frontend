import type { CoCurricularActivityRow } from "../../api/academics.api";

import "../../palette.css";

interface EngagementTableCardProps {
  activities: CoCurricularActivityRow[];
}

export function EngagementTableCard({
  activities,
}: EngagementTableCardProps) {
  return (
    <section className="cc-card">
      <div className="cc-card__header">
        <h2 className="cc-card__title">Activities</h2>
      </div>

      <div className="cc-table-wrap">
        <table className="cc-table cc-activities-table">
          <thead>
            <tr>
              <th scope="col">Activities</th>
              <th scope="col" className="cc-category">Category</th>
              <th scope="col" className="cc-num">Girls</th>
              <th scope="col" className="cc-num">Boys</th>
              <th scope="col" className="cc-num">Total Participants</th>
            </tr>
          </thead>

          <tbody>
            {activities.length === 0 ? (
              <tr>
                <td colSpan={5} className="cc-muted">
                  No activity data is available.
                </td>
              </tr>
            ) : (
              activities.map((activity) => (
                <tr key={activity.id}>
                  <td>
                    <span className="cc-activity__name">{activity.name}</span>
                  </td>
                  <td className="cc-category">{activity.category_display}</td>
                  <td className="cc-num">{activity.girls}</td>
                  <td className="cc-num">{activity.boys}</td>
                  <td className="cc-num cc-strong">{activity.participants}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
