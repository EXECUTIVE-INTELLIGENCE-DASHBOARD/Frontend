import { formatNumber, niceScale } from "./studentEnrollment.data";
import type { TierId, TierRow } from "./studentEnrollment.types";

const WIDTH = 640;
const HEIGHT = 240;
const PAD = { top: 34, right: 12, bottom: 30, left: 44 };
const BAR_WIDTH = 46;

const plotWidth = WIDTH - PAD.left - PAD.right;
const plotHeight = HEIGHT - PAD.top - PAD.bottom;

const LEGEND: Array<{ id: TierId; label: string }> = [
  { id: "primary", label: "Core (Primary)" },
  { id: "olevel", label: "Secondary / Prep" },
  { id: "alevel", label: "Sixth Form (A-L)" },
  { id: "nursery", label: "Early Years (Nursery)" },
];

interface TierEnrollmentCardProps {
  rows: TierRow[];
}

export function TierEnrollmentCard({ rows }: TierEnrollmentCardProps) {
  const max = Math.max(...rows.map((row) => row.value));
  const { step, top } = niceScale(max);
  const ticks = [0, 1, 2, 3, 4].map((index) => index * step);

  const toY = (value: number) =>
    PAD.top + plotHeight - (value / top) * plotHeight;
  const slotWidth = plotWidth / rows.length;

  return (
    <section className="se-card">
      <div className="se-card__header">
        <h2 className="se-card__title">Enrolment by Educational Tier</h2>
      </div>

      <div className="se-card__body">
        <svg
          className="se-chart"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Enrolment at each educational tier"
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                className="se-chart__grid"
                x1={PAD.left}
                y1={toY(tick)}
                x2={WIDTH - PAD.right}
                y2={toY(tick)}
              />
              <text className="se-chart__tick" x={PAD.left - 8} y={toY(tick) + 4}>
                {formatNumber(tick)}
              </text>
            </g>
          ))}

          {rows.map((row, index) => {
            const centre = PAD.left + index * slotWidth + slotWidth / 2;

            return (
              <g key={row.id}>
                <rect
                  className={`se-chart__bar se-chart__bar--${row.id}`}
                  x={centre - BAR_WIDTH / 2}
                  y={toY(row.value)}
                  width={BAR_WIDTH}
                  height={toY(0) - toY(row.value)}
                  rx={3}
                >
                  <title>{`${row.label}: ${formatNumber(row.value)}`}</title>
                </rect>

                <text
                  className="se-chart__value"
                  x={centre}
                  y={toY(row.value) - 18}
                >
                  {formatNumber(row.value)}
                </text>
                <text
                  className="se-chart__sub"
                  x={centre}
                  y={toY(row.value) - 6}
                >
                  {`${row.share.toFixed(1)}%`}
                </text>

                <text
                  className="se-chart__cat"
                  x={centre}
                  y={PAD.top + plotHeight + 18}
                >
                  {row.label}
                </text>
              </g>
            );
          })}
        </svg>

        <ul className="se-legend se-legend--wide">
          {LEGEND.map((item) => (
            <li key={item.id} className="se-legend__item">
              <span
                className={`se-legend__swatch se-legend__swatch--${item.id}`}
                aria-hidden="true"
              />
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
