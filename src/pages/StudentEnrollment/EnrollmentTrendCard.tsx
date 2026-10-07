import { ChevronDown, TrendingUp } from "lucide-react";

import {
  enrollmentSeries,
  trendCaptionHighlight,
  trendCaptionLead,
  trendCaptionTail,
  trendPeriodLabel,
  trendTerms,
} from "./studentEnrollment.data";

const WIDTH = 620;
const HEIGHT = 262;
const PAD = { top: 18, right: 18, bottom: 32, left: 48 };
const MIN = 0;
const MAX = 5000;
const TICKS = [0, 2500, 5000];

const plotWidth = WIDTH - PAD.left - PAD.right;
const plotHeight = HEIGHT - PAD.top - PAD.bottom;
const step = plotWidth / (trendTerms.length - 1);

const toX = (index: number) => PAD.left + index * step;
const toY = (value: number) =>
  PAD.top + plotHeight - ((value - MIN) / (MAX - MIN)) * plotHeight;

const toLine = (values: number[]) =>
  values
    .map((value, index) => `${index === 0 ? "M" : "L"} ${toX(index)} ${toY(value)}`)
    .join(" ");

const toPoints = (values: number[]) =>
  values.map((value, index) => `${toX(index)},${toY(value)}`).join(" ");

const formatTick = (value: number) => value.toLocaleString("en-US");

const [currentSeries, previousSeries] = enrollmentSeries;

const currentArea = `${toLine(currentSeries.values)} L ${toX(
  currentSeries.values.length - 1,
)} ${PAD.top + plotHeight} L ${toX(0)} ${PAD.top + plotHeight} Z`;

export function EnrollmentTrendCard() {
  return (
    <section className="se-card se-card--chart">
      <div className="se-card__header">
        <h2 className="se-card__title">Enrollment Changes Over Time</h2>

        <div className="se-card__tools">
          <ul className="se-legend">
            {enrollmentSeries.map((series) => (
              <li key={series.id} className="se-legend__item">
                <span
                  className={
                    series.tone === "current"
                      ? "se-legend__dot"
                      : "se-legend__dash"
                  }
                  aria-hidden="true"
                />
                {series.label}
              </li>
            ))}
          </ul>

          <button type="button" className="se-select">
            {trendPeriodLabel}
            <ChevronDown size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="se-card__body">
        <svg
          className="se-chart"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Enrollment by term compared with the previous academic year"
        >
          <defs>
            <linearGradient id="se-enrollment-fill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--chart-navy)"
                stopOpacity="0.2"
              />
              <stop
                offset="100%"
                stopColor="var(--chart-navy)"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {TICKS.map((tick) => {
            const y = toY(tick);

            return (
              <g key={tick}>
                <line
                  className="se-chart__grid"
                  x1={PAD.left}
                  y1={y}
                  x2={WIDTH - PAD.right}
                  y2={y}
                />
                <text className="se-chart__tick" x={PAD.left - 10} y={y + 4}>
                  {formatTick(tick)}
                </text>
              </g>
            );
          })}

          <path className="se-chart__area" d={currentArea} />

          <polyline
            className="se-chart__line se-chart__line--previous"
            points={toPoints(previousSeries.values)}
          />

          <polyline
            className="se-chart__line se-chart__line--current"
            points={toPoints(currentSeries.values)}
          />

          {currentSeries.values.map((value, index) => (
            <circle
              key={`${currentSeries.id}-${trendTerms[index]}`}
              className="se-chart__point"
              cx={toX(index)}
              cy={toY(value)}
              r={3.5}
            />
          ))}

          {previousSeries.values.map((value, index) => (
            <circle
              key={`${previousSeries.id}-${trendTerms[index]}`}
              className="se-chart__point se-chart__point--previous"
              cx={toX(index)}
              cy={toY(value)}
              r={3}
            />
          ))}

          {trendTerms.map((term, index) => (
            <text
              key={term}
              className="se-chart__label"
              x={toX(index)}
              y={HEIGHT - 10}
            >
              {term}
            </text>
          ))}
        </svg>

        <p className="se-chart__caption">
          <TrendingUp size={14} aria-hidden="true" />
          {trendCaptionLead} <strong>{trendCaptionHighlight}</strong>{" "}
          {trendCaptionTail}
        </p>
      </div>
    </section>
  );
}
