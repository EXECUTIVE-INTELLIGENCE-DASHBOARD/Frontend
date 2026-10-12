import { budgetPoints, budgetSummary } from "./executiveOverview.data";

const WIDTH = 560;
const HEIGHT = 240;
const PAD = { top: 38, right: 20, bottom: 38, left: 20 };
const MIN = 0;
const MAX = 20;

const plotWidth = WIDTH - PAD.left - PAD.right;
const plotHeight = HEIGHT - PAD.top - PAD.bottom;
const baseline = PAD.top + plotHeight;
const step = plotWidth / (budgetPoints.length - 1);

const toX = (index: number) => PAD.left + index * step;
const toY = (value: number) =>
  PAD.top + plotHeight - ((value - MIN) / (MAX - MIN)) * plotHeight;

const actualLine = budgetPoints
  .map(
    (point, index) =>
      `${index === 0 ? "M" : "L"} ${toX(index)} ${toY(point.actual)}`,
  )
  .join(" ");

const budgetLine = budgetPoints
  .map(
    (point, index) =>
      `${index === 0 ? "M" : "L"} ${toX(index)} ${toY(point.budget)}`,
  )
  .join(" ");

const actualArea = `${actualLine} L ${toX(budgetPoints.length - 1)} ${baseline} L ${toX(0)} ${baseline} Z`;

const bandStart = toX(budgetPoints.length - 2);
const bandWidth = WIDTH - PAD.right - bandStart;

const anchorFor = (index: number) => {
  if (index === 0) {
    return "start" as const;
  }

  return index === budgetPoints.length - 1 ? ("end" as const) : ("middle" as const);
};

export function BudgetCard() {
  return (
    <section className="eo-card">
      <div className="eo-card__header">
        <div>
          <span className="eo-card__eyebrow">Budget</span>

          <h2 className="eo-card__title">FYD Budget vs. Actual</h2>
        </div>

        <span className="eo-chip">
          {budgetSummary.actual} <span>/ {budgetSummary.planned} Budget</span>
        </span>
      </div>

      <div className="eo-card__body">
        <svg
          className="eo-chart"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Cumulative actual spend compared with the approved budget across the four quarters"
        >
          <defs>
            <linearGradient id="eo-budget-fill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--chart-blue)"
                stopOpacity="0.22"
              />
              <stop
                offset="100%"
                stopColor="var(--chart-blue)"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          <rect
            className="eo-chart__band"
            x={bandStart}
            y={PAD.top}
            width={bandWidth}
            height={plotHeight}
            rx={6}
          />

          <line
            className="eo-chart__marker"
            x1={bandStart}
            y1={PAD.top}
            x2={bandStart}
            y2={baseline}
          />

          <path className="eo-chart__area" d={actualArea} />

          <path className="eo-chart__line eo-chart__line--budget" d={budgetLine} />

          <path className="eo-chart__line eo-chart__line--actual" d={actualLine} />

          {budgetPoints.map((point, index) => (
            <circle
              key={`budget-${point.id}`}
              className="eo-chart__point eo-chart__point--budget"
              cx={toX(index)}
              cy={toY(point.budget)}
              r={3}
            />
          ))}

          {budgetPoints.map((point, index) => (
            <circle
              key={`actual-${point.id}`}
              className="eo-chart__point"
              cx={toX(index)}
              cy={toY(point.actual)}
              r={3.5}
            />
          ))}

          {budgetPoints.map((point, index) => (
            <text
              key={`note-${point.id}`}
              className="eo-chart__note"
              x={toX(index)}
              y={toY(point.actual) - 10}
              textAnchor={anchorFor(index)}
            >
              <tspan className="eo-chart__note-actual">
                UGX {point.actual.toFixed(1)}M
              </tspan>
              <tspan className="eo-chart__note-budget">
                {" / "}UGX {point.budget.toFixed(1)}M
              </tspan>
            </text>
          ))}

          {budgetPoints.map((point, index) => (
            <g key={`label-${point.id}`}>
              <text
                className="eo-chart__tick eo-chart__tick--strong"
                x={toX(index)}
                y={baseline + 18}
              >
                {point.quarter}
              </text>

              <text className="eo-chart__tick" x={toX(index)} y={baseline + 31}>
                {point.period}
              </text>
            </g>
          ))}
        </svg>

        <ul className="eo-legend">
          <li className="eo-legend__item">
            <span
              className="eo-legend__dot eo-legend__dot--navy"
              aria-hidden="true"
            />
            Actual
          </li>

          <li className="eo-legend__item">
            <span
              className="eo-legend__dot eo-legend__dot--gold"
              aria-hidden="true"
            />
            Budget
          </li>
        </ul>
      </div>
    </section>
  );
}
