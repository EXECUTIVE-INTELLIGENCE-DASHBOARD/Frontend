import "./OverviewInsights.css";

const incidentMetrics = [
  {
    id: "misconduct",
    label: "Academic Misconduct",
    actual: 12,
    threshold: 25,
  },
  {
    id: "behavioral",
    label: "Behavioral / Attendance",
    actual: 28,
    threshold: 40,
  },
  {
    id: "health",
    label: "Health / Minor Injuries",
    actual: 15,
    threshold: 30,
  },
  {
    id: "facilities",
    label: "Facilities / Property",
    actual: 4,
    threshold: 15,
  },
];

const capitalProjects = [
  {
    id: "stem-wing",
    name: "STEM Wing Modernization (Main Campus)",
    progress: 78,
  },
  {
    id: "solar",
    name: "Solar Power Phase II Installation",
    progress: 45,
  },
  {
    id: "sports-complex",
    name: "Sports Complex Turf Replacement",
    progress: 92,
  },
];

function IncidentsPanel() {
  return (
    <article className="overview-insight-card overview-incidents-card">
      <h2 className="overview-insight-card__heading">
        Incidents &amp; Disciplinary Cases
      </h2>

      <div className="overview-incidents-list">
        {incidentMetrics.map((incident) => {
          const percentage = Math.min(
            (incident.actual / incident.threshold) * 100,
            100,
          );

          return (
            <div
              className="overview-incident"
              key={incident.id}
            >
              <div className="overview-incident__details">
                <span className="overview-incident__label">
                  {incident.label}
                </span>

                <span className="overview-incident__figures">
                  <strong>{incident.actual}</strong>
                  {" / "}
                  {incident.threshold} Max Threshold
                </span>
              </div>

              <div
                className="overview-incident__track"
                role="progressbar"
                aria-label={`${incident.label} threshold usage`}
                aria-valuemin={0}
                aria-valuemax={incident.threshold}
                aria-valuenow={incident.actual}
              >
                <div
                  className="overview-incident__fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="overview-incidents-legend">
        <span className="overview-incidents-legend__item">
          <span className="overview-incidents-legend__swatch overview-incidents-legend__swatch--actual" />
          Recorded Actual
        </span>

        <span className="overview-incidents-legend__item">
          <span className="overview-incidents-legend__swatch overview-incidents-legend__swatch--threshold" />
          Threshold Allowance
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

      <div className="overview-projects-list">
        {capitalProjects.map((project) => (
          <div className="overview-project" key={project.id}>
            <div className="overview-project__details">
              <span className="overview-project__name">
                {project.name}
              </span>

              <span className="overview-project__percentage">
                {project.progress}%
              </span>
            </div>

            <div
              className="overview-project__track"
              role="progressbar"
              aria-label={`${project.name} completion`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={project.progress}
            >
              <div
                className="overview-project__fill"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export function OverviewInsights() {
  return (
    <section
      className="overview-insights"
      aria-label="Incidents and capital projects"
    >
      <IncidentsPanel />
      <CapitalProjectsPanel />
    </section>
  );
}