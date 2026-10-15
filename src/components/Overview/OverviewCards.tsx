import {
  UsersRound,
  CalendarCheck,
  BriefcaseBusiness,
} from "lucide-react";

import "./OverviewCards.css";

const overviewMetrics = [
  {
    id: "enrolment",
    label: "TOTAL ENROLMENT",
    value: "2,800",
    Icon: UsersRound,
  },
  {
    id: "attendance",
    label: "AVG. ATTENDANCE (YTD)",
    value: "94.5%",
    Icon: CalendarCheck,
  },
  {
    id: "staffing",
    label: "STAFFING HEALTH",
    value: "98%",
    Icon: BriefcaseBusiness,
  },
];

export function OverviewCards() {
  return (
    <section
      className="overview-cards"
      aria-label="Executive performance summary"
    >
      {overviewMetrics.map(({ id, label, value, Icon }) => (
        <article className="overview-metric-card" key={id}>
          <div className="overview-metric-card__icon">
            <Icon size={19} strokeWidth={2} aria-hidden="true" />
          </div>

          <div className="overview-metric-card__content">
            <p className="overview-metric-card__label">{label}</p>
            <p className="overview-metric-card__value">{value}</p>
          </div>
        </article>
      ))}
    </section>
  );
}