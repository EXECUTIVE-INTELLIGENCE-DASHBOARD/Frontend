
import { useMemo } from "react";

import { formatNumber, formatPercent } from "./admissionsEnrollment.data";
import {
  enrollmentTrend,
  trendDelta,
  type EnrollmentTrendPoint,
} from "./admissionsEnrollment.trends";
import type { Filters } from "./admissionsEnrollment.types";

import "./EnrollmentTrends.css";

/* ------------------------------------------------------------------- Scales */

interface Axis {
  top: number;
  ticks: number[];
}

/** A rounded value axis so the gridlines read as whole numbers. */
function axisFor(max: number, tickCount = 4): Axis {
  const rough = Math.max(max, tickCount) / tickCount;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 1.5, 2, 2.5, 3, 4, 5, 10]
      .map((factor) => factor * magnitude)
      .find((candidate) => candidate >= rough) ?? magnitude * 10;
  const top = Math.ceil(max / step) * step;
  const count = Math.round(top / step);
  const ticks = Array.from({ length: count + 1 }, (_, index) => index * step);

  return { top: top || step, ticks };
}

/* -------------------------------------------------------------- Pie geometry */

/** Creates one slice of a pie chart using SVG arc geometry. */
function pieSlicePath(
  startAngle: number,
  endAngle: number,
  radius: number,
): string {
  const centre = 60;

  const startRadians = (startAngle * Math.PI) / 180;
  const endRadians = (endAngle * Math.PI) / 180;

  const startX = centre + radius * Math.cos(startRadians);
  const startY = centre + radius * Math.sin(startRadians);
  const endX = centre + radius * Math.cos(endRadians);
  const endY = centre + radius * Math.sin(endRadians);

  const angleDifference = endAngle - startAngle;
  const largeArc = angleDifference > 180 ? 1 : 0;

  return [
    `M ${centre} ${centre}`,
    `L ${startX} ${startY}`,
    `A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`,
    "Z",
  ].join(" ");
}

/* -------------------------------------------------------------- Gender chart */

