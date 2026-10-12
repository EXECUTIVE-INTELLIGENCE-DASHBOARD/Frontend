import { trendSeries, trendWeeks } from "./attendanceRates.data";

const WIDTH = 620;
const HEIGHT = 262;
const PAD = { top: 18, right: 18, bottom: 32, left: 44 };
const MIN = 0;
const MAX = 100;
const TICKS = [0, 20, 40, 60, 80, 100];

const plotWidth = WIDTH - PAD.left - PAD.right;
const plotHeight = HEIGHT - PAD.top - PAD.bottom;
const step = plotWidth / (trendWeeks.length - 1);

const toX = (index: number) => PAD.left + index * step;
const toY = (value: number) =>
  PAD.top + plotHeight - ((value - MIN) / (MAX - MIN)) * plotHeight;

const toPoints = (values: number[]) =>
  values.map((value, index) => `${toX(index)},${toY(value)}`).join(" ");

export function AttendanceTrendCard() {
  return (
    <section className="ar-card">
      <div className="ar-card__header">
        <div>
          <h2 className="ar-card__title">Attendance Trend Comparison</h2>
          <p className="ar-card__subtitle">Weekly attendance vs. target</p>
        </div>
      </div>

      <div className="ar-card__body">
        <ul className="ar-legend">
          {trendSeries.map((series) => (
            <li key={series.id} className="ar-legend__item">
              <span
                className={`ar-legend__swatch ar-legend__swatch--${series.tone}`}
                aria-hidden="true"
              />
              {series.label}
            </li>
          ))}
        </ul>

        <svg
          className="ar-chart"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Weekly attendance rate compared with target and previous year"
        >
          {TICKS.map((tick) => {
            const y = toY(tick);

            return (
              <g key={tick}>
                <line
                  className="ar-chart__grid"
                  x1={PAD.left}
                  y1={y}
                  x2={WIDTH - PAD.right}
                  y2={y}
                />
                <text className="ar-chart__tick" x={PAD.left - 10} y={y + 4}>
                  {tick}%
                </text>
              </g>
            );
          })}

          {trendSeries.map((series) => (
            <polyline
              key={series.id}
              className={`ar-chart__line ar-chart__line--${series.tone}`}
              points={toPoints(series.values)}
            />
          ))}

          {trendSeries.map((series) =>
            series.values.map((value, index) => (
              <circle
                key={`${series.id}-${trendWeeks[index]}`}
                className={`ar-chart__point ar-chart__point--${series.tone}`}
                cx={toX(index)}
                cy={toY(value)}
                r={3}
              >
                <title>{`${series.label}, ${trendWeeks[index]}: ${value}%`}</title>
              </circle>
            )),
          )}

          {trendWeeks.map((week, index) => (
            <text
              key={week}
              className="ar-chart__label"
              x={toX(index)}
              y={HEIGHT - 10}
            >
              {week}
            </text>
          ))}
        </svg>

        <p className="ar-chart__note">
          Weekly attendance rate compared against the campus target and the
          same period last year, aggregated across all selected classes.
        </p>
      </div>
    </section>
  );
}
