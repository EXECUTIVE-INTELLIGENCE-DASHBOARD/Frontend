import { capitalProjects, openOrders } from "./executiveOverview.data";

export function FacilitiesCard() {
  return (
    <section className="eo-card">
      <div className="eo-card__header">
        <div>
          <span className="eo-card__eyebrow">Facilities &amp; Ops</span>

          <h2 className="eo-card__title">Orders &amp; Capital Projects</h2>
        </div>
      </div>

      <div className="eo-card__body">
        <p className="eo-section-label">Open Orders</p>

        <div className="eo-orders">
          {openOrders.map((order) => (
            <div className="eo-order" key={order.id}>
              <span>
                <span className="eo-order__name">{order.name}</span>
                <span className="eo-order__date">{order.date}</span>
              </span>

              <span className={`eo-order__status eo-order__status--${order.tone}`}>
                {order.status}
              </span>
            </div>
          ))}
        </div>

        <p className="eo-section-label eo-section-label--spaced">
          Major Capital Projects
        </p>

        <div className="eo-projects">
          {capitalProjects.map((project) => (
            <div className="eo-project" key={project.id}>
              <div className="eo-project__head">
                <span className="eo-project__name">{project.name}</span>
                <span className="eo-project__value">{project.percent}%</span>
              </div>

              <div
                className="eo-project__track"
                role="progressbar"
                aria-label={project.name}
                aria-valuenow={project.percent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={`eo-project__fill eo-project__fill--${project.tone}`}
                  style={{ width: `${project.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
