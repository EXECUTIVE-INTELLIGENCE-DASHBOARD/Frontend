import { ChevronDown } from "lucide-react";

import { academicYear, metrics } from "./academicOverview.data";
import { StatCard } from "./StatCard";
import { StudentRetention } from "./StudentRetention";
import { SubjectPerformance } from "./SubjectPerformance";
import { SupportRadar } from "./SupportRadar";

import "./AcademicOverview.css";

export function AcademicOverview() {
  return (
    <div className="academic-overview">
      <div className="ao-heading">
        <div className="ao-heading__text">
          <h1 className="ao-heading__title">Academic Overview</h1>
          <p className="ao-heading__subtitle">
            A snapshot of enrolment, attendance, academic performance and campus
            safety.
          </p>
        </div>

        <button type="button" className="ao-year">
          <span className="ao-year__label">Select Academic Year</span>

          <span className="ao-year__value">
            {academicYear}
            <ChevronDown size={16} aria-hidden="true" />
          </span>
        </button>
      </div>

      <section className="ao-metrics" aria-label="Key academic metrics">
        {metrics.map((metric) => (
          <StatCard key={metric.id} metric={metric} />
        ))}
      </section>

      <div className="ao-split">
        <SubjectPerformance />
        <StudentRetention />
      </div>

      <SupportRadar />
    </div>
  );
}
