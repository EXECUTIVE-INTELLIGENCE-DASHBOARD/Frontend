import { BookOpenCheck, UsersRound, Award } from "lucide-react";

import "./AcademicSummary.css";

const summaryMetrics = [
  {
    id: "syllabus",
    title: "Syllabus Coverage",
    value: "78%",
    detail: "156 of 200 topics covered",
    icon: BookOpenCheck,
  },
  {
    id: "performance",
    title: "Student Performance",
    value: "82.4%",
    detail: "824 of 1,000 students assessed",
    icon: UsersRound,
  },
  {
    id: "average-grade",
    title: "Average Grade",
    value: "B",
    detail: "Based on recorded assessments",
    icon: Award,
  },
];

export function AcademicSummary() {
  return (
    <section className="acad-summary" aria-label="Academic performance summary">
      {summaryMetrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <article className="acad-metric" key={metric.id}>
            <span className="acad-metric__icon" aria-hidden="true">
              <Icon size={18} strokeWidth={1.7} />
            </span>

            <div className="acad-metric__content">
              <span className="acad-metric__label">{metric.title}</span>

              <h2 className="acad-metric__value">{metric.value}</h2>

              <span className="acad-metric__detail">{metric.detail}</span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
