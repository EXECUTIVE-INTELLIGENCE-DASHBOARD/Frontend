import { settlementSeries } from "./procurementFinancials.data";
import type { SpendCategory } from "./procurementFinancials.types";

const WIDTH = 760;
const HEIGHT = 240;
const PAD = { top: 22, right: 14, bottom: 30, left: 62 };
const BAR_WIDTH = 34;
const BAR_GAP = 8;

const plotWidth = WIDTH - PAD.left - PAD.right;
const plotHeight = HEIGHT - PAD.top - PAD.bottom;
const groupWidth =
  settlementSeries.length * BAR_WIDTH + (settlementSeries.length - 1) * BAR_GAP;

interface SettlementAnalysisCardProps {
  categories: SpendCategory[];
}

export function SettlementAnalysisCard({
  categories,
}: SettlementAnalysisCardProps) {
  const maxValue = Math.max(
    50,
    ...categories.flatMap((category) =>
      settlementSeries.map((series) => category[series.id]),
    ),
  );
  const maxTick = Math.ceil(maxValue / 50) * 50;
  const ticks = Array.from({ length: 5 }, (_, index) =>
    Math.round((maxTick * index) / 4),
  );
  const slotWidth = plotWidth / categories.length;
  const toY = (value: number) =>
    PAD.top + plotHeight - (value / maxTick) * plotHeight;

  return (
    <section className="pf-card">
      <div className="pf-card__header">
        <div>
          <h2 className="pf-card__title">
            Procurement Settlement &amp; Liability Analysis
          </h2>
          <p className="pf-card__subtitle">Paid vs. unpaid, by category</p>
        </div>
      </div>

      <div className="pf-card__body">
        <ul className="pf-legend">
          {settlementSeries.map((series) => (
            <li key={series.id} className="pf-legend__item">
              <span
                className={`pf-legend__swatch pf-legend__swatch--${series.id}`}
                aria-hidden="true"
              />
              {series.label}
            </li>
          ))}
        </ul>

        <svg
          className="pf-chart"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Paid, committed and outstanding amounts by procurement category"
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                className="pf-chart__grid"
                x1={PAD.left}
                y1={toY(tick)}
                x2={WIDTH - PAD.right}
                y2={toY(tick)}
              />
              <text
                className="pf-chart__tick"
                x={PAD.left - 10}
                y={toY(tick) + 4}
              >
                {`UGX ${tick}M`}
              </text>
            </g>
          ))}

          {categories.map((category, categoryIndex) => {
            const groupX =
              PAD.left + categoryIndex * slotWidth + (slotWidth - groupWidth) / 2;

            return (
              <g key={category.id}>
                {settlementSeries.map((series, seriesIndex) => {
                  const value = category[series.id];
                  const x = groupX + seriesIndex * (BAR_WIDTH + BAR_GAP);
                  const y = toY(value);

                  return (
                    <g key={series.id}>
                      <rect
                        className={`pf-chart__bar pf-chart__bar--${series.id}`}
                        x={x}
                        y={y}
                        width={BAR_WIDTH}
                        height={toY(0) - y}
                        rx={4}
                      >
                        <title>{`${category.shortLabel}, ${series.label}: UGX ${value.toFixed(1)}M`}</title>
                      </rect>
                      <text
                        className={`pf-chart__value pf-chart__value--${series.id}`}
                        x={x + BAR_WIDTH / 2}
                        y={y - 6}
                      >
                        {`${value.toFixed(1)}M`}
                      </text>
                    </g>
                  );
                })}

                <text
                  className="pf-chart__label"
                  x={groupX + groupWidth / 2}
                  y={HEIGHT - 10}
                >
                  {category.shortLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
