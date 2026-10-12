import { ChevronDown, TrendingUp } from "lucide-react";

import {
  progressCaptionHighlight,
  progressCaptionLead,
  progressCaptionTail,
  progressHighlightLead,
  progressHighlightValue,
  progressNote,
  progressSeries,
  progressTerms,
} from "./myChildProgress.data";

const WIDTH = 620;
const HEIGHT = 262;
const PAD = { top: 18, right: 18, bottom: 32, left: 46 };
const MIN = 60;
const MAX = 100;
const TICKS = [60, 70, 80, 90, 100];

const reportLabel = "Term 3";

const plotWidth = WIDTH - PAD.left - PAD.right;
const plotHeight = HEIGHT - PAD.top - PAD.bottom;
const step = plotWidth / (progressTerms.length - 1);

const toX = (index: number) => PAD.left + index * step;
const toY = (value: number) =>
  PAD.top + plotHeight - ((value - MIN) / (MAX - MIN)) * plotHeight;

const toLine = (values: number[]) =>
  values
    .map((value, index) => `${index === 0 ? "M" : "L"} ${toX(index)} ${toY(value)}`)
    .join(" ");

const toPoints = (values: number[]) =>
  values.map((value, index) => `${toX(index)},${toY(value)}`).join(" ");

const formatTick = (value: number) => `${value}%`;

const [allSeries, subjectSeries] = progressSeries;

const allArea = `${toLine(allSeries.values)} L ${toX(
  allSeries.values.length - 1,
)} ${PAD.top + plotHeight} L ${toX(0)} ${PAD.top + plotHeight} Z`;

export function ProgressTrendCard() {
  return (
    <section className="mc-card">
      <div className="mc-card__header">
        <h2 className="mc-card__title">Reporting Period Progress</h2>

        <div className="mc-card__tools">
          <ul className="mc-legend">
            {progressSeries.map((series) => (
              <li key={series.id} className="mc-legend__item">
                <span
                  className={
                    series.tone === "all"
                      ? "mc-legend__dot"
                      : "mc-legend__dash"
                  }
                  aria-hidden="true"
                />
                {series.label}
              </li>
            ))}
          </ul>

          <button type="button" className="mc-select">
            {reportLabel}
            <ChevronDown size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mc-card__body">
        <svg
          className="mc-chart"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Average subject score by reporting period"
        >
          <defs>
            <linearGradient id="mc-progress-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-navy)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--chart-navy)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {TICKS.map((tick) => {
            const y = toY(tick);

            return (
              <g key={tick}>
                <line
                  className="mc-chart__grid"
                  x1={PAD.left}
                  y1={y}
                  x2={WIDTH - PAD.right}
                  y2={y}
                />
                <text className="mc-chart__tick" x={PAD.left - 10} y={y + 4}>
                  {formatTick(tick)}
                </text>
              </g>
            );
          })}

          <path className="mc-chart__area" d={allArea} />

          <polyline
            className="mc-chart__line mc-chart__line--subject"
            points={toPoints(subjectSeries.values)}
          />

          <polyline
            className="mc-chart__line mc-chart__line--all"
            points={toPoints(allSeries.values)}
          />

          {allSeries.values.map((value, index) => (
            <circle
              key={`${allSeries.id}-${progressTerms[index]}`}
              className="mc-chart__point"
              cx={toX(index)}
              cy={toY(value)}
              r={3.5}
            />
          ))}

          {subjectSeries.values.map((value, index) => (
            <circle
              key={`${subjectSeries.id}-${progressTerms[index]}`}
              className="mc-chart__point mc-chart__point--subject"
              cx={toX(index)}
              cy={toY(value)}
              r={3.5}
            />
          ))}

          {progressTerms.map((term, index) => (
            <text
              key={term}
              className="mc-chart__label"
              x={toX(index)}
              y={HEIGHT - 10}
            >
              {term}
            </text>
          ))}
        </svg>

        <span className="mc-chip">
          {progressHighlightLead}
          <strong>{progressHighlightValue}</strong>
        </span>

        <p className="mc-chart__caption">
          <TrendingUp size={14} aria-hidden="true" />
          {progressCaptionLead} <strong>{progressCaptionHighlight}</strong>{" "}
          {progressCaptionTail}
        </p>
      </div>

      <p className="mc-card__footnote">{progressNote}</p>
    </section>
  );
}
