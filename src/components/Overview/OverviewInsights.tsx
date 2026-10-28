import type { IncidentDashboardData } from "../../pages/operations/incidentSecurity.types";

import "./OverviewInsights.css";

function IncidentsPanel({ data }: { data: IncidentDashboardData | null }) {
  const categories = [...(data?.by_category ?? [])]
    .sort((a, b) => b.incidents - a.incidents)
    .slice(0, 4);
  const maximum = Math.max(0, ...categories.map(({ incidents }) => incidents));

  return (
    <article className="overview-insight-card overview-incidents-card">
      <h2 className="overview-insight-card__heading">
        Incidents &amp; Disciplinary Cases
      </h2>

      <div className="overview-incidents-list">
        {data === null ? (
          <p className="overview-insight-empty" role="status">
            Incident data is unavailable.
          </p>
        ) : categories.length === 0 ? (
          <p className="overview-insight-empty" role="status">
            No incidents were recorded for this selection.
          </p>
        ) : (
          categories.map((incident) => (
            <div
              className="overview-incident"
              key={incident.code}
            >
              <div className="overview-incident__details">
                <span className="overview-incident__label">
                  {incident.label}
                </span>
                <span className="overview-incident__figures">
                  <strong>{incident.incidents.toLocaleString("en-US")}</strong>
                  {" recorded"}
                </span>
              </div>

              <div
                className="overview-incident__track"
                role="progressbar"
                aria-label={`${incident.label} relative incident count`}
                aria-valuemin={0}
                aria-valuemax={maximum}
                aria-valuenow={incident.incidents}
              >
                <div
                  className="overview-incident__fill"
                  style={{
                    width: `${maximum > 0 ? (incident.incidents / maximum) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="overview-incidents-legend">
        <span className="overview-incidents-legend__item">
          <span className="overview-incidents-legend__swatch overview-incidents-legend__swatch--actual" />
          Recorded incidents (bars scaled to highest category)
        </span>
      </div>
    </article>
  );
}

function CapitalProjectsPanel() {
  return (
    <article className="overview-insight-card overview-projects-card">
      <h2 className="overview-insight-card__heading">
        Facilities &amp; Ops - Capital Projects
      </h2>

      <div className="overview-projects-list" role="status">
        <p className="overview-insight-empty">
          Capital project progress is not available from the backend.
        </p>
      </div>
    </article>
  );
}

export function OverviewInsights({
  incidents,
}: {
  incidents: IncidentDashboardData | null;
}) {
  return (
    <section
      className="overview-insights"
      aria-label="Incidents and capital projects"
    >
      <IncidentsPanel data={incidents} />
      <CapitalProjectsPanel />
    </section>
  );
}