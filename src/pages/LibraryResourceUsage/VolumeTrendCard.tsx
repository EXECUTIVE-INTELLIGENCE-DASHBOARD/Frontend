import { ChevronDown, TrendingUp } from "lucide-react";

import {
  volumeCaptionHighlight,
  volumeCaptionLead,
  volumeCaptionTail,
  volumeMonths,
  volumePeriodLabel,
  volumeSeries,
} from "./libraryResourceUsage.data";

const WIDTH = 620;
const HEIGHT = 262;
const PAD = { top: 18, right: 18, bottom: 32, left: 48 };
const MIN = 0;
const MAX = 500;
const TICKS = [0, 100, 200, 300, 400, 500];

const plotWidth = WIDTH - PAD.left - PAD.right;
const plotHeight = HEIGHT - PAD.top - PAD.bottom;
const step = plotWidth / (volumeMonths.length - 1);

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

const [checkoutSeries, returnSeries] = volumeSeries;

const checkoutArea = `${toLine(checkoutSeries.values)} L ${toX(
  checkoutSeries.values.length - 1,
)} ${PAD.top + plotHeight} L ${toX(0)} ${PAD.top + plotHeight} Z`;

export function VolumeTrendCard() {
  return (
    <section className="lr-card lr-card--chart">
      <div className="lr-card__header">
        <h2 className="lr-card__title">Checkout &amp; Return Volumes</h2>

        <div className="lr-card__tools">
          <ul className="lr-legend">
            {volumeSeries.map((series) => (
              <li key={series.id} className="lr-legend__item">
                <span
                  className={
                    series.tone === "checkouts"
                      ? "lr-legend__dot"
                      : "lr-legend__dash"
                  }
                  aria-hidden="true"
                />
                {series.label}
              </li>
            ))}
          </ul>

          <button type="button" className="lr-select">
            {volumePeriodLabel}
            <ChevronDown size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="lr-card__body">
        <svg
          className="lr-chart"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Monthly library checkouts compared with returns"
        >
          <defs>
            <linearGradient id="lr-volume-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-navy)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--chart-navy)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {TICKS.map((tick) => {
            const y = toY(tick);

            return (
              <g key={tick}>
                <line
                  className="lr-chart__grid"
                  x1={PAD.left}
                  y1={y}
                  x2={WIDTH - PAD.right}
                  y2={y}
                />
                <text className="lr-chart__tick" x={PAD.left - 10} y={y + 4}>
                  {formatTick(tick)}
                </text>
              </g>
            );
          })}

          <path className="lr-chart__area" d={checkoutArea} />

          <polyline
            className="lr-chart__line lr-chart__line--returns"
            points={toPoints(returnSeries.values)}
          />

          <polyline
            className="lr-chart__line lr-chart__line--checkouts"
            points={toPoints(checkoutSeries.values)}
          />

          {checkoutSeries.values.map((value, index) => (
            <circle
              key={`${checkoutSeries.id}-${volumeMonths[index]}`}
              className="lr-chart__point"
              cx={toX(index)}
              cy={toY(value)}
              r={3.5}
            />
          ))}

          {returnSeries.values.map((value, index) => (
            <circle
              key={`${returnSeries.id}-${volumeMonths[index]}`}
              className="lr-chart__point lr-chart__point--returns"
              cx={toX(index)}
              cy={toY(value)}
              r={3}
            />
          ))}

          {volumeMonths.map((month, index) => (
            <text
              key={month}
              className="lr-chart__label"
              x={toX(index)}
              y={HEIGHT - 10}
            >
              {month}
            </text>
          ))}
        </svg>

        <p className="lr-chart__caption">
          <TrendingUp size={14} aria-hidden="true" />
          {volumeCaptionLead} <strong>{volumeCaptionHighlight}</strong>{" "}
          {volumeCaptionTail}
        </p>
      </div>
    </section>
  );
}
