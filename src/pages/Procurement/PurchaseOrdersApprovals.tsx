
import { useMemo, useState } from "react";
import {
  Search,
  ShoppingCart,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  ChevronDown,
  
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
import "./PurchaseOrdersApprovals.css";

type OrderStatus =
  | "Pending Approval"
  | "Approved"
  | "Completed"
  | "Delayed"
  | "Rejected";

type PurchaseOrder = {
  id: string;
  supplier: string;
  department: string;
  requestDate: string;
  deliveryDate: string;
  amount: number;
  status: OrderStatus;
  priority: "High" | "Medium" | "Low";
  requester: string;
};

const demoOrders: PurchaseOrder[] = [
  {
    id: "PO-2026-001",
    supplier: "Office Supplies Uganda",
    department: "Administration",
    requestDate: "2026-10-15",
    deliveryDate: "2026-10-24",
    amount: 2850000,
    status: "Pending Approval",
    priority: "High",
    requester: "Sarah Namusoke",
  },
  {
    id: "PO-2026-002",
    supplier: "Kampala Educational Books",
    department: "Academics",
    requestDate: "2026-10-14",
    deliveryDate: "2026-10-22",
    amount: 4750000,
    status: "Approved",
    priority: "High",
    requester: "David Okello",
  },
  {
    id: "PO-2026-003",
    supplier: "Fresh Foods Distributors",
    department: "Catering",
    requestDate: "2026-10-12",
    deliveryDate: "2026-10-18",
    amount: 1920000,
    status: "Delayed",
    priority: "High",
    requester: "Grace Achieng",
  },
  {
    id: "PO-2026-004",
    supplier: "Techline Solutions",
    department: "ICT",
    requestDate: "2026-10-11",
    deliveryDate: "2026-10-25",
    amount: 8200000,
    status: "Pending Approval",
    priority: "Medium",
    requester: "Peter Mugisha",
  },
  {
    id: "PO-2026-005",
    supplier: "CleanCare Services",
    department: "Operations",
    requestDate: "2026-10-09",
    deliveryDate: "2026-10-17",
    amount: 1340000,
    status: "Completed",
    priority: "Low",
    requester: "Mary Nabirye",
  },
  {
    id: "PO-2026-006",
    supplier: "SafeGuard Systems",
    department: "Security",
    requestDate: "2026-10-08",
    deliveryDate: "2026-10-20",
    amount: 3600000,
    status: "Approved",
    priority: "Medium",
    requester: "James Ssemanda",
  },
  {
    id: "PO-2026-007",
    supplier: "Kampala Educational Books",
    department: "Academics",
    requestDate: "2026-10-06",
    deliveryDate: "2026-10-16",
    amount: 2150000,
    status: "Rejected",
    priority: "Low",
    requester: "Esther Akello",
  },
  {
    id: "PO-2026-008",
    supplier: "Office Supplies Uganda",
    department: "Administration",
    requestDate: "2026-10-04",
    deliveryDate: "2026-10-14",
    amount: 980000,
    status: "Completed",
    priority: "Low",
    requester: "Daniel Kato",
  },
];

const activityData = [
  { month: "May", orders: 28, completed: 21 },
  { month: "Jun", orders: 34, completed: 27 },
  { month: "Jul", orders: 31, completed: 25 },
  { month: "Aug", orders: 42, completed: 34 },
  { month: "Sep", orders: 38, completed: 31 },
  { month: "Oct", orders: 46, completed: 32 },
];

const statusOptions = [
  "All Statuses",
  "Pending Approval",
  "Approved",
  "Completed",
  "Delayed",
  "Rejected",
];

const currency = (amount: number) =>
  new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
  }).format(amount);



function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`po-status po-status--${status
        .toLowerCase()
        .replaceAll(" ", "-")}`}
    >
      <span className="po-status__dot" />
      {status}
    </span>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: PurchaseOrder["priority"];
}) {
  return (
    <span className={`po-priority po-priority--${priority.toLowerCase()}`}>
      {priority}
    </span>
  );
}

