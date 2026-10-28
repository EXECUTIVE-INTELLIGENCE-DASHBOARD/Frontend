import type { IncidentDashboardData } from "../incidentSecurity.types";

interface IncidentFollowUpPanelProps {
  data: IncidentDashboardData;
}

function formatCode(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function IncidentFollowUpPanel({ data }: IncidentFollowUpPanelProps) {
  const { needs_attention: rows, by_campus: campuses, by_category: categories } = data;

  return (
    <article className="incident-security-panel incident-security-panel--attention">
      <div className="incident-security-panel__heading">
        <div>
          <h2>Open Cases for Follow-up</h2>
        </div>
      </div>
      {rows.length > 0 ? (
        <div className="incident-security-table-wrap">
          <table
            className="incident-security-table"
            aria-label="Open incidents requiring follow-up"
          >
            <thead>
              <tr>
                <th scope="col">Reference</th>
                <th scope="col">Campus</th>
                <th scope="col">Incident type</th>
                <th scope="col">Severity</th>
                <th scope="col">Owner</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="incident-security-table__reference">
                    {row.reference}
                  </td>
                  <td>
                    {campuses.find((campus) => campus.code === row.campus)?.label ??
                      formatCode(row.campus)}
                  </td>
                  <td>
                    {categories.find((category) => category.code === row.category)
                      ?.label ?? formatCode(row.category)}
                  </td>
                  <td>
                    <span
                      className={`incident-security-severity-pill incident-security-severity-pill--${row.severity.toLowerCase()}`}
                    >
                      {formatCode(row.severity)}
                    </span>
                  </td>
                  <td>{row.owner || "Unassigned"}</td>
                  <td>
                    <div className="incident-security-table__status-list">
                      {row.overdue && (
                        <span className="incident-security-status incident-security-status--danger">
                          Overdue
                        </span>
                      )}
                      {row.escalated_to && (
                        <span className="incident-security-status incident-security-status--warning">
                          Escalated
                        </span>
                      )}
                      {!row.overdue && !row.escalated_to && (
                        <span className="incident-security-status">
                          {formatCode(row.status)}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="incident-security-panel__empty">
          No open incidents currently need attention.
        </p>
      )}
    </article>
  );
}
