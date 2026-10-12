import { TrendingDown, TrendingUp } from "lucide-react";

import {
  subjectSignals,
  subjectSignalsNote,
} from "./academicPerformance.data";
import type { SignalTone } from "./academicPerformance.types";

const signalLabels: Record<SignalTone, string> = {
  strong: "Strong",
  steady: "Steady",
  watch: "Watch",
};

function formatChange(value: number) {
  return `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(1)} pp`;
}

export function SubjectSignalsCard() {
  return (
    <section className="ap-card">
      <div className="ap-card__header">
        <h2 className="ap-card__title">
          Subject Performance &amp; Priority Signals
        </h2>
      </div>

      <div className="ap-table-wrap">
        <table className="ap-table">
          <thead>
            <tr>
              <th scope="col">Subject</th>
              <th scope="col">Term 2</th>
              <th scope="col">Term 3</th>
              <th scope="col">Change</th>
            </tr>
          </thead>

          <tbody>
            {subjectSignals.map((row) => {
              const change = row.term3 - row.term2;
              const TrendIcon = change >= 0 ? TrendingUp : TrendingDown;

              return (
                <tr key={row.id}>
                  <td className="ap-table__strong">{row.subject}</td>
                  <td>{row.term2.toFixed(1)}%</td>
                  <td>{row.term3.toFixed(1)}%</td>
                  <td>
                    <span
                      className={
                        change >= 0
                          ? "ap-change ap-change--up"
                          : "ap-change ap-change--down"
                      }
                    >
                      <TrendIcon size={12} aria-hidden="true" />
                      {formatChange(change)}
                    </span>
                    <span className={`ap-signal ap-signal--${row.signal}`}>
                      {signalLabels[row.signal]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="ap-card__footnote">{subjectSignalsNote}</p>
    </section>
  );
}
