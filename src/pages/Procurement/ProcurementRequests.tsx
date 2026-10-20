
import { useMemo, useState } from "react";
import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  XCircle,
  Search,
  Download,
  Eye,
  X,
  FilePlus2,
  Filter,
} from "lucide-react";
import "./ProcurementRequests.css";

type RequestStatus =
  | "Pending Approval"
  | "Approved"
  | "Rejected"
  | "Under Review";

type ProcurementRequest = {
  id: string;
  title: string;
  department: string;
  requester: string;
  date: string;
  neededBy: string;
  amount: number;
  status: RequestStatus;
  priority: "High" | "Medium" | "Low";
  items: number;
  justification: string;
};

const initialRequests: ProcurementRequest[] = [
  {
    id: "PR-2026-001",
    title: "Computer Lab Equipment",
    department: "ICT",
    requester: "ICT Manager",
    date: "2026-10-12",
    neededBy: "2026-11-05",
    amount: 12500000,
    status: "Pending Approval",
    priority: "High",
    items: 12,
    justification: "Replacement and expansion of computer lab equipment.",
  },
  {
    id: "PR-2026-002",
    title: "Classroom Learning Materials",
    department: "Academics",
    requester: "Academic Coordinator",
    date: "2026-10-13",
    neededBy: "2026-10-30",
    amount: 2450000,
    status: "Approved",
    priority: "Medium",
    items: 8,
    justification: "Learning materials required for the next academic period.",
  },
  {
    id: "PR-2026-003",
    title: "Cleaning and Sanitation Supplies",
    department: "Operations",
    requester: "Operations Officer",
    date: "2026-10-14",
    neededBy: "2026-10-25",
    amount: 980000,
    status: "Under Review",
    priority: "High",
    items: 6,
    justification: "Replenishment of cleaning and sanitation supplies.",
  },
  {
    id: "PR-2026-004",
    title: "Office Furniture",
    department: "Administration",
    requester: "Administration Officer",
    date: "2026-10-15",
    neededBy: "2026-11-15",
    amount: 3200000,
    status: "Pending Approval",
    priority: "Low",
    items: 5,
    justification: "Furniture for the administrative office.",
  },
  {
    id: "PR-2026-005",
    title: "Laboratory Consumables",
    department: "Sciences",
    requester: "Science Department Head",
    date: "2026-10-16",
    neededBy: "2026-10-28",
    amount: 1850000,
    status: "Rejected",
    priority: "Medium",
    items: 9,
    justification: "Consumables for scheduled practical lessons.",
  },
  {
    id: "PR-2026-006",
    title: "Network Maintenance Materials",
    department: "ICT",
    requester: "Network Administrator",
    date: "2026-10-18",
    neededBy: "2026-11-02",
    amount: 1650000,
    status: "Approved",
    priority: "High",
    items: 7,
    justification: "Materials required for planned network maintenance.",
  },
];

const formatUGX = (amount: number) =>
  new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
  }).format(amount);

const statusClass = (status: RequestStatus) =>
  status.toLowerCase().replaceAll(" ", "-");

