
import { useMemo, useState } from "react";
import {
  Search,
  Download,
  Truck,
  Star,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  ChevronDown,
  Users,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "./SupplierPerformance.css";

type SupplierStatus = "Active" | "Under Review" | "Inactive";
type SupplierRating = "Excellent" | "Good" | "Needs Improvement";

type Supplier = {
  id: string;
  name: string;
  category: string;
  contact: string;
  orders: number;
  onTimeRate: number;
  qualityRate: number;
  spend: number;
  issues: number;
  rating: SupplierRating;
  status: SupplierStatus;
};

const suppliers: Supplier[] = [
  {
    id: "SUP-001",
    name: "Kampala Educational Books",
    category: "Books & Learning Materials",
    contact: "procurement@demo-supplier.ug",
    orders: 24,
    onTimeRate: 96,
    qualityRate: 98,
    spend: 48500000,
    issues: 1,
    rating: "Excellent",
    status: "Active",
  },
  {
    id: "SUP-002",
    name: "Office Supplies Uganda",
    category: "Stationery & Office Supplies",
    contact: "orders@demo-supplier.ug",
    orders: 19,
    onTimeRate: 89,
    qualityRate: 94,
    spend: 28700000,
    issues: 3,
    rating: "Good",
    status: "Active",
  },
  {
    id: "SUP-003",
    name: "Fresh Foods Distributors",
    category: "Food & Catering",
    contact: "sales@demo-supplier.ug",
    orders: 16,
    onTimeRate: 68,
    qualityRate: 82,
    spend: 36400000,
    issues: 7,
    rating: "Needs Improvement",
    status: "Under Review",
  },
  {
    id: "SUP-004",
    name: "Techline Solutions",
    category: "ICT Equipment",
    contact: "support@demo-supplier.ug",
    orders: 12,
    onTimeRate: 92,
    qualityRate: 96,
    spend: 57200000,
    issues: 2,
    rating: "Excellent",
    status: "Active",
  },
  {
    id: "SUP-005",
    name: "CleanCare Services",
    category: "Cleaning & Hygiene",
    contact: "service@demo-supplier.ug",
    orders: 14,
    onTimeRate: 85,
    qualityRate: 88,
    spend: 19200000,
    issues: 4,
    rating: "Good",
    status: "Active",
  },
  {
    id: "SUP-006",
    name: "SafeGuard Systems",
    category: "Security Equipment",
    contact: "info@demo-supplier.ug",
    orders: 8,
    onTimeRate: 73,
    qualityRate: 79,
    spend: 25100000,
    issues: 6,
    rating: "Needs Improvement",
    status: "Under Review",
  },
];

const performanceTrend = [
  { month: "May", onTime: 88, quality: 91 },
  { month: "Jun", onTime: 90, quality: 92 },
  { month: "Jul", onTime: 86, quality: 90 },
  { month: "Aug", onTime: 92, quality: 94 },
  { month: "Sep", onTime: 89, quality: 93 },
  { month: "Oct", onTime: 91, quality: 94 },
];

const money = (amount: number) =>
  new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
  }).format(amount);

function RatingBadge({ rating }: { rating: SupplierRating }) {
  return (
    <span
      className={`sp-rating sp-rating--${rating
        .toLowerCase()
        .replaceAll(" ", "-")}`}
    >
      {rating}
    </span>
  );
}

function SupplierStatusBadge({ status }: { status: SupplierStatus }) {
  return (
    <span
      className={`sp-status sp-status--${status
        .toLowerCase()
        .replaceAll(" ", "-")}`}
    >
      <span className="sp-status__dot" />
      {status}
    </span>
  );
}

