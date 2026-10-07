import {
  engagementActions,
  engagementBody,
  engagementFootnote,
  engagementTitle,
} from "./myChildProgress.data";

export function ParentEngagementCard() {
  return (
    <section className="mc-card">
      <div className="mc-card__header">
        <h2 className="mc-card__title">Parent Engagement &amp; Follow-up</h2>
      </div>

      <div className="mc-card__body">
        <p className="mc-engagement__title">{engagementTitle}</p>

        <p className="mc-engagement__body">{engagementBody}</p>

        <div className="mc-actions">
          {engagementActions.map((action, index) => (
            <button
              key={action}
              type="button"
              className={index === 0 ? "mc-button" : "mc-button mc-button--ghost"}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      <p className="mc-card__footnote">{engagementFootnote}</p>
    </section>
  );
}
