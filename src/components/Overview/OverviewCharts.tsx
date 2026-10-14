import "./OverviewCharts.css";

const budgetData = [
  { quarter: "Q1", period: "Sep - Nov", actual: 4.5, budget: 4.8 },
  { quarter: "Q2", period: "Dec - Feb", actual: 9.2, budget: 9.1 },
  { quarter: "Q3", period: "Mar - May", actual: 13.7, budget: 13.9 },
  { quarter: "Q4", period: "Jun - Aug", actual: 18.4, budget: 18.3 },
];

const admissionsData = [
  {
    id: "qualified",
    label: "Qualified",
    count: 1247,
    percentage: "50.9%",
    color: "#13a8ed",
  },
  {
    id: "interview",
    label: "Interview",
    count: 446,
    percentage: "18.2%",
    color: "#ff9d00",
  },
  {
    id: "accepted",
    label: "Accepted",
    count: 304,
    percentage: "12.4%",
    color: "#18264b",
  },
  {
    id: "other",
    label: "Other / Scr",
    count: 453,
    percentage: "18.5%",
    color: "#94a3b8",
  },
];

const chartScale = [0, 5, 10, 15, 20, 25];

const chartGeometry = {
  left: 32,
  right: 392,
  top: 24,
  bottom: 176,
};

const chartHeight = chartGeometry.bottom - chartGeometry.top;

function getBarY(value: number) {
  return chartGeometry.bottom - (value / 25) * chartHeight;
}

function getBarHeight(value: number) {
  return (value / 25) * chartHeight;
}

function formatMillions(value: number) {
  return `${value.toFixed(1)}M`;
}

function BudgetChart() {
  return (
    <article className="overview-chart-card overview-budget-card">
      <div className="overview-chart-card__heading">
        <h2>FYD Budget vs. Actual</h2>

        <div className="overview-chart-legend">
          <span className="overview-chart-legend__item">
            <span className="overview-chart-legend__swatch overview-chart-legend__swatch--actual" />
            Actual Spend
          </span>

          <span className="overview-chart-legend__item">
            <span className="overview-chart-legend__swatch overview-chart-legend__swatch--budget" />
            Budget Target
          </span>
        </div>
      </div>

      <div className="overview-budget-chart">
        <svg
          className="overview-budget-chart__svg"
          viewBox="0 0 410 218"
          role="img"
          aria-label="Quarterly actual spending compared with budget targets, in millions"
        >
          {chartScale.map((value) => {
            const y = getBarY(value);

            return (
              <g key={value}>
                <line
                  x1={chartGeometry.left}
                  y1={y}
                  x2={chartGeometry.right}
                  y2={y}
                  className="overview-budget-chart__gridline"
                />

                <text
                  x="26"
                  y={y + 3}
                  textAnchor="end"
                  className="overview-budget-chart__axis-label"
                >
                  {value.toFixed(1)}M
                </text>
              </g>
            );
          })}

          {budgetData.map((item, index) => {
            const groupCenter = 77 + index * 77;
            const barWidth = 24;
            const gap = 5;

            const actualX = groupCenter - barWidth - gap / 2;
            const budgetX = groupCenter + gap / 2;

            const actualY = getBarY(item.actual);
            const budgetY = getBarY(item.budget);

            return (
              <g key={item.quarter}>
                <rect
                  x={actualX}
                  y={actualY}
                  width={barWidth}
                  height={getBarHeight(item.actual)}
                  rx="1"
                  className="overview-budget-chart__bar--actual"
                />

                <rect
                  x={budgetX}
                  y={budgetY}
                  width={barWidth}
                  height={getBarHeight(item.budget)}
                  rx="1"
                  className="overview-budget-chart__bar--budget"
                />

                <text
                  x={actualX + barWidth / 2}
                  y={actualY - 5}
                  textAnchor="middle"
                  className="overview-budget-chart__value"
                >
                  {formatMillions(item.actual)}
                </text>

                <text
                  x={budgetX + barWidth / 2}
                  y={budgetY - 5}
                  textAnchor="middle"
                  className="overview-budget-chart__value overview-budget-chart__value--budget"
                >
                  {formatMillions(item.budget)}
                </text>

                <text
                  x={groupCenter}
                  y="191"
                  textAnchor="middle"
                  className="overview-budget-chart__quarter"
                >
                  {item.quarter}
                </text>

                <text
                  x={groupCenter}
                  y="204"
                  textAnchor="middle"
                  className="overview-budget-chart__period"
                >
                  {item.period}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </article>
  );
}

function AdmissionsChart() {
  const radius = 49;
  const circumference = 2 * Math.PI * radius;
  const total = admissionsData.reduce((sum, item) => sum + item.count, 0);

  let accumulatedLength = 0;

  return (
    <article className="overview-chart-card overview-admissions-card">
      <div className="overview-chart-card__heading">
        <h2>Admissions Pipeline Breakdown</h2>
      </div>

      <div className="overview-admissions-chart">
        <svg
          className="overview-admissions-chart__svg"
          viewBox="0 0 160 160"
          role="img"
          aria-label="Admissions pipeline: 2,450 applications, including qualified, interview, accepted, and other applications"
        >
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#edf0f7"
            strokeWidth="15"
          />

          {admissionsData.map((item) => {
            const segmentLength = (item.count / total) * circumference;
            const offset = accumulatedLength;

            accumulatedLength += segmentLength;

            return (
              <circle
                key={item.id}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="15"
                strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 80 80)"
                className="overview-admissions-chart__segment"
              />
            );
          })}

          <text
            x="80"
            y="78"
            textAnchor="middle"
            className="overview-admissions-chart__total"
          >
            2,450
          </text>

          <text
            x="80"
            y="91"
            textAnchor="middle"
            className="overview-admissions-chart__caption"
          >
            APPLICATIONS
          </text>
        </svg>
      </div>

      <div
        className="overview-admissions-legend"
        aria-label="Admissions categories"
      >
        {admissionsData.map((item) => (
          <div className="overview-admissions-legend__item" key={item.id}>
            <span
              className="overview-admissions-legend__dot"
              style={{ backgroundColor: item.color }}
            />

            <span className="overview-admissions-legend__label">
              {item.label}
            </span>

            <div className="overview-admissions-legend__values">
              <span className="overview-admissions-legend__count">
                {item.count.toLocaleString("en-US")}
              </span>

              <span
                className="overview-admissions-legend__percentage"
                style={{ backgroundColor: item.color }}
              >
                {item.percentage}
              </span>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export function OverviewCharts() {
  return (
    <section className="overview-charts" aria-label="Budget and admissions">
      <BudgetChart />
      <AdmissionsChart />
    </section>
  );
}