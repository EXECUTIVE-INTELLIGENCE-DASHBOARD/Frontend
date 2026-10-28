import {
  UsersRound,
  CalendarCheck,
  BriefcaseBusiness,
} from "lucide-react";

import "./OverviewCards.css";

interface OverviewCardsProps {
  enrolment: number | null;
  attendance: number | null;
  staffing: number | null;
}

function formatNumber(value: number | null): string {
  return value === null ? "—" : Math.round(value).toLocaleString("en-US");
}

function formatPercent(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(1)}%`;
}

export function OverviewCards({
  enrolment,
  attendance,
  staffing,
}: OverviewCardsProps) {
  const overviewMetrics = [
    {
      id: "enrolment",
      label: "TOTAL ENROLMENT",
      value: formatNumber(enrolment),
      Icon: UsersRound,
    },
    {
      id: "attendance",
      label: "AVG. ATTENDANCE (YTD)",
      value: formatPercent(attendance),
      Icon: CalendarCheck,
    },
    {
      id: "staffing",
      label: "STAFFING HEALTH",
      value: formatPercent(staffing),
      Icon: BriefcaseBusiness,
    },
  ];

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