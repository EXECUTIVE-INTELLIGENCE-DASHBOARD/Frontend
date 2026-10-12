import {
  pathwayComparisons,
  pathwayNote,
} from "./academicPerformance.data";

export function SciencesArtsCard() {
  return (
    <section className="ap-card">
      <div className="ap-card__header">
        <h2 className="ap-card__title">Sciences &amp; Arts Comparison</h2>
      </div>

      <div className="ap-card__body">
        <ul className="ap-pathways">
          {pathwayComparisons.map((pathway) => (
            <li key={pathway.id} className="ap-pathway">
              <div className="ap-pathway__head">
                <span className="ap-pathway__name">{pathway.pathway}</span>
                <span className="ap-pathway__value">{pathway.value}%</span>
              </div>

              <div
                className="ap-pathway__track"
                role="progressbar"
                aria-label={`${pathway.pathway} pass rate`}
                aria-valuenow={pathway.value}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span
                  className={`ap-pathway__fill ap-pathway__fill--${pathway.tone}`}
                  style={{ width: `${pathway.value}%` }}
                />
              </div>

              <span className="ap-pathway__detail">{pathway.detail}</span>
            </li>
          ))}
        </ul>

        <p className="ap-card__footnote">{pathwayNote}</p>
      </div>
    </section>
  );
}
