import type {
  OverviewAdmissionStage,
  OverviewBudgetRow,
} from "../../pages/ExecutiveOverview/executiveOverview.api";

import "./OverviewCharts.css";

interface OverviewChartsProps {
  budgetRows: OverviewBudgetRow[];
  admissions: {
    total: number;
    stages: OverviewAdmissionStage[];
  } | null;
}

const chartGeometry = {
  left: 38,
  right: 392,
  top: 24,
  bottom: 176,
};

const chartHeight = chartGeometry.bottom - chartGeometry.top;
const stageColors = ["#2AA4DD", "#F1BA1B", "#18264b", "#94a3b8", "#50a778"];

function formatMillions(value: number): string {
  return `${(value / 1_000_000).toFixed(1)}M`;
}

function BudgetChart({ rows }: { rows: OverviewBudgetRow[] }) {
  const maximum = Math.max(
    0,
    ...rows.map((row) => Math.max(row.spent, row.budget)),
  );
  const maxMillions = maximum / 1_000_000;
  const chartMax = maxMillions === 0 ? 5 : Math.ceil(maxMillions / 5) * 5;
  const scale = Array.from({ length: 6 }, (_, index) => (chartMax / 5) * index);
  const getBarY = (value: number) =>
    chartGeometry.bottom - (value / chartMax) * chartHeight;
  const getBarHeight = (value: number) => (value / chartMax) * chartHeight;

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

      {rows.length === 0 ? (
        <p className="overview-chart-empty" role="status">
          Budget data is unavailable for this selection.
        </p>
      ) : (
        <div className="overview-budget-chart">
          <svg
            className="overview-budget-chart__svg"
            viewBox="0 0 410 218"
            role="img"
            aria-label="Actual spending compared with budget targets by campus, in millions of UGX"
          >
            {scale.map((value) => {
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
                    x="32"
                    y={y + 3}
                    textAnchor="end"
                    className="overview-budget-chart__axis-label"
                  >
                    {value.toFixed(1)}M
                  </text>
                </g>
              );
            })}

            {rows.map((item, index) => {
              const groupCenter =
                chartGeometry.left +
                ((chartGeometry.right - chartGeometry.left) * (index + 0.5)) /
                  rows.length;
              const barWidth = Math.min(24, 50 / rows.length);
              const gap = 5;
              const spent = item.spent / 1_000_000;
              const budget = item.budget / 1_000_000;
              const spentX = groupCenter - barWidth - gap / 2;
              const budgetX = groupCenter + gap / 2;
              const spentY = getBarY(spent);
              const budgetY = getBarY(budget);

              return (
                <g key={item.id}>
                  <title>{item.label}</title>
                  <rect
                    x={spentX}
                    y={spentY}
                    width={barWidth}
                    height={getBarHeight(spent)}
                    rx="1"
                    className="overview-budget-chart__bar--actual"
                  />

                  <rect
                    x={budgetX}
                    y={budgetY}
                    width={barWidth}
                    height={getBarHeight(budget)}
                    rx="1"
                    className="overview-budget-chart__bar--budget"
                  />

                  <text
                    x={spentX + barWidth / 2}
                    y={spentY - 5}
                    textAnchor="middle"
                    className="overview-budget-chart__value"
                  >
                    {formatMillions(item.spent)}
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
                    y="197"
                    textAnchor="middle"
                    className="overview-budget-chart__quarter"
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </article>
  );
}

function AdmissionsChart({
  data,
}: {
  data: OverviewChartsProps["admissions"];
}) {
  const radius = 49;
  const circumference = 2 * Math.PI * radius;
  const stages = data?.stages ?? [];
  const total = data?.total ?? 0;
  let accumulatedLength = 0;

  return (
    <article className="overview-chart-card overview-admissions-card">
      <div className="overview-chart-card__heading">
        <h2>Admissions Pipeline Breakdown</h2>
      </div>

      {data === null ? (
        <p className="overview-chart-empty" role="status">
          Admissions data is unavailable.
        </p>
      ) : (
        <>
          <div className="overview-admissions-chart">
            <svg
              className="overview-admissions-chart__svg"
              viewBox="0 0 160 160"
              role="img"
              aria-label={`Admissions pipeline: ${total.toLocaleString("en-US")} applications`}
            >
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#edf0f7"
                strokeWidth="15"
              />

              {total > 0 &&
                stages.map((item, index) => {
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
                      stroke={stageColors[index % stageColors.length]}
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
                {total.toLocaleString("en-US")}
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
            {stages.length === 0 ? (
              <p className="overview-chart-empty" role="status">
                No application pipeline data is available.
              </p>
            ) : (
              stages.map((item, index) => (
                <div className="overview-admissions-legend__item" key={item.id}>
                  <span
                    className="overview-admissions-legend__dot"
                    style={{
                      backgroundColor:
                        stageColors[index % stageColors.length],
                    }}
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
                      style={{
                        backgroundColor:
                          stageColors[index % stageColors.length],
                      }}
                    >
                      {total > 0
                        ? `${((item.count / total) * 100).toFixed(1)}%`
                        : "—"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </article>
  );
}

export function OverviewCharts(props: OverviewChartsProps) {
  return (
    <section className="overview-charts" aria-label="Budget and admissions">
      <BudgetChart rows={props.budgetRows} />
      <AdmissionsChart data={props.admissions} />
    </section>
  );
}
