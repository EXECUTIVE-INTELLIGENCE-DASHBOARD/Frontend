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

/* ------------------------------------------------------------------ Geometry */

/* A short, wide frame keeps both trend cards inside the first screenful even
   when they sit side by side. */
const W = 560;
const H = 212;
const L = 46;
const R = 12;
const T = 14;
const B = 42;

const plotWidth = W - L - R;
const plotHeight = H - T - B;
const baseline = T + plotHeight;

/* -------------------------------------------------------------- Gender chart */

/** Grouped columns: girls beside boys for every period. */
function GenderTrendChart({ points }: { points: EnrollmentTrendPoint[] }) {
  const axis = axisFor(Math.max(...points.flatMap((p) => [p.boys, p.girls])));
  const y = (value: number) => baseline - (value / axis.top) * plotHeight;

  const slot = plotWidth / Math.max(points.length, 1);
  const barWidth = Math.min(22, slot * 0.28);
  const gap = Math.max(3, barWidth * 0.25);

  return (
    <svg
      className="ae-trend__svg"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Girls and boys enrolled in each period"
    >
      {axis.ticks.map((tick) => (
        <g key={tick}>
          <line
            className="ae-trend__gridline"
            x1={L}
            x2={W - R}
            y1={y(tick)}
            y2={y(tick)}
          />
          <text
            className="ae-trend__tick"
            x={L - 8}
            y={y(tick) + 3}
            textAnchor="end"
          >
            {formatNumber(tick)}
          </text>
        </g>
      ))}

      <line className="ae-trend__axis" x1={L} x2={L} y1={T} y2={baseline} />
      <line
        className="ae-trend__axis"
        x1={L}
        x2={W - R}
        y1={baseline}
        y2={baseline}
      />

      {points.map((point, index) => {
        const centre = L + slot * (index + 0.5);
        const girlsX = centre - barWidth - gap / 2;
        const boysX = centre + gap / 2;

        return (
          <g key={point.id}>
            <rect
              className="ae-trend__bar ae-trend__bar--girls"
              x={girlsX}
              y={y(point.girls)}
              width={barWidth}
              height={Math.max(1, baseline - y(point.girls))}
              rx={3}
            >
              <title>{`${point.description} · ${formatNumber(
                point.girls,
              )} girls`}</title>
            </rect>

            <rect
              className="ae-trend__bar ae-trend__bar--boys"
              x={boysX}
              y={y(point.boys)}
              width={barWidth}
              height={Math.max(1, baseline - y(point.boys))}
              rx={3}
            >
              <title>{`${point.description} · ${formatNumber(
                point.boys,
              )} boys`}</title>
            </rect>

            <text
              className="ae-trend__label"
              x={centre}
              y={baseline + 16}
              textAnchor="middle"
            >
              {point.label}
            </text>

            {point.subLabel ? (
              <text
                className="ae-trend__sublabel"
                x={centre}
                y={baseline + 29}
                textAnchor="middle"
              >
                {point.subLabel}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------- Entrant chart */

/**
 * Stacked columns of new entrants on top of continuing learners, with the
 * retention rate drawn over them against a second, right-hand axis.
 */
function EntrantTrendChart({ points }: { points: EnrollmentTrendPoint[] }) {
  const axis = axisFor(Math.max(...points.map((point) => point.learners)));
  const y = (value: number) => baseline - (value / axis.top) * plotHeight;

  const rates = points.map((point) => point.retentionRate);
  const lowest = Math.max(0, Math.floor(Math.min(...rates) - 1));
  const highest = Math.min(100, Math.ceil(Math.max(...rates) + 1));
  const span = Math.max(1, highest - lowest);
  const rateY = (value: number) =>
    baseline - ((value - lowest) / span) * plotHeight;

  const slot = plotWidth / Math.max(points.length, 1);
  const barWidth = Math.min(30, slot * 0.44);

  const rateTicks = [highest, lowest + span / 2, lowest];

  return (
    <svg
      className="ae-trend__svg"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="New entrants and continuing learners in each period, with the retention rate"
    >
      {axis.ticks.map((tick) => (
        <g key={tick}>
          <line
            className="ae-trend__gridline"
            x1={L}
            x2={W - R}
            y1={y(tick)}
            y2={y(tick)}
          />
          <text
            className="ae-trend__tick"
            x={L - 8}
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
          x={W - R + 2}
          y={rateY(tick) + 3}
          textAnchor="start"
        >
          {tick.toFixed(0)}%
        </text>
      ))}

      <line className="ae-trend__axis" x1={L} x2={L} y1={T} y2={baseline} />
      <line
        className="ae-trend__axis"
        x1={L}
        x2={W - R}
        y1={baseline}
        y2={baseline}
      />

      {points.map((point, index) => {
        const centre = L + slot * (index + 0.5);
        const x = centre - barWidth / 2;

        const newHeight = (point.newLearners / axis.top) * plotHeight;
        const continuingHeight = (point.continuing / axis.top) * plotHeight;

        const newTop = baseline - newHeight;
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
              y={baseline + 16}
              textAnchor="middle"
            >
              {point.label}
            </text>

            {point.subLabel ? (
              <text
                className="ae-trend__sublabel"
                x={centre}
                y={baseline + 29}
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
              `${L + slot * (index + 0.5)},${rateY(point.retentionRate)}`,
          )
          .join(" ")}
      />

      {points.map((point, index) => (
        <circle
          key={point.id}
          className="ae-trend__dot"
          cx={L + slot * (index + 0.5)}
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

/* ------------------------------------------------------------------- Section */

interface EnrollmentTrendsProps {
  /** The page's own filter state, so the charts follow every drill-down. */
  filters: Filters;
}

export function EnrollmentTrends({ filters }: EnrollmentTrendsProps) {
  // The page filter row already carries the Term and Academic Year pickers, so
  // the charts just follow them and plot the trailing terms; there is no second
  // grain switch to disagree with them.
  const points = useMemo(() => enrollmentTrend(filters, "term"), [filters]);

  const latest = points[points.length - 1];
  const change = trendDelta(points);

  return (
    <section className="ae-trends" aria-labelledby="ae-trends-heading">
      <div className="ae-trends__head">
        <div>
          <h2 className="ae-trends__title" id="ae-trends-heading">
            Enrolment trends
          </h2>
        </div>
      </div>

      {latest ? (
        <div className="ae-trends__grid">
          <article className="ae-trend-card">
            <header className="ae-trend-card__head">
              <div>
                <h3 className="ae-trend-card__title">Girls vs boys</h3>
              </div>

              <ul className="ae-trend__legend">
                <li>
                  <span
                    className="ae-trend__swatch ae-trend__swatch--girls"
                    aria-hidden="true"
                  />
                  Girls
                </li>
                <li>
                  <span
                    className="ae-trend__swatch ae-trend__swatch--boys"
                    aria-hidden="true"
                  />
                  Boys
                </li>
              </ul>
            </header>

            <GenderTrendChart points={points} />

            <p className="ae-trend-card__foot">
              <strong>{formatNumber(latest.girls)}</strong> girls and{" "}
              <strong>{formatNumber(latest.boys)}</strong> boys in{" "}
              {latest.description}
              {change === null ? null : (
                <>
                  {" · "}
                  <span
                    className={
                      change >= 0 ? "ae-trend__delta is-up" : "ae-trend__delta is-down"
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

          <article className="ae-trend-card">
            <header className="ae-trend-card__head">
              <div>
                <h3 className="ae-trend-card__title">New entrants vs retained</h3>
              </div>

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
        </div>
      ) : (
        <p className="ae-trend__empty">
          No history to plot for the current filters.
        </p>
      )}
    </section>
  );
}
