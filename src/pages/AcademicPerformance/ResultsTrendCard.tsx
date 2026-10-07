import { TrendingUp } from "lucide-react";

import { resultsTrend } from "./academicPerformance.data";

const WIDTH = 520;
const HEIGHT = 250;
const PAD = { top: 16, right: 16, bottom: 30, left: 34 };
const MIN = 70;
const MAX = 95;
const TICKS = [70, 75, 80, 85, 90, 95];

const plotWidth = WIDTH - PAD.left - PAD.right;
const plotHeight = HEIGHT - PAD.top - PAD.bottom;
const step = plotWidth / (resultsTrend.length - 1);

const toX = (index: number) => PAD.left + index * step;
const toY = (value: number) =>
  PAD.top + plotHeight - ((value - MIN) / (MAX - MIN)) * plotHeight;

const classPoints = resultsTrend
  .map((point, index) => `${toX(index)},${toY(point.classAverage)}`)
  .join(" ");

const schoolPoints = resultsTrend
  .map((point, index) => `${toX(index)},${toY(point.schoolAverage)}`)
  .join(" ");

const classLine = resultsTrend
  .map((point, index) =>
    `${index === 0 ? "M" : "L"} ${toX(index)} ${toY(point.classAverage)}`,
  )
  .join(" ");

const classArea = `${classLine} L ${toX(resultsTrend.length - 1)} ${
  PAD.top + plotHeight
} L ${toX(0)} ${PAD.top + plotHeight} Z`;

export function ResultsTrendCard() {
  return (
    <section className="ap-card ap-card--chart">
      <div className="ap-card__header">
        <h2 className="ap-card__title">Academic Results Over Time</h2>

        <ul className="ap-legend">
          <li className="ap-legend__item">
            <span className="ap-legend__dot" aria-hidden="true" />
            Class Average
          </li>
          <li className="ap-legend__item">
            <span className="ap-legend__dash" aria-hidden="true" />
            School Average
          </li>
        </ul>
      </div>

      <div className="ap-card__body">
        <svg
          className="ap-chart"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Class average compared with school average across the year"
        >
          <defs>
            <linearGradient id="ap-trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--chart-blue)"
                stopOpacity="0.24"
              />
              <stop
                offset="100%"
                stopColor="var(--chart-blue)"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {TICKS.map((tick) => {
            const y = toY(tick);

            return (
              <g key={tick}>
                <line
                  className="ap-chart__grid"
                  x1={PAD.left}
                  y1={y}
                  x2={WIDTH - PAD.right}
                  y2={y}
                />
                <text className="ap-chart__tick" x={PAD.left - 8} y={y + 4}>
                  {tick}
                </text>
              </g>
            );
          })}

          <path className="ap-chart__area" d={classArea} />

          <polyline className="ap-chart__line ap-chart__line--school" points={schoolPoints} />

          <polyline className="ap-chart__line ap-chart__line--class" points={classPoints} />

          {resultsTrend.map((point, index) => (
            <circle
              key={point.id}
              className="ap-chart__point"
              cx={toX(index)}
              cy={toY(point.classAverage)}
              r={3.5}
            />
          ))}

          {resultsTrend.map((point, index) => (
            <text
              key={point.id}
              className="ap-chart__label"
              x={toX(index)}
              y={HEIGHT - 10}
            >
              {point.label}
            </text>
          ))}
        </svg>

        <p className="ap-chart__caption">
          <TrendingUp size={14} aria-hidden="true" />
          <strong>+8.9 pts</strong> vs Term 1 · <strong>+4.2 pts</strong> vs Term 2
        </p>
      </div>
    </section>
  );
}
