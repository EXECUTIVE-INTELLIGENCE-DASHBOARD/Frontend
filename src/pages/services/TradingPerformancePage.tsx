import { Receipt, ShoppingBag, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../../lib/api";
import "./TradingPerformancePage.css";

type Outlet = {
  id: number;
  name: string;
  business_type: string;
  business_type_display: string;
};

type OutletPerformance = {
  id: number;
  name: string;
  business_type: string;
  business_type_display: string;
  revenue: number | string;
  gross_margin: number | null;
  transactions: number;
  average_sale: number | string | null;
};

type MonthlyTrend = {
  month: string;
  label: string;
  revenue: number | string;
};

type SalesDashboard = {
  start: string;
  end: string;
  summary: {
    total_sales: number | string;
    gross_profit: number | string;
    gross_margin: number | null;
    transactions: number;
    average_sale: number | string | null;
  };
  monthly_trend: MonthlyTrend[];
  outlets: OutletPerformance[];
};

type OutletTypeSummary = {
  name: string;
  revenue: number;
  transactions: number;
  share: number;
};

const today = new Date();

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatMoney(value: number | string | null | undefined): string {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return "—";
  }

  return `UGX ${new Intl.NumberFormat("en-UG", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

function formatCompactMoney(value: number): string {
  return `UGX ${new Intl.NumberFormat("en-UG", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)}`;
}

function formatNumber(value: number | null | undefined): string {
  return new Intl.NumberFormat("en-UG", {
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function formatPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(1)}%`;
}

function SalesTrendChart({ data }: { data: MonthlyTrend[] }) {
  const width = 520;
  const height = 220;
  const left = 48;
  const right = 12;
  const top = 18;
  const bottom = 34;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;

  const values = data.map((item) => Number(item.revenue) || 0);
  const maximum = Math.max(...values, 1);
  const roundedMaximum = Math.ceil(maximum / 4) * 4 || 4;

  const points = data.map((item, index) => {
    const value = Number(item.revenue) || 0;
    const x =
      data.length <= 1
        ? left + chartWidth / 2
        : left + (index / (data.length - 1)) * chartWidth;
    const y = top + chartHeight - (value / roundedMaximum) * chartHeight;

    return { x, y, item, value };
  });

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const area = points.length
    ? `${line} L ${points[points.length - 1].x} ${top + chartHeight} L ${points[0].x} ${top + chartHeight} Z`
    : "";

  return (
    <div className="tp-chart-scroll">
      {data.length === 0 ? (
        <div className="tp-empty">
          No trend data is available for this period.
        </div>
      ) : (
        <svg
          className="tp-chart"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Monthly sales trend"
        >
          <defs>
            <linearGradient id="tp-sales-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#347ff0" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#347ff0" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3, 4].map((tick) => {
            const y = top + (tick / 4) * chartHeight;
            const value = roundedMaximum * (1 - tick / 4);

            return (
              <g key={tick}>
                <line
                  x1={left}
                  y1={y}
                  x2={width - right}
                  y2={y}
                  className="tp-chart-grid"
                />
                <text x={left - 8} y={y + 4} textAnchor="end">
                  {formatCompactMoney(value)}
                </text>
              </g>
            );
          })}

          <path d={area} fill="url(#tp-sales-fill)" />
          <path d={line} className="tp-chart-line" />

          {points.map((point, index) => (
            <circle
              key={`${point.item.month}-${index}`}
              cx={point.x}
              cy={point.y}
              r="3"
              className="tp-chart-point"
            >
              <title>
                {point.item.label}: {formatMoney(point.value)}
              </title>
            </circle>
          ))}

          {points.map((point) => (
            <text
              key={`${point.item.month}-label`}
              x={point.x}
              y={height - 10}
              textAnchor="middle"
            >
              {point.item.label}
            </text>
          ))}
        </svg>
      )}
    </div>
  );
}

