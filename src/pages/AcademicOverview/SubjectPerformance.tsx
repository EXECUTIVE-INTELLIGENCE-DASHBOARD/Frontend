import {
  Atom,
  BookOpen,
  Calculator,
  ChevronDown,
  Monitor,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { subjectPerformance } from "./academicOverview.data";
import type { SubjectIconName } from "./academicOverview.types";

const subjectIcons: Record<SubjectIconName, LucideIcon> = {
  science: Atom,
  maths: Calculator,
  english: BookOpen,
  ict: Monitor,
};

const numberFormatter = new Intl.NumberFormat("en-US");

export function SubjectPerformance() {
  return (
    <section className="ao-card subject-panel">
      <div className="ao-card__header">
        <h2 className="ao-card__title">Subject Performance</h2>

        <button type="button" className="ao-chip">
          All Grades
          <ChevronDown size={14} aria-hidden="true" />
        </button>
      </div>

      <div className="ao-table-wrap">
        <table className="ao-table subject-table">
          <thead>
            <tr>
              <th scope="col">Subject</th>
              <th scope="col">Graded</th>
              <th scope="col">Average</th>
              <th scope="col">Trend</th>
            </tr>
          </thead>

          <tbody>
            {subjectPerformance.map((row) => {
              const Icon = subjectIcons[row.icon];

              return (
                <tr key={row.id}>
                  <td>
                    <span className="subject-table__subject">
                      <span className="subject-table__icon" aria-hidden="true">
                        <Icon size={16} />
                      </span>
                      <span className="subject-table__name">{row.name}</span>
                    </span>
                  </td>

                  <td>
                    <span className="subject-table__graded">
                      {numberFormatter.format(row.graded)}
                    </span>
                    <span className="subject-table__caption">
                      {row.caption}
                    </span>
                  </td>

                  <td>
                    <span className="subject-table__average">
                      {row.average}%
                    </span>
                    <span className="subject-table__delta">
                      <TrendingUp size={12} aria-hidden="true" />
                      {row.delta}% vs last term
                    </span>
                  </td>

                  <td>
                    <div className="trend">
                      <div
                        className="trend__bar"
                        role="progressbar"
                        aria-label={`${row.name} average`}
                        aria-valuenow={row.average}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <span
                          className="trend__fill"
                          style={{ width: `${row.average}%` }}
                        />
                      </div>

                      <div className="trend__legend">
                        <span className="trend__legend-item">
                          Pass: {numberFormatter.format(row.pass)}
                        </span>
                        <span className="trend__legend-item trend__legend-item--fail">
                          Fail: {row.fail}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