export default function SupplierPerformance() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [ratingFilter, setRatingFilter] = useState("All Ratings");
  const [selectedSupplier, setSelectedSupplier] =
    useState<Supplier | null>(null);

  const filteredSuppliers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const matchesSearch =
        !query ||
        [
          supplier.name,
          supplier.category,
          supplier.id,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All Statuses" ||
        supplier.status === statusFilter;

      const matchesRating =
        ratingFilter === "All Ratings" ||
        supplier.rating === ratingFilter;

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [search, statusFilter, ratingFilter]);

  const activeCount = suppliers.filter(
    (supplier) => supplier.status === "Active"
  ).length;

  const reviewCount = suppliers.filter(
    (supplier) => supplier.status === "Under Review"
  ).length;

  const totalOrders = suppliers.reduce(
    (sum, supplier) => sum + supplier.orders,
    0
  );

  const averageOnTime = Math.round(
    suppliers.reduce((sum, supplier) => sum + supplier.onTimeRate, 0) /
      suppliers.length
  );

  const totalIssues = suppliers.reduce(
    (sum, supplier) => sum + supplier.issues,
    0
  );

  const exportCsv = () => {
    const headers = [
      "Supplier ID",
      "Supplier Name",
      "Category",
      "Orders",
      "On-Time Delivery %",
      "Quality Score %",
      "Spend UGX",
      "Open Issues",
      "Rating",
      "Status",
    ];

    const rows = filteredSuppliers.map((supplier) => [
      supplier.id,
      supplier.name,
      supplier.category,
      supplier.orders,
      supplier.onTimeRate,
      supplier.qualityRate,
      supplier.spend,
      supplier.issues,
      supplier.rating,
      supplier.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "supplier-performance.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="sp-page">
      <header className="sp-header">
        
        <button
          className="sp-button sp-button--secondary"
          onClick={exportCsv}
        >
          <Download size={17} />
          Export CSV
        </button>
      </header>

      

      <section className="sp-metrics">
        <article className="sp-metric">
          <div className="sp-metric__top">
            <span className="sp-metric__icon sp-icon--blue">
              <Users size={20} />
            </span>
            <span className="sp-metric__trend sp-positive">
              <ArrowUpRight size={15} /> 2 new
            </span>
          </div>
          <p>Registered Suppliers</p>
          <h2>24</h2>
          <span className="sp-metric__foot">
            {suppliers.length} shown in this sample
          </span>
        </article>

        <article className="sp-metric">
          <div className="sp-metric__top">
            <span className="sp-metric__icon sp-icon--green">
              <CheckCircle2 size={20} />
            </span>
            <span className="sp-metric__trend sp-positive">
              Active
            </span>
          </div>
          <p>Active Suppliers</p>
          <h2>{activeCount}</h2>
          <span className="sp-metric__foot">
            Of {suppliers.length} sample suppliers
          </span>
        </article>

        <article className="sp-metric">
          <div className="sp-metric__top">
            <span className="sp-metric__icon sp-icon--amber">
              <Truck size={20} />
            </span>
            <span className="sp-metric__trend sp-positive">
              <ArrowUpRight size={15} /> 3%
            </span>
          </div>
          <p>On-Time Delivery</p>
          <h2>{averageOnTime}%</h2>
          <span className="sp-metric__foot">
            Average across sample suppliers
          </span>
        </article>

        <article className="sp-metric">
          <div className="sp-metric__top">
            <span className="sp-metric__icon sp-icon--red">
              <AlertTriangle size={20} />
            </span>
            <span className="sp-metric__trend sp-negative">
              <ArrowDownRight size={15} /> Review
            </span>
          </div>
          <p>Outstanding Issues</p>
          <h2>{totalIssues}</h2>
          <span className="sp-metric__foot">
            {reviewCount} suppliers under review
          </span>
        </article>
      </section>

      <section className="sp-panel">
        <div className="sp-section-heading">
          <div>
            <h2>Delivery &amp; Quality Trends</h2>
            <p>Monthly supplier performance indicators</p>
          </div>
          <span className="sp-period">Last 6 months</span>
        </div>

        <div className="sp-chart-legend">
          <span><i className="sp-legend-dot sp-legend-dot--delivery" /> On-time delivery</span>
          <span><i className="sp-legend-dot sp-legend-dot--quality" /> Quality score</span>
        </div>

        <div className="sp-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceTrend}
              margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
              barGap={8}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e9edf3"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#788397", fontSize: 12 }}
                dy={8}
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#788397", fontSize: 12 }}
                width={35}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value) => [`${value}%`]}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e4e9f0",
                }}
              />
              <Bar
                dataKey="onTime"
                name="On-time delivery"
                fill="#5578e8"
                radius={[5, 5, 0, 0]}
              />
              <Bar
                dataKey="quality"
                name="Quality score"
                fill="#35b68a"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="sp-panel sp-suppliers-panel">
        <div className="sp-section-heading">
          <div>
            <h2>Supplier Directory &amp; Scorecards</h2>
            <p>
              Compare supplier delivery, quality, purchasing volume, and issues.
            </p>
          </div>
          <span className="sp-result-count">
            {filteredSuppliers.length} of {suppliers.length} sample suppliers
          </span>
        </div>

        <div className="sp-filters">
          <label className="sp-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search suppliers or categories..."
              aria-label="Search suppliers"
            />
          </label>

          <label className="sp-select-wrap">
            <span className="sp-sr-only">Filter by supplier status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All Statuses</option>
              <option>Active</option>
              <option>Under Review</option>
              <option>Inactive</option>
            </select>
            <ChevronDown size={16} />
          </label>

          <label className="sp-select-wrap">
            <span className="sp-sr-only">Filter by performance rating</span>
            <select
              value={ratingFilter}
              onChange={(event) => setRatingFilter(event.target.value)}
            >
              <option>All Ratings</option>
              <option>Excellent</option>
              <option>Good</option>
              <option>Needs Improvement</option>
            </select>
            <ChevronDown size={16} />
          </label>
        </div>

        <div className="sp-table-scroll">
          <table className="sp-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Orders</th>
                <th>On-Time Delivery</th>
                <th>Quality</th>
                <th>Total Spend</th>
                <th>Open Issues</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <div className="sp-supplier-name">{supplier.name}</div>
                    <div className="sp-supplier-category">
                      {supplier.category}
                    </div>
                  </td>
                  <td>{supplier.orders}</td>
                  <td>
                    <div className="sp-score">
                      <div className="sp-progress">
                        <span
                          className={
                            supplier.onTimeRate >= 90
                              ? "sp-progress__fill sp-progress__fill--good"
                              : "sp-progress__fill sp-progress__fill--warning"
                          }
                          style={{ width: `${supplier.onTimeRate}%` }}
                        />
                      </div>
                      <strong>{supplier.onTimeRate}%</strong>
                    </div>
                  </td>
                  <td>
                    <div className="sp-score">
                      <div className="sp-progress">
                        <span
                          className={
                            supplier.qualityRate >= 90
                              ? "sp-progress__fill sp-progress__fill--good"
                              : "sp-progress__fill sp-progress__fill--warning"
                          }
                          style={{ width: `${supplier.qualityRate}%` }}
                        />
                      </div>
                      <strong>{supplier.qualityRate}%</strong>
                    </div>
                  </td>
                  <td className="sp-spend">{money(supplier.spend)}</td>
                  <td>
                    <span
                      className={`sp-issues ${
                        supplier.issues >= 5 ? "sp-issues--high" : ""
                      }`}
                    >
                      {supplier.issues}
                    </span>
                  </td>
                  <td><RatingBadge rating={supplier.rating} /></td>
                  <td><SupplierStatusBadge status={supplier.status} /></td>
                  <td>
                    <button
                      className="sp-view-button"
                      title={`View ${supplier.name}`}
                      aria-label={`View ${supplier.name}`}
                      onClick={() => setSelectedSupplier(supplier)}
                    >
                      <Eye size={17} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan={9} className="sp-empty">
                    No suppliers match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedSupplier && (
        <div
          className="sp-modal-backdrop"
          onClick={() => setSelectedSupplier(null)}
          role="presentation"
        >
          <section
            className="sp-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sp-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sp-modal__header">
              <div>
                <span className="sp-eyebrow">{selectedSupplier.id}</span>
                <h2 id="sp-modal-title">{selectedSupplier.name}</h2>
              </div>
              <button
                className="sp-modal-close"
                onClick={() => setSelectedSupplier(null)}
                aria-label="Close supplier details"
              >
                ×
              </button>
            </div>

            <SupplierStatusBadge status={selectedSupplier.status} />
            <RatingBadge rating={selectedSupplier.rating} />

            <dl className="sp-details">
              <div><dt>Category</dt><dd>{selectedSupplier.category}</dd></div>
              <div><dt>Contact (demo)</dt><dd>{selectedSupplier.contact}</dd></div>
              <div><dt>Orders</dt><dd>{selectedSupplier.orders}</dd></div>
              <div><dt>On-time delivery</dt><dd>{selectedSupplier.onTimeRate}%</dd></div>
              <div><dt>Quality score</dt><dd>{selectedSupplier.qualityRate}%</dd></div>
              <div><dt>Outstanding issues</dt><dd>{selectedSupplier.issues}</dd></div>
              <div className="sp-details__spend">
                <dt>Total recorded spend (demo)</dt>
                <dd>{money(selectedSupplier.spend)}</dd>
              </div>
            </dl>

            <p className="sp-modal-note">
              Contact details, performance scores, and spending figures are
              illustrative. Supplier management actions require verified data
              and a connected procurement system.
            </p>

            <button
              className="sp-button sp-button--primary sp-modal-done"
              onClick={() => setSelectedSupplier(null)}
            >
              Close Details
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