/** One pie chart showing the latest selected term's gender distribution. */
function GenderPieChart({ point }: { point: EnrollmentTrendPoint }) {
  const total = point.boys + point.girls;

  if (total <= 0) {
    return (
      <p className="ae-trend__empty">
        No gender distribution data is available for this term.
      </p>
    );
  }

  const boysPercentage = (point.boys / total) * 100;
  const girlsPercentage = (point.girls / total) * 100;

  const boysEndAngle = -90 + (boysPercentage / 100) * 360;

  return (
    <div className="ae-gender-pie">
      <div className="ae-gender-pie__chart">
        <svg
          viewBox="0 0 120 120"
          role="img"
          aria-label={`${point.description}: ${formatNumber(point.boys)} boys (${boysPercentage.toFixed(1)}%) and ${formatNumber(point.girls)} girls (${girlsPercentage.toFixed(1)}%)`}
        >
          {point.boys > 0 && point.girls > 0 ? (
            <>
              <path
                d={pieSlicePath(-90, boysEndAngle, 54)}
                className="ae-trend__pie-slice ae-trend__pie-slice--boys"
              />

              <path
                d={pieSlicePath(boysEndAngle, 270, 54)}
                className="ae-trend__pie-slice ae-trend__pie-slice--girls"
              />
            </>
          ) : point.boys > 0 ? (
            <circle
              cx="60"
              cy="60"
              r="54"
              className="ae-trend__pie-slice ae-trend__pie-slice--boys"
            />
          ) : (
            <circle
              cx="60"
              cy="60"
              r="54"
              className="ae-trend__pie-slice ae-trend__pie-slice--girls"
            />
          )}
        </svg>
      </div>

      <div className="ae-gender-pie__details">
        <div className="ae-gender-pie__total">
          <span>Total Students</span>
          <strong>{formatNumber(total)}</strong>
        </div>

        <div className="ae-gender-pie__legend">
          <div className="ae-gender-pie__item">
            <span className="ae-trend__swatch ae-trend__swatch--boys" />

            <div>
              <span>Boys</span>
              <strong>{formatNumber(point.boys)}</strong>
              <small>{boysPercentage.toFixed(1)}%</small>
            </div>
          </div>

          <div className="ae-gender-pie__item">
            <span className="ae-trend__swatch ae-trend__swatch--girls" />

            <div>
              <span>Girls</span>
              <strong>{formatNumber(point.girls)}</strong>
              <small>{girlsPercentage.toFixed(1)}%</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Entrant chart */

/**
 * Stacked columns of new entrants on top of continuing learners, with the
 * retention rate drawn over them against a second, right-hand axis.
 */
function EntrantTrendChart({ points }: { points: EnrollmentTrendPoint[] }) {
  const chartWidth = 760;
  const chartHeight = 310;
  const left = 54;
  const right = 42;
  const top = 18;
  const bottom = 48;
  const chartPlotWidth = chartWidth - left - right;
  const chartPlotHeight = chartHeight - top - bottom;
  const chartBaseline = top + chartPlotHeight;
  const plotRight = chartWidth - right;

  const axis = axisFor(Math.max(...points.map((point) => point.learners)));
  const y = (value: number) =>
    chartBaseline - (value / axis.top) * chartPlotHeight;

  const rates = points.map((point) => point.retentionRate);
  const lowest = Math.max(0, Math.floor(Math.min(...rates) - 1));
  const highest = Math.min(100, Math.ceil(Math.max(...rates) + 1));
  const span = Math.max(1, highest - lowest);
  const rateY = (value: number) =>
    chartBaseline - ((value - lowest) / span) * chartPlotHeight;

  const slot = chartPlotWidth / Math.max(points.length, 1);
  const barWidth = Math.min(42, slot * 0.4);

  const rateTicks = [highest, lowest + span / 2, lowest];

  return (
    <svg
      className="ae-trend__svg"
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      role="img"
      aria-label="New entrants and continuing learners in each period, with the retention rate"
    >
      {axis.ticks.map((tick) => (
        <g key={tick}>
          <line
            className="ae-trend__gridline"
            x1={left}
            x2={plotRight}
            y1={y(tick)}
            y2={y(tick)}
          />
          <text
            className="ae-trend__tick"
            x={left - 8}
            y={y(tick) + 3}
            textAnchor="end"
          >
            {formatNumber(tick)}
          </text>
        </g>
      ))}

      {rateTicks.map((tick, index) => (
        <text
          key={index}
          className="ae-trend__tick ae-trend__tick--rate"
          x={chartWidth - 3}
          y={rateY(tick) + 3}
          textAnchor="end"
        >
          {tick.toFixed(0)}%
        </text>
      ))}

      <line
        className="ae-trend__axis"
        x1={left}
        x2={left}
        y1={top}
        y2={chartBaseline}
      />
      <line
        className="ae-trend__axis"
        x1={left}
        x2={plotRight}
        y1={chartBaseline}
        y2={chartBaseline}
      />

      {points.map((point, index) => {
        const centre = left + slot * (index + 0.5);
        const x = centre - barWidth / 2;

        const newHeight = (point.newLearners / axis.top) * chartPlotHeight;
        const continuingHeight =
          (point.continuing / axis.top) * chartPlotHeight;

        const newTop = chartBaseline - newHeight;
        const continuingTop = newTop - continuingHeight;

        return (
          <g key={point.id}>
            <rect
              className="ae-trend__bar ae-trend__bar--continuing"
              x={x}
              y={continuingTop}
              width={barWidth}
              height={Math.max(1, continuingHeight)}
              rx={3}
            >
              <title>{`${point.description} · ${formatNumber(
                point.continuing,
              )} continuing`}</title>
            </rect>

            <rect
              className="ae-trend__bar ae-trend__bar--new"
              x={x}
              y={newTop}
              width={barWidth}
              height={Math.max(1, newHeight)}
            >
              <title>{`${point.description} · ${formatNumber(
                point.newLearners,
              )} new`}</title>
            </rect>

            <text
              className="ae-trend__total"
              x={centre}
              y={continuingTop - 6}
              textAnchor="middle"
            >
              {formatNumber(point.learners)}
            </text>

            <text
              className="ae-trend__label"
              x={centre}
              y={chartBaseline + 16}
              textAnchor="middle"
            >
              {point.label}
            </text>

            {point.subLabel ? (
              <text
                className="ae-trend__sublabel"
                x={centre}
                y={chartBaseline + 29}
                textAnchor="middle"
              >
                {point.subLabel}
              </text>
            ) : null}
          </g>
        );
      })}

      <polyline
        className="ae-trend__line"
        points={points
          .map(
            (point, index) =>
              `${left + slot * (index + 0.5)},${rateY(point.retentionRate)}`,
          )
          .join(" ")}
      />

      {points.map((point, index) => (
        <circle
          key={point.id}
          className="ae-trend__dot"
          cx={left + slot * (index + 0.5)}
          cy={rateY(point.retentionRate)}
          r={3.5}
        >
          <title>{`${point.description} · ${formatPercent(
            point.retentionRate,
          )} retained`}</title>
        </circle>
      ))}
    </svg>
  );
}

export function EntrantRetentionTrendCard({
  points,
}: {
  points: EnrollmentTrendPoint[];
}) {
  const latest = points[points.length - 1];

  if (!latest) {
    return (
      <article className="ae-trend-card sr-retention-trend">
        <h2 className="ae-trend-card__title">New entrants vs retained</h2>
        <p className="ae-trend__empty">
          No history to plot for the current filters.
        </p>
      </article>
    );
  }

  return (
    <article className="ae-trend-card sr-retention-trend">
      <header className="ae-trend-card__head">
        <h2 className="ae-trend-card__title">New entrants vs retained</h2>

        <ul className="ae-trend__legend">
          <li>
            <span
              className="ae-trend__swatch ae-trend__swatch--new"
              aria-hidden="true"
            />
            New
          </li>
          <li>
            <span
              className="ae-trend__swatch ae-trend__swatch--continuing"
              aria-hidden="true"
            />
            Continuing
          </li>
          <li>
            <span
              className="ae-trend__swatch ae-trend__swatch--rate"
              aria-hidden="true"
            />
            Retention
          </li>
        </ul>
      </header>

      <EntrantTrendChart points={points} />

      <p className="ae-trend-card__foot">
        <strong>{formatNumber(latest.newLearners)}</strong> new and{" "}
        <strong>{formatNumber(latest.continuing)}</strong> continuing in{" "}
        {latest.description} ·{" "}
        <strong>{formatPercent(latest.retentionRate)}</strong> retained
      </p>
    </article>
  );
}

/* ------------------------------------------------------------------- Section */

interface EnrollmentTrendsProps {
  /** The page's own filter state, so the charts follow every drill-down. */
  filters: Filters;
}

export function EnrollmentTrends({ filters }: EnrollmentTrendsProps) {
  // Follow the existing shared term, year and campus filters.
  const points = useMemo(
    () => enrollmentTrend(filters, "term"),
    [filters],
  );

  const latest = points[points.length - 1];
  const change = trendDelta(points);

  return (
    <section className="ae-trends" aria-label="Enrolment trends">
      {latest ? (
        <div className="ae-trends__grid">
          <article className="ae-trend-card">
            <header className="ae-trend-card__head">
              <div>
                <h3 className="ae-trend-card__title">
                  Gender Distribution
                </h3>
                <p className="ae-trend-card__subtitle">
                  {latest.description}
                </p>
              </div>
            </header>

            <GenderPieChart point={latest} />

            <p className="ae-trend-card__foot">
              <strong>{formatNumber(latest.girls)}</strong> girls and{" "}
              <strong>{formatNumber(latest.boys)}</strong> boys in{" "}
              {latest.description}
              {change === null ? null : (
                <>
                  {" · "}
                  <span
                    className={
                      change >= 0
                        ? "ae-trend__delta is-up"
                        : "ae-trend__delta is-down"
                    }
                  >
                    {change >= 0 ? "+" : ""}
                    {change.toFixed(1)}%
                  </span>{" "}
                  roll since {points[0].description}
                </>
              )}
            </p>
          </article>
        </div>
      ) : (
        <p className="ae-trend__empty">
          No gender distribution history is available for the current filters.
        </p>
      )}
    </section>
  );
}
