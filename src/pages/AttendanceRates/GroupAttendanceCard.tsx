import { groupLabels, groupSeries } from "./attendanceRates.data";

const WIDTH = 620;
const PAD = { top: 10, right: 24, bottom: 30, left: 76 };
const BAR_HEIGHT = 7;
const BAR_GAP = 3;
const GROUP_GAP = 16;
const TICKS = [0, 20, 40, 60, 80, 100];

const groupHeight =
  groupSeries.length * BAR_HEIGHT + (groupSeries.length - 1) * BAR_GAP;
const rowHeight = groupHeight + GROUP_GAP;
const plotHeight = groupLabels.length * rowHeight - GROUP_GAP;
const HEIGHT = PAD.top + plotHeight + PAD.bottom;
const plotWidth = WIDTH - PAD.left - PAD.right;

const toX = (value: number) => PAD.left + (value / 100) * plotWidth;

export function GroupAttendanceCard() {
  return (
    <section className="ar-card">
      <div className="ar-card__header">
        <div>
          <h2 className="ar-card__title">Attendance by Student Group</h2>
          <p className="ar-card__subtitle">Current reporting period</p>
        </div>
      </div>

      <div className="ar-card__body">
        <ul className="ar-legend">
          {groupSeries.map((series) => (
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
          aria-label="Attendance by student group for the current reporting period"
        >
          {TICKS.map((tick) => (
            <g key={tick}>
              <line
                className="ar-chart__grid"
                x1={toX(tick)}
                y1={PAD.top}
                x2={toX(tick)}
                y2={PAD.top + plotHeight}
              />
              <text
                className="ar-chart__label"
                x={toX(tick)}
                y={HEIGHT - 10}
              >
                {tick}
              </text>
            </g>
          ))}

          {groupLabels.map((label, groupIndex) => {
            const top = PAD.top + groupIndex * rowHeight;

            return (
              <g key={label}>
                <text
                  className="ar-chart__row-label"
                  x={PAD.left - 10}
                  y={top + groupHeight / 2 + 4}
                >
                  {label}
                </text>

                {groupSeries.map((series, seriesIndex) => (
                  <rect
                    key={series.id}
                    className={`ar-chart__bar ar-chart__bar--${series.tone}`}
                    x={PAD.left}
                    y={top + seriesIndex * (BAR_HEIGHT + BAR_GAP)}
                    width={toX(series.values[groupIndex]) - PAD.left}
                    height={BAR_HEIGHT}
                    rx={3}
                  >
                    <title>{`${label}, ${series.label}: ${series.values[groupIndex]}%`}</title>
                  </rect>
                ))}
              </g>
            );
          })}
        </svg>

        <p className="ar-chart__note">
          Attendance split by student group for the current reporting period.
        </p>
      </div>
    </section>
  );
}