export default function ProcurementRequests() {
  const [requests, setRequests] =
    useState<ProcurementRequest[]>(initialRequests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [selectedRequest, setSelectedRequest] =
    useState<ProcurementRequest | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    title: "",
    department: "ICT",
    requester: "",
    neededBy: "",
    amount: "",
    priority: "Medium" as "High" | "Medium" | "Low",
    items: "1",
    justification: "",
  });

  const filteredRequests = useMemo(() => {
    const term = search.toLowerCase().trim();

    return requests.filter((request) => {
      const matchesSearch = [
        request.id,
        request.title,
        request.department,
        request.requester,
      ].some((value) => value.toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "All" || request.status === statusFilter;

      const matchesDepartment =
        departmentFilter === "All" ||
        request.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [requests, search, statusFilter, departmentFilter]);

  const pendingCount = requests.filter(
    (r) => r.status === "Pending Approval",
  ).length;

  const reviewCount = requests.filter(
    (r) => r.status === "Under Review",
  ).length;

  const approvedCount = requests.filter(
    (r) => r.status === "Approved",
  ).length;

  const totalValue = requests
    .filter((r) => r.status !== "Rejected")
    .reduce((sum, r) => sum + r.amount, 0);

  const exportCSV = () => {
    const headers = [
      "Request ID",
      "Title",
      "Department",
      "Requester",
      "Date Submitted",
      "Required By",
      "Estimated Amount (UGX)",
      "Status",
      "Priority",
      "Number of Items",
      "Justification",
    ];

    const rows = filteredRequests.map((r) => [
      r.id,
      r.title,
      r.department,
      r.requester,
      r.date,
      r.neededBy,
      r.amount,
      r.status,
      r.priority,
      r.items,
      r.justification,
    ]);

    const escapeCSV = (value: string | number) =>
      `"${String(value).replaceAll('"', '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "procurement-requests.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const submitRequest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newRequest: ProcurementRequest = {
      id: `PR-${new Date().getFullYear()}-${String(
        requests.length + 1,
      ).padStart(3, "0")}`,
      title: form.title.trim(),
      department: form.department,
      requester: form.requester.trim(),
      date: new Date().toISOString().slice(0, 10),
      neededBy: form.neededBy,
      amount: Number(form.amount),
      status: "Pending Approval",
      priority: form.priority,
      items: Number(form.items),
      justification: form.justification.trim(),
    };

    setRequests((previous) => [newRequest, ...previous]);
    setShowForm(false);
    setForm({
      title: "",
      department: "ICT",
      requester: "",
      neededBy: "",
      amount: "",
      priority: "Medium",
      items: "1",
      justification: "",
    });
    setNotice("Request added to this page's local list.");
    setTimeout(() => setNotice(""), 3500);
  };

  const updateStatus = (status: RequestStatus) => {
    if (!selectedRequest) return;

    setRequests((previous) =>
      previous.map((request) =>
        request.id === selectedRequest.id
          ? { ...request, status }
          : request,
      ),
    );

    setSelectedRequest({ ...selectedRequest, status });
    setNotice(`Request status changed to ${status}.`);
    setTimeout(() => setNotice(""), 3500);
  };

  return (
    <div className="proc-requests-page">
      

      
      {notice && <div className="pr-notice">{notice}</div>}

      <section className="pr-kpi-grid">
        <article className="pr-kpi-card">
          <div className="pr-kpi-icon blue">
            <ClipboardList size={21} />
          </div>
          <div className="pr-kpi-label">Total Requisitions</div>
          <div className="pr-kpi-value">{requests.length}</div>
          <div className="pr-kpi-foot">All recorded requests</div>
        </article>

        <article className="pr-kpi-card">
          <div className="pr-kpi-icon amber">
            <Clock3 size={21} />
          </div>
          <div className="pr-kpi-label">Pending Approval</div>
          <div className="pr-kpi-value">{pendingCount}</div>
          <div className="pr-kpi-foot">Awaiting a decision</div>
        </article>

        <article className="pr-kpi-card">
          <div className="pr-kpi-icon purple">
            <Eye size={21} />
          </div>
          <div className="pr-kpi-label">Under Review</div>
          <div className="pr-kpi-value">{reviewCount}</div>
          <div className="pr-kpi-foot">Being assessed</div>
        </article>

        <article className="pr-kpi-card">
          <div className="pr-kpi-icon green">
            <CheckCircle2 size={21} />
          </div>
          <div className="pr-kpi-label">Approved</div>
          <div className="pr-kpi-value">{approvedCount}</div>
          <div className="pr-kpi-foot">Approved requisitions</div>
        </article>

        <article className="pr-kpi-card pr-value-card">
          <div className="pr-kpi-label">Estimated Request Value</div>
          <div className="pr-kpi-value pr-money">
            {formatUGX(totalValue)}
          </div>
          <div className="pr-kpi-foot">
            Excludes rejected requests
          </div>
        </article>
      </section>

      <section className="pr-table-card">
        <div className="pr-table-heading">
          <div>
            <h2>Requisition Register</h2>
            <p>
              {filteredRequests.length} of {requests.length} requests shown
            </p>
          </div>

          <button className="pr-secondary-btn" onClick={exportCSV}>
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <div className="pr-filter-row">
          <label className="pr-search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ID, title, department..."
            />
          </label>

          <label className="pr-select-box">
            <Filter size={15} />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="All">All statuses</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </label>

          <select
            className="pr-department-select"
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
            aria-label="Filter by department"
          >
            <option value="All">All departments</option>
            <option value="ICT">ICT</option>
            <option value="Academics">Academics</option>
            <option value="Operations">Operations</option>
            <option value="Administration">Administration</option>
            <option value="Sciences">Sciences</option>
          </select>
        </div>

        <div className="pr-table-wrap">
          <table className="pr-table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Department / Requester</th>
                <th>Date Submitted</th>
                <th>Required By</th>
                <th>Estimated Cost</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <div className="pr-request-title">{request.title}</div>
                    <div className="pr-request-id">{request.id}</div>
                  </td>
                  <td>
                    <div className="pr-dept-name">{request.department}</div>
                    <div className="pr-muted">{request.requester}</div>
                  </td>
                  <td>{request.date}</td>
                  <td>{request.neededBy}</td>
                  <td className="pr-cost">{formatUGX(request.amount)}</td>
                  <td>
                    <span className={`pr-priority ${request.priority.toLowerCase()}`}>
                      <span />
                      {request.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`pr-status ${statusClass(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="pr-view-btn"
                      aria-label={`View ${request.id}`}
                      onClick={() => setSelectedRequest(request)}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={8} className="pr-empty">
                    No requisitions match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedRequest && (
        <div
          className="pr-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRequest(null);
            }
          }}
        >
          <section
            className="pr-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pr-detail-title"
          >
            <div className="pr-modal-header">
              <div>
                <span className="pr-request-id">{selectedRequest.id}</span>
                <h2 id="pr-detail-title">{selectedRequest.title}</h2>
              </div>
              <button
                className="pr-close-btn"
                onClick={() => setSelectedRequest(null)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="pr-detail-grid">
              <div>
                <span>Department</span>
                <strong>{selectedRequest.department}</strong>
              </div>
              <div>
                <span>Requested by</span>
                <strong>{selectedRequest.requester}</strong>
              </div>
              <div>
                <span>Date submitted</span>
                <strong>{selectedRequest.date}</strong>
              </div>
              <div>
                <span>Required by</span>
                <strong>{selectedRequest.neededBy}</strong>
              </div>
              <div>
                <span>Estimated cost</span>
                <strong>{formatUGX(selectedRequest.amount)}</strong>
              </div>
              <div>
                <span>Number of items</span>
                <strong>{selectedRequest.items}</strong>
              </div>
              <div>
                <span>Priority</span>
                <strong>{selectedRequest.priority}</strong>
              </div>
              <div>
                <span>Current status</span>
                <strong>{selectedRequest.status}</strong>
              </div>
            </div>

            <div className="pr-justification">
              <span>Business justification</span>
              <p>{selectedRequest.justification}</p>
            </div>

            <div className="pr-modal-actions">
              <button
                className="pr-secondary-btn"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </button>
              <button
                className="pr-reject-btn"
                disabled={selectedRequest.status === "Rejected"}
                onClick={() => updateStatus("Rejected")}
              >
                <XCircle size={16} />
                Reject
              </button>
              <button
                className="pr-approve-btn"
                disabled={selectedRequest.status === "Approved"}
                onClick={() => updateStatus("Approved")}
              >
                <CheckCircle2 size={16} />
                Approve
              </button>
            </div>
            <p className="pr-modal-disclaimer">
              Demo only: approval actions change local page state and do not
              represent a recorded or authorized institutional decision.
            </p>
          </section>
        </div>
      )}

      {showForm && (
        <div className="pr-modal-backdrop">
          <section
            className="pr-modal pr-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pr-form-title"
          >
            <div className="pr-modal-header">
              <div>
                <span className="pr-eyebrow">NEW REQUEST</span>
                <h2 id="pr-form-title">Create Requisition</h2>
              </div>
              <button
                className="pr-close-btn"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitRequest}>
              <div className="pr-form-grid">
                <label>
                  Request title *
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Classroom furniture"
                  />
                </label>

                <label>
                  Department *
                  <select
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                  >
                    <option>ICT</option>
                    <option>Academics</option>
                    <option>Operations</option>
                    <option>Administration</option>
                    <option>Sciences</option>
                  </select>
                </label>

                <label>
                  Requested by *
                  <input
                    required
                    value={form.requester}
                    onChange={(e) =>
                      setForm({ ...form, requester: e.target.value })
                    }
                    placeholder="Requester or role"
                  />
                </label>

                <label>
                  Required by *
                  <input
                    required
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={form.neededBy}
                    onChange={(e) =>
                      setForm({ ...form, neededBy: e.target.value })
                    }
                  />
                </label>

                <label>
                  Estimated cost (UGX) *
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="Enter estimated amount"
                  />
                </label>

                <label>
                  Number of items *
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={form.items}
                    onChange={(e) => setForm({ ...form, items: e.target.value })}
                  />
                </label>

                <label>
                  Priority *
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        priority: e.target.value as "High" | "Medium" | "Low",
                      })
                    }
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </label>

                <label className="pr-full-width">
                  Business justification *
                  <textarea
                    required
                    rows={3}
                    value={form.justification}
                    onChange={(e) =>
                      setForm({ ...form, justification: e.target.value })
                    }
                    placeholder="Explain why these items are required..."
                  />
                </label>
              </div>

              <div className="pr-modal-actions">
                <button
                  type="button"
                  className="pr-secondary-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="pr-primary-btn">
                  <FilePlus2 size={17} />
                  Submit Requisition
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
