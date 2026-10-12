import { Plus } from "lucide-react";

import { incidentPoints, resolutionRate } from "./executiveOverview.data";

const WIDTH = 560;
const HEIGHT = 220;
const PAD = { top: 16, right: 10, bottom: 34, left: 10 };
const BAR_WIDTH = 9;
const BAR_GAP = 3;

const plotWidth = WIDTH - PAD.left - PAD.right;
const plotHeight = HEIGHT - PAD.top - PAD.bottom;
const baseline = PAD.top + plotHeight;
const groupWidth = plotWidth / incidentPoints.length;

const peak = Math.max(
  ...incidentPoints.flatMap((point) => [point.safety, point.disciplinary]),
);
const scaleMax = Math.max(4, Math.ceil(peak / 4) * 4);

const toY = (value: number) => baseline - (value / scaleMax) * plotHeight;
const groupCenter = (index: number) =>
  PAD.left + index * groupWidth + groupWidth / 2;

const gridLines = [0.25, 0.5, 0.75, 1];

export function SafetyCard() {
  return (
    <section className="eo-card">
      <div className="eo-card__header">
        <div>
          <span className="eo-card__eyebrow">Safety &amp; Discipline</span>

          <h2 className="eo-card__title">
            Incidents &amp; Disciplinary Cases (YTD)
          </h2>
        </div>

        <button className="eo-add" type="button">
          <Plus size={13} aria-hidden="true" />
          Add
        </button>
      </div>

      <div className="eo-card__body">
        <ul className="eo-legend">
          <li className="eo-legend__item">
            <span
              className="eo-legend__dot eo-legend__dot--navy"
              aria-hidden="true"
            />
            Safety Incidents
          </li>

          <li className="eo-legend__item">
            <span
              className="eo-legend__dot eo-legend__dot--sky"
              aria-hidden="true"
            />
            Disciplinary Cases
          </li>
        </ul>

        <svg
          className="eo-chart"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Monthly safety incidents and disciplinary cases for the year to date"
        >
          {gridLines.map((ratio) => (
            <line
              key={ratio}
              className="eo-chart__grid"
              x1={PAD.left}
              y1={baseline - plotHeight * ratio}
              x2={WIDTH - PAD.right}
              y2={baseline - plotHeight * ratio}
            />
          ))}

          <line
            className="eo-chart__axis"
            x1={PAD.left}
            y1={baseline}
            x2={WIDTH - PAD.right}
            y2={baseline}
          />

          {incidentPoints.map((point, index) => {
            const center = groupCenter(index);

            return (
              <g key={point.id}>
                <rect
                  className="eo-chart__bar eo-chart__bar--safety"
                  x={center - BAR_WIDTH - BAR_GAP / 2}
                  y={toY(point.safety)}
                  width={BAR_WIDTH}
                  height={baseline - toY(point.safety)}
                  rx={2.5}
                />

                <rect
                  className="eo-chart__bar eo-chart__bar--disciplinary"
                  x={center + BAR_GAP / 2}
                  y={toY(point.disciplinary)}
                  width={BAR_WIDTH}
                  height={baseline - toY(point.disciplinary)}
                  rx={2.5}
                />

                <text className="eo-chart__tick" x={center} y={baseline + 17}>
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="eo-card__footer">
        <span>Resolution Rate</span>
        <strong>{resolutionRate}</strong>
      </div>
    </section>
  );
}
