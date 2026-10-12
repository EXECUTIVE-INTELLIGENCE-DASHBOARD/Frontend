/**
 * "Monthly Spend Against Budget" card — a hand-rolled SVG line chart.
 *
 * No charting library is used anywhere in this dashboard; charts are plain
 * `<svg>` driven by a `viewBox`, which keeps the bundle small and lets the
 * colours come from the same CSS custom properties as the rest of the app.
 * The recipe is the same one `ResultsTrendCard` uses on Academic Performance.
 *
 * Two series are drawn:
 *   - Actual  — solid line with a soft gradient fill underneath
 *   - Budget  — dashed grey line, drawn *before* the actual line so the
 *               emphasis stays on actual spend
 *
 * Everything below is computed once at module scope, because the data is
 * static. With live data this would move inside the component.
 */
import { TrendingUp } from "lucide-react";

import {
  formatUgx,
  peakSpendMonth,
  spendTrend,
  trendActualTotal,
  trendBudgetTotal,
} from "./expenseManagement.data";

/**
 * The SVG's internal coordinate system. Because the element is sized with
 * `width: 100%`, these numbers are a *ratio*, not pixels — the browser scales
 * the whole drawing to whatever width the card gives it.
 */
const WIDTH = 520;
const HEIGHT = 250;

/**
 * Space reserved inside the viewBox for axis labels. `left` has to fit the
 * y-axis numbers, `bottom` the month names.
 */
const PAD = { top: 16, right: 16, bottom: 30, left: 40 };

/**
 * The y-axis range. Hard-coded to 40-60M rather than derived from the data so
 * the axis does not jump around as figures change; all sample values sit
 * comfortably inside it.
 */
const MIN = 40;
const MAX = 60;
const TICKS = [40, 45, 50, 55, 60];

/** Size of the drawing area once the padding is removed. */
const plotWidth = WIDTH - PAD.left - PAD.right;
const plotHeight = HEIGHT - PAD.top - PAD.bottom;

/** Horizontal gap between two adjacent months. */
const step = plotWidth / (spendTrend.length - 1);

/**
 * Data coordinates -> SVG coordinates.
 *
 * `toX` spaces months evenly across the plot. `toY` is inverted on purpose:
 * SVG y grows downwards, but a bigger value should sit higher on screen, so
 * the scaled value is subtracted from the bottom edge.
 */
const toX = (index: number) => PAD.left + index * step;
const toY = (value: number) =>
  PAD.top + plotHeight - ((value - MIN) / (MAX - MIN)) * plotHeight;

/** "x,y x,y ..." pairs for `<polyline>`, one per month. */
const actualPoints = spendTrend
  .map((point, index) => `${toX(index)},${toY(point.actual)}`)
  .join(" ");

const budgetPoints = spendTrend
  .map((point, index) => `${toX(index)},${toY(point.budget)}`)
  .join(" ");

/**
 * The same actual series expressed as an SVG *path*, which `<polyline>` cannot
 * be. `M` moves to the first month, `L` draws a line to each month after it.
 */
const actualLine = spendTrend
  .map(
    (point, index) =>
      `${index === 0 ? "M" : "L"} ${toX(index)} ${toY(point.actual)}`,
  )
  .join(" ");

/**
 * Closes the line into a filled shape by running along the baseline from the
 * last month back to the first, then `Z` to close the path. This is what the
 * gradient `<defs>` below fills.
 */
const actualArea = `${actualLine} L ${toX(
  spendTrend.length - 1,
)} ${PAD.top + plotHeight} L ${toX(0)} ${PAD.top + plotHeight} Z`;

/** Positive means total spend ran over the total budget. */
const budgetDifference = trendActualTotal - trendBudgetTotal;

export function SpendTrendCard() {
  return (
    <section className="exp-card">
      <div className="exp-card__header">
        <h2 className="exp-card__title">Monthly Spend Against Budget</h2>

        <ul className="exp-legend">
          <li className="exp-legend__item">
            <span className="exp-legend__dot" aria-hidden="true" />
            Actual
          </li>

          <li className="exp-legend__item">
            <span className="exp-legend__dash" aria-hidden="true" />
            Budget
          </li>
        </ul>
      </div>

      <div className="exp-card__body">
        <svg
          className="exp-chart"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Monthly operating spend compared with the monthly budget"
        >
          {/* Gradient fill under the actual line. The `id` must be unique
              across the whole document — a second chart reusing
              "exp-trend-fill" would pick up this definition instead. */}
          <defs>
            <linearGradient id="exp-trend-fill" x1="0" y1="0" x2="0" y2="1">
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

          {/* Horizontal grid lines plus their y-axis value. */}
          {TICKS.map((tick) => {
            const y = toY(tick);

            return (
              <g key={tick}>
                <line
                  className="exp-chart__grid"
                  x1={PAD.left}
                  y1={y}
                  x2={WIDTH - PAD.right}
                  y2={y}
                />

                {/* Nudged down 4px so the number sits centred on its line. */}
                <text className="exp-chart__tick" x={PAD.left - 8} y={y + 4}>
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Draw order matters: fill, then budget, then actual, then dots. */}
          <path className="exp-chart__area" d={actualArea} />

          <polyline
            className="exp-chart__line exp-chart__line--budget"
            points={budgetPoints}
          />

          <polyline
            className="exp-chart__line exp-chart__line--actual"
            points={actualPoints}
          />

          {/* A marker on every actual data point. */}
          {spendTrend.map((point, index) => (
            <circle
              key={point.id}
              className="exp-chart__point"
              cx={toX(index)}
              cy={toY(point.actual)}
              r={3.5}
            />
          ))}

          {/* Month names along the bottom, anchored to the same x positions. */}
          {spendTrend.map((point, index) => (
            <text
              key={point.id}
              className="exp-chart__label"
              x={toX(index)}
              y={HEIGHT - 10}
            >
              {point.label}
            </text>
          ))}
        </svg>

        {/* Summary line under the chart. Every figure here is derived from the
            same data the chart plots, so the two cannot drift apart. */}
        <p className="exp-chart__caption">
          <TrendingUp size={14} aria-hidden="true" />

          <strong>{formatUgx(trendActualTotal)}</strong> spent against{" "}
          <strong>{formatUgx(trendBudgetTotal)}</strong> budgeted ·{" "}
          {budgetDifference >= 0 ? "+" : "−"}
          {Math.abs(budgetDifference).toFixed(1)}M · peak in{" "}
          {peakSpendMonth.label}
        </p>
      </div>
    </section>
  );
}
