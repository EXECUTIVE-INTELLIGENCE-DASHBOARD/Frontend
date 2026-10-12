import {
  supportPlanAction,
  supportPlanDue,
  supportPlanFootnote,
  supportPlanLabel,
  supportPlanOwner,
  supportPlanSummary,
} from "./myChildProgress.data";

export function SupportPlanCard() {
  return (
    <section className="mc-card">
      <div className="mc-card__header">
        <h2 className="mc-card__title">Flagged Support Need</h2>
      </div>

      <div className="mc-card__body">
        <div className="mc-callout">
          <span className="mc-callout__label">{supportPlanLabel}</span>

          <p className="mc-callout__body">{supportPlanSummary}</p>

          <ul className="mc-callout__meta">
            <li>
              <span>Owner</span>
              <strong>{supportPlanOwner}</strong>
            </li>

            <li>
              <span>Due</span>
              <strong>{supportPlanDue}</strong>
            </li>
          </ul>
        </div>

        <div className="mc-actions">
          <button type="button" className="mc-button">
            {supportPlanAction}
          </button>
        </div>
      </div>

      <p className="mc-card__footnote">{supportPlanFootnote}</p>
    </section>
  );
}
