import { acquisitionCallouts, acquisitionFootnote } from "./libraryResourceUsage.data";

export function AcquisitionCard() {
  return (
    <section className="lr-card">
      <div className="lr-card__header">
        <h2 className="lr-card__title">Shortages &amp; Acquisition Planning</h2>
      </div>

      <div className="lr-card__body">
        <ul className="lr-callouts">
          {acquisitionCallouts.map((callout) => (
            <li
              key={callout.id}
              className={`lr-callout lr-callout--${callout.tone}`}
            >
              <span className="lr-callout__label">{callout.label}</span>

              <p className="lr-callout__body">{callout.body}</p>
            </li>
          ))}
        </ul>
      </div>

      <p className="lr-card__footnote">{acquisitionFootnote}</p>
    </section>
  );
}
