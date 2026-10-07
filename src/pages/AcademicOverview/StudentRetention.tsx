import { ArrowUpRight } from "lucide-react";

import { DonutChart } from "../../components/DonutChart";

import {
  retentionOverall,
  retentionSegments,
  retentionStats,
} from "./academicOverview.data";
import type { RetentionTone } from "./academicOverview.types";

const toneColors: Record<RetentionTone, string> = {
  navy: "var(--chart-navy)",
  blue: "var(--chart-blue)",
  sky: "var(--chart-sky)",
};

export function StudentRetention() {
  const segments = retentionSegments.map((segment) => ({
    id: segment.id,
    value: segment.value,
    color: toneColors[segment.tone],
  }));

  return (
    <section className="ao-card retention">
      <div className="ao-card__header">
        <h2 className="ao-card__title">Student Retention</h2>
      </div>

      <div className="retention__body">
        <DonutChart
          segments={segments}
          centerValue={`${retentionOverall}%`}
          centerLabel="Overall"
          ariaLabel="Student retention rate by school level"
        />

        <ul className="retention__legend">
          {retentionSegments.map((segment) => (
            <li key={segment.id} className="retention__legend-item">
              <span
                className="retention__dot"
                style={{ backgroundColor: toneColors[segment.tone] }}
                aria-hidden="true"
              />
              <span className="retention__legend-label">{segment.label}</span>
              <span className="retention__legend-value">{segment.value}%</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="retention__footer">
        <div className="retention__stats">
          {retentionStats.map((stat) => (
            <div key={stat.id} className="retention__stat">
              <span className="retention__stat-value">{stat.value}</span>
              <span className="retention__stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        <button type="button" className="retention__link">
          View
          <ArrowUpRight size={14} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