export default function PurchaseOrdersApprovals() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(
    null
  );

  const departments = useMemo(
    () => [
      "All Departments",
      ...Array.from(new Set(demoOrders.map((order) => order.department))),
    ],
    []
  );

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return demoOrders.filter((order) => {
      const matchesSearch =
        !query ||
        [
          order.id,
          order.supplier,
          order.department,
          order.requester,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All Statuses" || order.status === statusFilter;

      const matchesDepartment =
        departmentFilter === "All Departments" ||
        order.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [search, statusFilter, departmentFilter]);

  const pendingCount = demoOrders.filter(
    (order) => order.status === "Pending Approval"
  ).length;
  const completedCount = demoOrders.filter(
    (order) => order.status === "Completed"
  ).length;
  const delayedCount = demoOrders.filter(
    (order) => order.status === "Delayed"
  ).length;
  const totalValue = demoOrders.reduce((sum, order) => sum + order.amount, 0);

  const exportCsv = () => {
    const headers = [
      "Order ID",
      "Supplier",
      "Department",
      "Requester",
      "Request Date",
      "Expected Delivery",
      "Amount UGX",
      "Priority",
      "Status",
    ];

    const rows = filteredOrders.map((order) => [
      order.id,
      order.supplier,
      order.department,
      order.requester,
      order.requestDate,
      order.deliveryDate,
      order.amount,
      order.priority,
      order.status,
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
    link.download = "purchase-orders.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="po-page">
      <header className="po-page__header">
        

        <div className="po-page__actions">
          <button className="po-button po-button--secondary" onClick={exportCsv}>
            <Download size={17} />
            Export CSV
          </button>
          
        </div>
      </header>

      

      <section className="po-metrics" aria-label="Purchase order summary">
        <article className="po-metric-card">
          <div className="po-metric-card__top">
            <span className="po-metric-card__icon po-icon--blue">
              <ShoppingCart size={20} />
            </span>
            <span className="po-metric-card__trend po-trend--positive">
              <ArrowUpRight size={15} /> 12.5%
            </span>
          </div>
          <p className="po-metric-card__label">Total Purchase Orders</p>
          <h2>53</h2>
          <p className="po-metric-card__foot">
            <strong>{currency(totalValue)}</strong> in demo order value
          </p>
        </article>

        <article className="po-metric-card">
          <div className="po-metric-card__top">
            <span className="po-metric-card__icon po-icon--amber">
              <Clock3 size={20} />
            </span>
            <span className="po-metric-card__tag">Needs attention</span>
          </div>
          <p className="po-metric-card__label">Pending Approvals</p>
          <h2>{pendingCount + 7}</h2>
          <p className="po-metric-card__foot">
            <strong>{pendingCount}</strong> shown in the sample table
          </p>
        </article>

        <article className="po-metric-card">
          <div className="po-metric-card__top">
            <span className="po-metric-card__icon po-icon--green">
              <CheckCircle2 size={20} />
            </span>
            <span className="po-metric-card__trend po-trend--positive">
              <ArrowUpRight size={15} /> 8.2%
            </span>
          </div>
          <p className="po-metric-card__label">Completed Orders</p>
          <h2>32</h2>
          <p className="po-metric-card__foot">
            <strong>{completedCount}</strong> shown in the sample table
          </p>
        </article>

        <article className="po-metric-card">
          <div className="po-metric-card__top">
            <span className="po-metric-card__icon po-icon--red">
              <AlertTriangle size={20} />
            </span>
            <span className="po-metric-card__trend po-trend--negative">
              <ArrowDownRight size={15} /> 3.1%
            </span>
          </div>
          <p className="po-metric-card__label">Delayed Orders</p>
          <h2>7</h2>
          <p className="po-metric-card__foot">
            <strong>{delayedCount}</strong> shown in the sample table
          </p>
        </article>
      </section>

      <section className="po-chart-panel">
        <div className="po-section-heading">
          <div>
            <h2>Purchase Order Activity</h2>
            <p>Orders raised compared with completed orders</p>
          </div>
          <span className="po-period-label">Last 6 months</span>
        </div>

        <div className="po-chart-legend">
          <span><i className="po-legend-dot po-legend-dot--orders" /> Orders raised</span>
          <span><i className="po-legend-dot po-legend-dot--completed" /> Completed</span>
        </div>

        <div className="po-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activityData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              barGap={7}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9edf3" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#788397", fontSize: 12 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#788397", fontSize: 12 }}
                width={32}
              />
              <Tooltip
                cursor={{ fill: "#f4f6fa" }}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e4e9f0",
                  boxShadow: "0 8px 24px rgba(20, 34, 60, 0.08)",
                }}
              />
              <Bar dataKey="orders" fill="#2AA4DD" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="completed" fill="#203468" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="po-orders-panel">
        <div className="po-section-heading po-orders-panel__heading">
          <div>
            <h2>Purchase Orders</h2>
            <p>Review order details and monitor approval progress</p>
          </div>
          <span className="po-result-count">
            {filteredOrders.length} of {demoOrders.length} sample orders
          </span>
        </div>

        <div className="po-filters">
          <label className="po-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, supplier, department..."
              aria-label="Search purchase orders"
            />
          </label>

          <label className="po-select-wrap">
            <span className="po-sr-only">Filter by status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </label>

          <label className="po-select-wrap">
            <span className="po-sr-only">Filter by department</span>
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
            >
              {departments.map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </label>
        </div>

        <div className="po-table-scroll">
          <table className="po-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Supplier / Department</th>
                <th>Request Date</th>
                <th>Expected Delivery</th>
                <th>Amount</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td><span className="po-order-id">{order.id}</span></td>
                  <td>
                    <div className="po-supplier-name">{order.supplier}</div>
                    <div className="po-department-name">{order.department}</div>
                  </td>
                  <td>{order.requestDate}</td>
                  <td>{order.deliveryDate}</td>
                  <td className="po-amount">{currency(order.amount)}</td>
                  <td><PriorityBadge priority={order.priority} /></td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>
                    <button
                      className="po-view-button"
                      aria-label={`View ${order.id}`}
                      title={`View ${order.id}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye size={17} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="po-empty-state">
                    No orders match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedOrder && (
        <div
          className="po-modal-backdrop"
          onClick={() => setSelectedOrder(null)}
          role="presentation"
        >
          <section
            className="po-order-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="po-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="po-order-modal__header">
              <div>
                <span className="po-eyebrow">PURCHASE ORDER DETAILS</span>
                <h2 id="po-modal-title">{selectedOrder.id}</h2>
              </div>
              <button
                className="po-modal-close"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
              >
                ×
              </button>
            </div>

            <StatusBadge status={selectedOrder.status} />

            <dl className="po-order-details">
              <div><dt>Supplier</dt><dd>{selectedOrder.supplier}</dd></div>
              <div><dt>Department</dt><dd>{selectedOrder.department}</dd></div>
              <div><dt>Requested by</dt><dd>{selectedOrder.requester}</dd></div>
              <div><dt>Request date</dt><dd>{selectedOrder.requestDate}</dd></div>
              <div><dt>Expected delivery</dt><dd>{selectedOrder.deliveryDate}</dd></div>
              <div><dt>Priority</dt><dd><PriorityBadge priority={selectedOrder.priority} /></dd></div>
              <div className="po-order-details__amount">
                <dt>Order amount</dt><dd>{currency(selectedOrder.amount)}</dd>
              </div>
            </dl>

            <p className="po-modal-note">
              This is sample data. Approval actions and supplier updates will
              be enabled when the page is connected to the procurement workflow.
            </p>

            <button
              className="po-button po-button--primary po-modal-done"
              onClick={() => setSelectedOrder(null)}
            >
              Close Details
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
