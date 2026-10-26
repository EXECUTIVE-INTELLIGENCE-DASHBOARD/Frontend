import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { academicYearOptions } from "../../lib/organisation";
import { academicYear, metrics } from "./academicOverview.data";
import { StatCard } from "./StatCard";
import { StudentRetention } from "./StudentRetention";
import { SubjectPerformance } from "./SubjectPerformance";
import { SupportRadar } from "./SupportRadar";

import "./AcademicOverview.css";

export function AcademicOverview() {
  const [year, setYear] = useState(academicYear);

  return (
    <div className="academic-overview">
      <div className="ao-heading">
        <div className="ao-heading__text">
          <p className="ao-heading__subtitle">
            A snapshot of enrolment, attendance, academic performance and campus
            safety.
          </p>
        </div>

        <div className="ao-year">
          <span className="ao-year__label" aria-hidden="true">
            Select Academic Year
          </span>

          <span className="ao-year__value" aria-hidden="true">
            {year}
            <ChevronDown size={16} aria-hidden="true" />
          </span>

          <select
            className="ao-year__select"
            aria-label="Select Academic Year"
            value={year}
            onChange={(event) => setYear(event.target.value)}
          >
            {academicYearOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
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
