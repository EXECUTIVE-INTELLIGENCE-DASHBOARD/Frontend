import { Users, Gavel, BellRing } from "lucide-react";

import "./AttendanceSummaryCards.css";

type SummaryCard = {
  id: string;
  title: string;
  value: string;
  suffix?: string;
  icon: typeof Users;
  tone: "attendance" | "discipline" | "suspension";
};

const summaryCards: SummaryCard[] = [
  {
    id: "attendance",
    title: "Avg Weekly Attendance",
    value: "94.8%",
    icon: Users,
    tone: "attendance",
  },
  {
    id: "discipline",
    title: "Total Discipline Incidents",
    value: "15",
    suffix: "Cases",
    icon: Gavel,
    tone: "discipline",
  },
  {
    id: "suspension",
    title: "Active Suspensions",
    value: "6",
    suffix: "Cases",
    icon: BellRing,
    tone: "suspension",
  },
];

export function AttendanceSummaryCards() {
  return (
    <section
      className="attendance-summary"
      aria-label="Attendance summary"
    >
      {summaryCards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.id}
            className={`attendance-summary__card attendance-summary__card--${card.tone}`}
          >
            <div className="attendance-summary__top">
              <h3 className="attendance-summary__title">
                {card.title}
              </h3>

              <span className="attendance-summary__icon">
                <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
              </span>
            </div>

            <div className="attendance-summary__metrics">
              <span className="attendance-summary__value">
                {card.value}
              </span>

              {card.suffix && (
                <span className="attendance-summary__suffix">
                  {card.suffix}
                </span>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}