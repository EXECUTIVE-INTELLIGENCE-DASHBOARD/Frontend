import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  Download,
  Eye,
  FilePlus2,
  Filter,
  Search,
  X,
} from "lucide-react";

import type {
  FiscalYear,
  ProcurementCategory,
  SettlementStatus,
  Vendor,
} from "../../lib/api/types";
import {
  createProcurementTransaction,
  getProcurementRequestsData,
  updateProcurementTransactionStatus,
  type ProcurementRequestsData,
  type ProcurementSchool,
  type ProcurementTransactionPayload,
  type ProcurementTransactionRow,
} from "./procurementRequests.api";
import "./ProcurementRequests.css";

const categories: ProcurementCategory[] = ["goods", "services", "works"];
const statuses: SettlementStatus[] = ["outstanding", "committed", "paid"];

const categoryLabels: Record<ProcurementCategory, string> = {
  goods: "Goods",
  services: "Services",
  works: "Works",
};

const statusLabels: Record<SettlementStatus, string> = {
  outstanding: "Outstanding",
  committed: "Committed",
  paid: "Paid",
};

const formatUGX = (amount: number, currency = "UGX") =>
  new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

const formatAmount = (value: string) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

function localDateValue(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const statusClass = (status: SettlementStatus) => status;

function fiscalYearLabel(fiscalYear: FiscalYear | undefined): string {
  return fiscalYear
    ? `${fiscalYear.year} · Q${fiscalYear.quarter}`
    : "Fiscal year unavailable";
}

interface TransactionForm {
  vendor: string;
  fiscalYear: string;
  category: ProcurementCategory;
  status: SettlementStatus;
  amount: string;
  currency: string;
  transactionDate: string;
  referenceNumber: string;
  description: string;
  school: string;
}

const initialForm = (): TransactionForm => ({
  vendor: "",
  fiscalYear: "",
  category: "goods",
  status: "outstanding",
  amount: "",
  currency: "UGX",
  transactionDate: localDateValue(),
  referenceNumber: "",
  description: "",
  school: "",
});

function exportTransactions(
  transactions: ProcurementTransactionRow[],
  vendorById: Map<number, Vendor>,
  fiscalYearById: Map<number, FiscalYear>,
) {
  const headers = [
    "ID",
    "Reference",
    "Description",
    "Vendor",
    "Category",
    "Status",
    "Transaction Date",
    "Fiscal Year",
    "Amount",
    "Currency",
  ];
  const rows = transactions.map((transaction) => [
    transaction.id,
    transaction.reference_number,
    transaction.description,
    vendorById.get(transaction.vendor)?.name ?? `Vendor #${transaction.vendor}`,
    categoryLabels[transaction.category],
    statusLabels[transaction.status],
    transaction.transaction_date,
    fiscalYearLabel(fiscalYearById.get(transaction.fiscal_year)),
    transaction.amount,
    transaction.currency,
  ]);
  const escapeCSV = (value: string | number) =>
    `"${String(value).replaceAll('"', '""')}"`;
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(","))
    .join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "procurement-transactions.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function TransactionDetails({
  transaction,
  vendor,
  fiscalYear,
  school,
  onClose,
  onStatusChange,
  updating,
}: {
  transaction: ProcurementTransactionRow;
  vendor: Vendor | undefined;
  fiscalYear: FiscalYear | undefined;
  school: ProcurementSchool | undefined;
  onClose: () => void;
  onStatusChange: (status: SettlementStatus) => void;
  updating: boolean;
}) {
  return (
    <div
      className="pr-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
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
            <span className="pr-request-id">
              {transaction.reference_number || `Transaction #${transaction.id}`}
            </span>
            <h2 id="pr-detail-title">
              {transaction.description || "Procurement transaction"}
            </h2>
          </div>
          <button
            className="pr-close-btn"
            onClick={onClose}
            aria-label="Close details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="pr-detail-grid">
          <div>
            <span>Vendor</span>
            <strong>{vendor?.name ?? `Vendor #${transaction.vendor}`}</strong>
          </div>
          <div>
            <span>Category</span>
            <strong>{categoryLabels[transaction.category]}</strong>
          </div>
          <div>
            <span>Transaction date</span>
            <strong>{transaction.transaction_date}</strong>
          </div>
          <div>
            <span>Fiscal year</span>
            <strong>{fiscalYearLabel(fiscalYear)}</strong>
          </div>
          <div>
            <span>Amount</span>
            <strong>
              {formatUGX(formatAmount(transaction.amount), transaction.currency)}
            </strong>
          </div>
          <div>
            <span>School</span>
            <strong>{school?.name ?? "Not assigned"}</strong>
          </div>
          <div>
            <span>Reference</span>
            <strong>{transaction.reference_number || "—"}</strong>
          </div>
          <div>
            <span>Current status</span>
            <strong>{statusLabels[transaction.status]}</strong>
          </div>
        </div>

        <div className="pr-justification">
          <span>Description</span>
          <p>{transaction.description || "No description provided."}</p>
        </div>

        <div className="pr-modal-actions">
          <label className="pr-status-update">
            Update status
            <select
              value={transaction.status}
              disabled={updating}
              onChange={(event) =>
                onStatusChange(event.target.value as SettlementStatus)
              }
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </label>
          <button className="pr-secondary-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

function TransactionFormDialog({
  vendors,
  fiscalYears,
  schools,
  onClose,
  onSubmit,
  saving,
}: {
  vendors: Vendor[];
  fiscalYears: FiscalYear[];
  schools: ProcurementSchool[];
  onClose: () => void;
  onSubmit: (payload: ProcurementTransactionPayload) => Promise<void>;
  saving: boolean;
}) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await onSubmit({
        vendor: Number(form.vendor),
        fiscal_year: Number(form.fiscalYear),
        category: form.category,
        status: form.status,
        amount: form.amount,
        currency: form.currency.toUpperCase(),
        transaction_date: form.transactionDate,
        reference_number: form.referenceNumber.trim(),
        description: form.description.trim(),
        ...(form.school ? { school: Number(form.school) } : {}),
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not save this transaction.",
      );
    }
  }

  return (
    <div className="pr-modal-backdrop">
      <section
        className="pr-modal pr-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pr-form-title"
      >
        <div className="pr-modal-header">
          <div>
            <span className="pr-eyebrow">NEW TRANSACTION</span>
            <h2 id="pr-form-title">Record Procurement Transaction</h2>
          </div>
          <button
            className="pr-close-btn"
            onClick={onClose}
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="pr-form-grid">
            <label>
              Vendor *
              <select
                required
                value={form.vendor}
                onChange={(event) =>
                  setForm({ ...form, vendor: event.target.value })
                }
              >
                <option value="">Select a vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Fiscal year *
              <select
                required
                value={form.fiscalYear}
                onChange={(event) =>
                  setForm({ ...form, fiscalYear: event.target.value })
                }
              >
                <option value="">Select fiscal year</option>
                {fiscalYears.map((fiscalYear) => (
                  <option key={fiscalYear.id} value={fiscalYear.id}>
                    {fiscalYearLabel(fiscalYear)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Category *
              <select
                required
                value={form.category}
                onChange={(event) =>
                  setForm({
                    ...form,
                    category: event.target.value as ProcurementCategory,
                  })
                }
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabels[category]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Status *
              <select
                required
                value={form.status}
                onChange={(event) =>
                  setForm({
                    ...form,
                    status: event.target.value as SettlementStatus,
                  })
                }
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Amount *
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm({ ...form, amount: event.target.value })
                }
                placeholder="Enter amount"
              />
            </label>

            <label>
              Currency *
              <input
                required
                minLength={3}
                maxLength={3}
                value={form.currency}
                onChange={(event) =>
                  setForm({ ...form, currency: event.target.value })
                }
              />
            </label>

            <label>
              Transaction date *
              <input
                required
                type="date"
                value={form.transactionDate}
                onChange={(event) =>
                  setForm({ ...form, transactionDate: event.target.value })
                }
              />
            </label>

            <label>
              School
              <select
                value={form.school}
                onChange={(event) =>
                  setForm({ ...form, school: event.target.value })
                }
              >
                <option value="">Not assigned</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="pr-full-width">
              Reference number
              <input
                maxLength={100}
                value={form.referenceNumber}
                onChange={(event) =>
                  setForm({ ...form, referenceNumber: event.target.value })
                }
                placeholder="Optional reference"
              />
            </label>

            <label className="pr-full-width">
              Description
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                placeholder="Optional transaction description"
              />
            </label>
          </div>

          {error && <p className="pr-error" role="alert">{error}</p>}

          <div className="pr-modal-actions">
            <button
              type="button"
              className="pr-secondary-btn"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pr-primary-btn"
              disabled={saving || vendors.length === 0 || fiscalYears.length === 0}
            >
              <FilePlus2 size={17} />
              {saving ? "Saving…" : "Save Transaction"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function ProcurementRequests() {
  const [data, setData] = useState<ProcurementRequestsData>({
    transactions: [],
    vendors: [],
    fiscalYears: [],
    schools: [],
    errors: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedTransaction, setSelectedTransaction] =
    useState<ProcurementTransactionRow | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(false);

    void getProcurementRequestsData(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result);
          setLoadError(result.errors.includes("Could not load transactions."));
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error("Procurement transactions request failed:", error);
          setLoadError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [retryCount]);

  const vendorById = useMemo(
    () => new Map(data.vendors.map((vendor) => [vendor.id, vendor])),
    [data.vendors],
  );
  const fiscalYearById = useMemo(
    () => new Map(data.fiscalYears.map((fiscalYear) => [fiscalYear.id, fiscalYear])),
    [data.fiscalYears],
  );
  const schoolById = useMemo(
    () => new Map(data.schools.map((school) => [school.id, school])),
    [data.schools],
  );

  const filteredTransactions = useMemo(() => {
    const term = search.toLowerCase().trim();

    return data.transactions.filter((transaction) => {
      const vendorName =
        vendorById.get(transaction.vendor)?.name ?? `Vendor #${transaction.vendor}`;
      const matchesSearch = [
        String(transaction.id),
        transaction.reference_number,
        transaction.description,
        vendorName,
      ].some((value) => value.toLowerCase().includes(term));
      const matchesStatus =
        statusFilter === "All" || transaction.status === statusFilter;
      const matchesCategory =
        categoryFilter === "All" || transaction.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [data.transactions, search, statusFilter, categoryFilter, vendorById]);

  const outstandingCount = data.transactions.filter(
    (transaction) => transaction.status === "outstanding",
  ).length;
  const committedCount = data.transactions.filter(
    (transaction) => transaction.status === "committed",
  ).length;
  const paidCount = data.transactions.filter(
    (transaction) => transaction.status === "paid",
  ).length;
  const totalValue = data.transactions.reduce(
    (sum, transaction) => sum + formatAmount(transaction.amount),
    0,
  );

  async function refreshTransactions() {
    const controller = new AbortController();
    const result = await getProcurementRequestsData(controller.signal);
    setData(result);
    setLoadError(result.errors.includes("Could not load transactions."));
    if (result.errors.includes("Could not load transactions.")) {
      throw new Error("Transaction was saved, but the list could not be refreshed.");
    }
  }

  async function submitTransaction(payload: ProcurementTransactionPayload) {
    setSaving(true);
    try {
      await createProcurementTransaction(payload);
      await refreshTransactions();
      setShowForm(false);
      setNotice("Procurement transaction saved.");
    } catch (error) {
      console.error("Failed to save procurement transaction:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(status: SettlementStatus) {
    if (!selectedTransaction || status === selectedTransaction.status) return;

    setUpdatingStatus(true);
    try {
      const updated = await updateProcurementTransactionStatus(
        selectedTransaction.id,
        status,
      );
      setData((current) => ({
        ...current,
        transactions: current.transactions.map((transaction) =>
          transaction.id === updated.id ? updated : transaction,
        ),
      }));
      setSelectedTransaction(updated);
      setNotice(`Transaction status changed to ${statusLabels[status]}.`);
    } catch (error) {
      console.error("Failed to update procurement transaction status:", error);
      setNotice(
        error instanceof Error
          ? error.message
          : "Could not update transaction status.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <div className="proc-requests-page">
      <header className="pr-page-header">
        <div>
          <span className="pr-eyebrow">PROCUREMENT</span>
          <h1>Procurement Transactions</h1>
          <p>Transactions and vendors loaded from the procurement backend.</p>
        </div>
        <button
          className="pr-primary-btn"
          onClick={() => setShowForm(true)}
          disabled={data.vendors.length === 0 || data.fiscalYears.length === 0}
        >
          <FilePlus2 size={17} />
          Record Transaction
        </button>
      </header>

      {notice && (
        <div className="pr-notice" role="status">
          {notice}
        </div>
      )}

      {loading && (
        <p className="pr-state" role="status">Loading procurement data…</p>
      )}

      {loadError && (
        <div className="pr-error-banner" role="alert">
          <span>Could not load procurement transactions.</span>
          <button
            className="pr-secondary-btn"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Retry
          </button>
        </div>
      )}

      {data.errors
        .filter((error) => error !== "Could not load transactions.")
        .map((error) => (
          <p className="pr-state" role="status" key={error}>{error}</p>
        ))}

      <section className="pr-kpi-grid" aria-label="Procurement summary">
        <article className="pr-kpi-card">
          <div className="pr-kpi-icon blue"><ClipboardList size={21} /></div>
          <div className="pr-kpi-label">Total Transactions</div>
          <div className="pr-kpi-value">{data.transactions.length}</div>
          <div className="pr-kpi-foot">All backend transactions</div>
        </article>
        <article className="pr-kpi-card">
          <div className="pr-kpi-icon amber"><Clock3 size={21} /></div>
          <div className="pr-kpi-label">Outstanding</div>
          <div className="pr-kpi-value">{outstandingCount}</div>
          <div className="pr-kpi-foot">Unpaid transactions</div>
        </article>
        <article className="pr-kpi-card">
          <div className="pr-kpi-icon purple"><Eye size={21} /></div>
          <div className="pr-kpi-label">Committed</div>
          <div className="pr-kpi-value">{committedCount}</div>
          <div className="pr-kpi-foot">Committed budget</div>
        </article>
        <article className="pr-kpi-card">
          <div className="pr-kpi-icon green"><CheckCircle2 size={21} /></div>
          <div className="pr-kpi-label">Paid</div>
          <div className="pr-kpi-value">{paidCount}</div>
          <div className="pr-kpi-foot">Disbursed transactions</div>
        </article>
        <article className="pr-kpi-card pr-value-card">
          <div className="pr-kpi-label">Total Transaction Value</div>
          <div className="pr-kpi-value pr-money">{formatUGX(totalValue)}</div>
          <div className="pr-kpi-foot">All recorded transactions</div>
        </article>
      </section>

      <section className="pr-table-card">
        <div className="pr-table-heading">
          <div>
            <h2>Transaction Register</h2>
            <p>
              {filteredTransactions.length} of {data.transactions.length} transactions shown
            </p>
          </div>
          <button
            className="pr-secondary-btn"
            onClick={() =>
              exportTransactions(
                filteredTransactions,
                vendorById,
                fiscalYearById,
              )
            }
            disabled={filteredTransactions.length === 0}
          >
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
              placeholder="Search reference, description, vendor..."
              aria-label="Search transactions"
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
              {statuses.map((status) => (
                <option key={status} value={status}>{statusLabels[status]}</option>
              ))}
            </select>
          </label>

          <select
            className="pr-department-select"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="All">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {categoryLabels[category]}
              </option>
            ))}
          </select>
        </div>

        <div className="pr-table-wrap">
          <table className="pr-table">
            <thead>
              <tr>
                <th>Reference / Description</th>
                <th>Vendor</th>
                <th>Category</th>
                <th>Transaction Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    <div className="pr-request-title">
                      {transaction.description || "Procurement transaction"}
                    </div>
                    <div className="pr-request-id">
                      {transaction.reference_number || `Transaction #${transaction.id}`}
                    </div>
                  </td>
                  <td>
                    <div className="pr-dept-name">
                      {vendorById.get(transaction.vendor)?.name ??
                        `Vendor #${transaction.vendor}`}
                    </div>
                  </td>
                  <td>{categoryLabels[transaction.category]}</td>
                  <td>{transaction.transaction_date}</td>
                  <td className="pr-cost">
                    {formatUGX(
                      formatAmount(transaction.amount),
                      transaction.currency,
                    )}
                  </td>
                  <td>
                    <span className={`pr-status ${statusClass(transaction.status)}`}>
                      {statusLabels[transaction.status]}
                    </span>
                  </td>
                  <td>
                    <button
                      className="pr-view-btn"
                      aria-label={`View transaction ${transaction.id}`}
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="pr-empty">
                    {data.transactions.length === 0
                      ? "No procurement transactions are available."
                      : "No transactions match your search or filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedTransaction && (
        <TransactionDetails
          transaction={selectedTransaction}
          vendor={vendorById.get(selectedTransaction.vendor)}
          fiscalYear={fiscalYearById.get(selectedTransaction.fiscal_year)}
          school={
            selectedTransaction.school
              ? schoolById.get(selectedTransaction.school)
              : undefined
          }
          onClose={() => setSelectedTransaction(null)}
          onStatusChange={changeStatus}
          updating={updatingStatus}
        />
      )}

      {showForm && (
        <TransactionFormDialog
          vendors={data.vendors}
          fiscalYears={data.fiscalYears}
          schools={data.schools}
          onClose={() => setShowForm(false)}
          onSubmit={submitTransaction}
          saving={saving}
        />
      )}
    </div>
  );
}
