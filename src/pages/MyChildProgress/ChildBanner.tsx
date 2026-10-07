import {
  childActiveTab,
  childInitials,
  childMeta,
  childName,
  childNote,
  childTabs,
} from "./myChildProgress.data";

export function ChildBanner() {
  return (
    <section className="mc-child">
      <span className="mc-child__avatar" aria-hidden="true">
        {childInitials}
      </span>

      <div className="mc-child__text">
        <p className="mc-child__name">
          {childName}
          <span className="mc-child__meta">{childMeta}</span>
        </p>

        <p className="mc-child__note">{childNote}</p>
      </div>

      <div className="mc-child__tabs" role="group" aria-label="Child views">
        {childTabs.map((tab) => {
          const isActive = tab.label === childActiveTab;

          return (
            <button
              key={tab.id}
              type="button"
              className={
                isActive
                  ? "mc-child__tab mc-child__tab--active"
                  : "mc-child__tab"
              }
              aria-current={isActive ? "true" : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