export default function TradingPerformancePage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [dashboard, setDashboard] = useState<SalesDashboard | null>(null);

  const [startDate, setStartDate] = useState(`${today.getFullYear()}-01-01`);
  const [endDate, setEndDate] = useState(formatDate(today));
  const [selectedOutlet, setSelectedOutlet] = useState("all");

  const [loading, setLoading] = useState(true);
  const [outletsLoading, setOutletsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOutlets() {
      setOutletsLoading(true);

      try {
        const response = await apiClient.get<Outlet[]>("/services/outlets/");

        if (active) {
          setOutlets(Array.isArray(response.data) ? response.data : []);
        }
      } catch {
        if (active) {
          setError("Unable to load the outlet list. Please try again.");
        }
      } finally {
        if (active) {
          setOutletsLoading(false);
        }
      }
    }

    void loadOutlets();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      if (!startDate || !endDate || startDate > endDate) {
        setError("Please select a valid date range.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const params: Record<string, string> = {
          start: startDate,
          end: endDate,
        };

        if (selectedOutlet !== "all") {
          params.outlet = selectedOutlet;
        }

        const response = await apiClient.get<SalesDashboard>(
          "/services/sales/dashboard/",
          { params },
        );

        if (active) {
          setDashboard(response.data);
        }
      } catch {
        if (active) {
          setDashboard(null);
          setError("Unable to load sales performance data. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [startDate, endDate, selectedOutlet]);

  const summary = dashboard?.summary;

  const outletTypeSummary = useMemo<OutletTypeSummary[]>(() => {
    const rows = dashboard?.outlets ?? [];
    const groups = new Map<string, { revenue: number; transactions: number }>();

    rows.forEach((outlet) => {
      const name =
        outlet.business_type_display || outlet.business_type || "Other";
      const current = groups.get(name) ?? { revenue: 0, transactions: 0 };

      current.revenue += Number(outlet.revenue) || 0;
      current.transactions += Number(outlet.transactions) || 0;

      groups.set(name, current);
    });

    const total = [...groups.values()].reduce(
      (sum, group) => sum + group.revenue,
      0,
    );

    return [...groups.entries()]
      .map(([name, group]) => ({
        name,
        revenue: group.revenue,
        transactions: group.transactions,
        share: total > 0 ? (group.revenue / total) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [dashboard?.outlets]);

  const chartData = dashboard?.monthly_trend ?? [];
  const tableOutlets = dashboard?.outlets ?? [];

  return (
    <main className="trading-page">
      <header className="tp-header">
        <div className="tp-filters">
          <label className="tp-filter">
            <span>Date range</span>
            <div className="tp-date-fields">
              <input
                aria-label="Start date"
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) => setStartDate(event.target.value)}
              />
              <span>to</span>
              <input
                aria-label="End date"
                type="date"
                value={endDate}
                min={startDate || undefined}
                max={formatDate(today)}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </label>

          <label className="tp-filter">
            <span>Outlet</span>
            <select
              aria-label="Outlet"
              value={selectedOutlet}
              onChange={(event) => setSelectedOutlet(event.target.value)}
              disabled={outletsLoading}
            >
              <option value="all">All Outlets</option>
              {outlets.map((outlet) => (
                <option key={outlet.id} value={String(outlet.id)}>
                  {outlet.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {error && (
        <div className="tp-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => {
              setError("");
              setStartDate((current) => current);
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      <section className="tp-kpis" aria-label="Sales summary">
        <article className="tp-kpi">
          <div className="tp-kpi-heading">
            <span className="tp-kpi-icon" aria-hidden="true">
              <ShoppingBag size={18} />
            </span>
            <span>Total Sales</span>
          </div>
          <div className="tp-kpi-value">
            {loading ? "Loading…" : formatMoney(summary?.total_sales)}
          </div>
          <div className="tp-kpi-note">
            {dashboard
              ? `${dashboard.start} to ${dashboard.end}`
              : "Selected period"}
          </div>
        </article>

        <article className="tp-kpi">
          <div className="tp-kpi-heading">
            <span className="tp-kpi-icon" aria-hidden="true">
              <TrendingUp size={18} />
            </span>
            <span>Gross Profit</span>
          </div>
          <div className="tp-kpi-value">
            {loading ? "Loading…" : formatMoney(summary?.gross_profit)}
          </div>
          <div className="tp-kpi-note">
            Gross margin: {loading ? "—" : formatPercent(summary?.gross_margin)}
          </div>
        </article>

        <article className="tp-kpi">
          <div className="tp-kpi-heading">
            <span className="tp-kpi-icon" aria-hidden="true">
              <Receipt size={18} />
            </span>
            <span>Transactions</span>
          </div>
          <div className="tp-kpi-value">
            {loading ? "Loading…" : formatNumber(summary?.transactions)}
          </div>
          <div className="tp-kpi-note">
            Average sale: {loading ? "—" : formatMoney(summary?.average_sale)}
          </div>
        </article>
      </section>

      <section className="tp-panels">
        <article className="tp-panel">
          <h2 className="tp-panel-title">
            <span className="tp-title-icon" aria-hidden="true">
              ▥
            </span>
            Monthly Sales Trend
            <span className="tp-legend">
              <span className="tp-legend-dot" />
              Revenue (UGX)
            </span>
          </h2>

          {loading ? (
            <div className="tp-empty">Loading trend data…</div>
          ) : (
            <SalesTrendChart data={chartData} />
          )}
        </article>

        <article className="tp-panel">
          <h2 className="tp-panel-title">
            <span className="tp-title-icon" aria-hidden="true">
              ◷
            </span>
            Sales by Outlet Type
          </h2>

          {loading ? (
            <div className="tp-empty">Loading outlet data…</div>
          ) : outletTypeSummary.length === 0 ? (
            <div className="tp-empty">No outlet type data is available.</div>
          ) : (
            <div className="tp-donut-layout">
              <div
                className="tp-donut"
                style={{
                  background: `conic-gradient(${outletTypeSummary
                    .map((item, index) => {
                      const colors = [
                        "#194f9d",
                        "#ffc62f",
                        "#1ba9d0",
                        "#7195ce",
                        "#77b8a5",
                      ];
                      const start = outletTypeSummary
                        .slice(0, index)
                        .reduce((sum, entry) => sum + entry.share, 0);
                      return `${colors[index % colors.length]} ${start}% ${start + item.share}%`;
                    })
                    .join(", ")})`,
                }}
                role="img"
                aria-label="Sales share by outlet type"
              >
                <div className="tp-donut-center">
                  <span>Total Sales</span>
                  <strong>
                    {formatCompactMoney(Number(summary?.total_sales) || 0)}
                  </strong>
                </div>
              </div>

              <div className="tp-type-legend">
                {outletTypeSummary.map((item, index) => {
                  const colors = [
                    "#194f9d",
                    "#ffc62f",
                    "#1ba9d0",
                    "#7195ce",
                    "#77b8a5",
                  ];

                  return (
                    <div className="tp-type-row" key={item.name}>
                      <span
                        className="tp-swatch"
                        style={{ background: colors[index % colors.length] }}
                      />
                      <div>
                        <strong>{item.name}</strong>
                        <span>{formatPercent(item.share)}</span>
                        <small>{formatMoney(item.revenue)}</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </article>
      </section>

      <section className="tp-panels tp-lower-panels">
        <article className="tp-panel tp-table-panel">
          <h2 className="tp-panel-title">
            <span className="tp-title-icon" aria-hidden="true">
              ▤
            </span>
            Sales by Outlet
          </h2>

          <div className="tp-table-scroll">
            <table className="tp-table">
              <thead>
                <tr>
                  <th>Outlet</th>
                  <th>Business Type</th>
                  <th>Revenue (UGX)</th>
                  <th>Gross Margin</th>
                  <th>Transactions</th>
                  <th>Average Sale (UGX)</th>
                </tr>
              </thead>
              <tbody>
                {!loading && tableOutlets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="tp-table-empty">
                      No outlet data is available for this period.
                    </td>
                  </tr>
                )}

                {tableOutlets.map((outlet) => (
                  <tr key={outlet.id}>
                    <td>{outlet.name}</td>
                    <td>
                      <span className="tp-business-type">
                        {outlet.business_type_display || outlet.business_type}
                      </span>
                    </td>
                    <td>{formatMoney(outlet.revenue)}</td>
                    <td>{formatPercent(outlet.gross_margin)}</td>
                    <td>{formatNumber(outlet.transactions)}</td>
                    <td>{formatMoney(outlet.average_sale)}</td>
                  </tr>
                ))}

                {loading && (
                  <tr>
                    <td colSpan={6} className="tp-table-empty">
                      Loading outlet results…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="tp-panel">
          <h2 className="tp-panel-title">
            <span className="tp-title-icon" aria-hidden="true">
              ◉
            </span>
            Outlet Type Performance
          </h2>

          {loading ? (
            <div className="tp-empty">Loading outlet performance…</div>
          ) : outletTypeSummary.length === 0 ? (
            <div className="tp-empty">
              No outlet performance data is available.
            </div>
          ) : (
            <div className="tp-performance-list">
              {outletTypeSummary.map((item, index) => {
                const colors = [
                  "#194f9d",
                  "#ffc62f",
                  "#1ba9d0",
                  "#7195ce",
                  "#77b8a5",
                ];

                return (
                  <div className="tp-performance-row" key={item.name}>
                    <span
                      className="tp-performance-bar"
                      style={{ background: colors[index % colors.length] }}
                    />
                    <div className="tp-performance-content">
                      <strong>{item.name}</strong>
                      <div className="tp-performance-meta">
                        <span>{formatCompactMoney(item.revenue)}</span>
                        <span>{formatPercent(item.share)} of sales</span>
                        <span>
                          {formatNumber(item.transactions)} transactions
                        </span>
                      </div>
                      <div className="tp-progress">
                        <span
                          style={{
                            width: `${Math.min(Math.max(item.share, 0), 100)}%`,
                            background: colors[index % colors.length],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
