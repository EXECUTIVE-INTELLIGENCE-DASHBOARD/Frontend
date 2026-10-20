
import "./AttendanceTable.css";

type DisciplinaryAction = {
  id: number;
  incidentType: string;
  disciplinaryAction: string;
  severity: "High" | "Critical" | "Medium";
  totalCases: number;
  status: "Active" | "Escalated" | "Ongoing" | "Pending Review";
};

const disciplinaryActions: DisciplinaryAction[] = [
  {
    id: 1,
    incidentType: "Examination Malpractice",
    disciplinaryAction: "Suspension (2 Weeks)",
    severity: "High",
    totalCases: 4,
    status: "Active",
  },
  {
    id: 2,
    incidentType: "Severe Vandalism",
    disciplinaryAction: "Expulsion",
    severity: "Critical",
    totalCases: 1,
    status: "Escalated",
  },
  {
    id: 3,
    incidentType: "Persistent Truancy",
    disciplinaryAction: "Detention & Counseling",
    severity: "Medium",
    totalCases: 8,
    status: "Ongoing",
  },
  {
    id: 4,
    incidentType: "Physical Altercation",
    disciplinaryAction: "Suspension (1 Week)",
    severity: "High",
    totalCases: 2,
    status: "Pending Review",
  },
];

export function AttendanceTable() {
  return (
    <section
      className="attendance-table-card"
      aria-labelledby="disciplinary-actions-title"
    >
      <div className="attendance-table-card__header">
        <h2 id="disciplinary-actions-title">
          Tier 3: Aggregated Disciplinary Actions Summary
        </h2>
      </div>

      <div className="attendance-table-wrapper">
        <table className="attendance-table">
          <thead>
            <tr>
              <th scope="col">Incident Type</th>
              <th scope="col">Disciplinary Action</th>
              <th scope="col">Severity</th>
              <th scope="col">Total Cases</th>
              <th scope="col">Status</th>
            </tr>
          </thead>

          <tbody>
            {disciplinaryActions.map((item) => (
              <tr key={item.id}>
                <td>{item.incidentType}</td>
                <td>{item.disciplinaryAction}</td>
                <td>
                  <span
                    className={`attendance-table__severity attendance-table__severity--${item.severity.toLowerCase()}`}
                  >
                    {item.severity}
                  </span>
                </td>
                <td>
                  {item.totalCases}{" "}
                  {item.totalCases === 1 ? "Case" : "Cases"}
                </td>
                <td>
                  <span
                    className={`attendance-table__status attendance-table__status--${item.status.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {item.status}
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
