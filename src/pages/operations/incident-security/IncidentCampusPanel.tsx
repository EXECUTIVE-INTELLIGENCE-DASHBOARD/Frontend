import { ShieldCheck } from "lucide-react";

import type { IncidentDashboardData } from "../incidentSecurity.types";

interface IncidentCampusPanelProps {
  data: IncidentDashboardData;
}

export function IncidentCampusPanel({ data }: IncidentCampusPanelProps) {
  return (
    <article className="incident-security-panel">
      <div className="incident-security-panel__heading">
        <div>
          <h2>Campus Overview</h2>
        </div>
      </div>
      <div className="incident-security-campus-list">
        {data.by_campus.map((campus) => {
          return (
            <div className="incident-security-campus-row" key={campus.code}>
              <span
                className="incident-security-campus-row__icon"
                aria-hidden="true"
              >
                <ShieldCheck size={17} />
              </span>
              <div className="incident-security-campus-row__body">
                <strong>{campus.label}</strong>
              </div>
              <span className="incident-security-campus-row__count">
                {campus.incidents.toLocaleString()}
              </span>
            </div>
          );
        })}
        {data.by_campus.length === 0 && (
          <p className="incident-security-panel__empty">
            No campus records are available.
          </p>
        )}
      </div>
    </article>
  );
}
