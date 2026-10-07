import { pipelineLegend, pipelineStages } from "./executiveOverview.data";

export function PipelineCard() {
  return (
    <section className="eo-card">
      <div className="eo-card__header">
        <div>
          <span className="eo-card__eyebrow">Enrollment &amp; Pipeline</span>

          <h2 className="eo-card__title">Application Conversion Funnel</h2>
        </div>
      </div>

      <div className="eo-card__body">
        <div className="eo-funnel">
          {pipelineStages.map((stage) => (
            <div className="eo-funnel__row" key={stage.id}>
              <div
                className={`eo-funnel__bar eo-funnel__bar--${stage.tone}`}
                style={{ width: `${stage.width}%` }}
              >
                <span className="eo-funnel__text">
                  {stage.value} {stage.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <ul className="eo-funnel__legend">
          {pipelineLegend.map((entry) => (
            <li className="eo-funnel__legend-item" key={entry.id}>
              <span
                className={`eo-legend__dot eo-legend__dot--${entry.tone}`}
                aria-hidden="true"
              />
              {entry.label}
              <span className="eo-funnel__legend-value">{entry.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
