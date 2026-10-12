import { settlementSeries, spendCategories } from "./procurementFinancials.data";

const WIDTH = 620;
const HEIGHT = 300;
const PAD = { top: 26, right: 16, bottom: 34, left: 64 };
const MAX = 200;
const TICKS = [0, 50, 100, 150, 200];
const BAR_WIDTH = 36;
const BAR_GAP = 8;

const plotWidth = WIDTH - PAD.left - PAD.right;
const plotHeight = HEIGHT - PAD.top - PAD.bottom;
const slotWidth = plotWidth / spendCategories.length;
const groupWidth =
  settlementSeries.length * BAR_WIDTH + (settlementSeries.length - 1) * BAR_GAP;

const toY = (value: number) => PAD.top + plotHeight - (value / MAX) * plotHeight;

export function SettlementAnalysisCard() {
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
          {TICKS.map((tick) => (
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

          {spendCategories.map((category, categoryIndex) => {
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
                        className="pf-chart__value"
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
