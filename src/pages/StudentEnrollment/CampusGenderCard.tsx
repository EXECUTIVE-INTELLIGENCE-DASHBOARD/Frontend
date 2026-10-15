import { formatNumber, niceScale } from "./studentEnrollment.data";
import type { CampusRow, EnrollmentSummary } from "./studentEnrollment.types";

const WIDTH = 640;
const HEIGHT = 240;
const PAD = { top: 24, right: 12, bottom: 46, left: 40 };
const BAR_WIDTH = 34;
const BAR_GAP = 8;

const plotWidth = WIDTH - PAD.left - PAD.right;
const plotHeight = HEIGHT - PAD.top - PAD.bottom;
const groupWidth = BAR_WIDTH * 2 + BAR_GAP;

interface CampusGenderCardProps {
  rows: CampusRow[];
  summary: EnrollmentSummary;
}

export function CampusGenderCard({ rows, summary }: CampusGenderCardProps) {
  const max = Math.max(...rows.flatMap((row) => [row.boys, row.girls]));
  const { step, top } = niceScale(max);
  const ticks = [0, 1, 2, 3, 4].map((index) => index * step);

  const toY = (value: number) =>
    PAD.top + plotHeight - (value / top) * plotHeight;
  const slotWidth = plotWidth / rows.length;

  const boysShare = ((summary.boys / summary.total) * 100).toFixed(1);
  const girlsShare = ((summary.girls / summary.total) * 100).toFixed(1);

  return (
    <section className="se-card">
      <div className="se-card__header">
        <h2 className="se-card__title">Campus Enrolment &amp; Gender Breakdown</h2>

        <ul className="se-legend">
          <li className="se-legend__item">
            <span className="se-legend__swatch se-legend__swatch--boys" aria-hidden="true" />
            Boys
          </li>
          <li className="se-legend__item">
            <span className="se-legend__swatch se-legend__swatch--girls" aria-hidden="true" />
            Girls
          </li>
        </ul>
      </div>

      <div className="se-card__body">
        <svg
          className="se-chart"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Boys and girls enrolled at each campus"
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
            const groupX =
              PAD.left + index * slotWidth + (slotWidth - groupWidth) / 2;
            const centre = groupX + groupWidth / 2;

            return (
              <g key={row.key}>
                <rect
                  className="se-chart__bar se-chart__bar--boys"
                  x={groupX}
                  y={toY(row.boys)}
                  width={BAR_WIDTH}
                  height={toY(0) - toY(row.boys)}
                  rx={3}
                >
                  <title>{`${row.label}, boys: ${row.boys}`}</title>
                </rect>
                <text
                  className="se-chart__value"
                  x={groupX + BAR_WIDTH / 2}
                  y={toY(row.boys) - 6}
                >
                  {row.boys}
                </text>

                <rect
                  className="se-chart__bar se-chart__bar--girls"
                  x={groupX + BAR_WIDTH + BAR_GAP}
                  y={toY(row.girls)}
                  width={BAR_WIDTH}
                  height={toY(0) - toY(row.girls)}
                  rx={3}
                >
                  <title>{`${row.label}, girls: ${row.girls}`}</title>
                </rect>
                <text
                  className="se-chart__value se-chart__value--girls"
                  x={groupX + BAR_WIDTH + BAR_GAP + BAR_WIDTH / 2}
                  y={toY(row.girls) - 6}
                >
                  {row.girls}
                </text>

                <text
                  className="se-chart__cat"
                  x={centre}
                  y={PAD.top + plotHeight + 18}
                >
                  {row.label}
                </text>
                <text
                  className="se-chart__sub"
                  x={centre}
                  y={PAD.top + plotHeight + 33}
                >
                  {`Total: ${formatNumber(row.total)}`}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="se-ratio">
          <p className="se-ratio__text">
            Total Gender Ratio:{" "}
            <strong>
              {boysShare}% Boys ({formatNumber(summary.boys)})
            </strong>{" "}
            /{" "}
            <strong className="se-ratio__girls">
              {girlsShare}% Girls ({formatNumber(summary.girls)})
            </strong>
          </p>

          <p className="se-ratio__total">
            Aggregate {formatNumber(summary.total)} students
          </p>
        </div>
      </div>
    </section>
  );
}
