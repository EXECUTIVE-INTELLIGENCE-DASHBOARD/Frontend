
import { useMemo, useState } from "react";
import {
  Search,
  Download,
  Package,
  AlertTriangle,
  Archive,
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
import "./InventoryStock.css";

type StockStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Overstocked";

type StockItem = {
  id: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  minimumLevel: number;
  unitCost: number;
  supplier: string;
  lastUpdated: string;
};

const stockItems: StockItem[] = [
  {
    id: "INV-001",
    name: "Exercise Books",
    category: "Learning Materials",
    location: "Main Store",
    quantity: 1250,
    minimumLevel: 300,
    unitCost: 1800,
    supplier: "Kampala Educational Books",
    lastUpdated: "2026-10-19",
  },
  {
    id: "INV-002",
    name: "A4 Printing Paper",
    category: "Stationery",
    location: "Administration Store",
    quantity: 85,
    minimumLevel: 150,
    unitCost: 28000,
    supplier: "Office Supplies Uganda",
    lastUpdated: "2026-10-18",
  },
  {
    id: "INV-003",
    name: "Whiteboard Markers",
    category: "Stationery",
    location: "Main Store",
    quantity: 0,
    minimumLevel: 60,
    unitCost: 2500,
    supplier: "Office Supplies Uganda",
    lastUpdated: "2026-10-17",
  },
  {
    id: "INV-004",
    name: "Rice",
    category: "Food Supplies",
    location: "Kitchen Store",
    quantity: 420,
    minimumLevel: 100,
    unitCost: 4200,
    supplier: "Fresh Foods Distributors",
    lastUpdated: "2026-10-19",
  },
  {
    id: "INV-005",
    name: "Laptop Computers",
    category: "ICT Equipment",
    location: "ICT Store",
    quantity: 18,
    minimumLevel: 5,
    unitCost: 1850000,
    supplier: "Techline Solutions",
    lastUpdated: "2026-10-16",
  },
  {
    id: "INV-006",
    name: "Liquid Hand Soap",
    category: "Cleaning & Hygiene",
    location: "Main Store",
    quantity: 24,
    minimumLevel: 80,
    unitCost: 12000,
    supplier: "CleanCare Services",
    lastUpdated: "2026-10-18",
  },
  {
    id: "INV-007",
    name: "Printer Toner",
    category: "ICT Supplies",
    location: "Administration Store",
    quantity: 95,
    minimumLevel: 20,
    unitCost: 65000,
    supplier: "Techline Solutions",
    lastUpdated: "2026-10-15",
  },
  {
    id: "INV-008",
    name: "Floor Cleaning Liquid",
    category: "Cleaning & Hygiene",
    location: "Main Store",
    quantity: 480,
    minimumLevel: 70,
    unitCost: 8500,
    supplier: "CleanCare Services",
    lastUpdated: "2026-10-14",
  },
  {
    id: "INV-009",
    name: "Laboratory Gloves",
    category: "Laboratory Supplies",
    location: "Science Store",
    quantity: 42,
    minimumLevel: 100,
    unitCost: 15000,
    supplier: "Office Supplies Uganda",
    lastUpdated: "2026-10-19",
  },
  {
    id: "INV-010",
    name: "Ballpoint Pens",
    category: "Stationery",
    location: "Main Store",
    quantity: 2100,
    minimumLevel: 250,
    unitCost: 700,
    supplier: "Office Supplies Uganda",
    lastUpdated: "2026-10-13",
  },
];

const stockMovement = [
  { month: "May", received: 420, issued: 360 },
  { month: "Jun", received: 510, issued: 390 },
  { month: "Jul", received: 460, issued: 425 },
  { month: "Aug", received: 580, issued: 440 },
  { month: "Sep", received: 490, issued: 460 },
  { month: "Oct", received: 620, issued: 475 },
];

const currency = (amount: number) =>
  new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
  }).format(amount);

function getStockStatus(item: StockItem): StockStatus {
  if (item.quantity === 0) return "Out of Stock";
  if (item.quantity < item.minimumLevel) return "Low Stock";
  if (item.quantity > item.minimumLevel * 5) return "Overstocked";
  return "In Stock";
}

function StockStatusBadge({ status }: { status: StockStatus }) {
  return (
    <span
      className={`is-status is-status--${status
        .toLowerCase()
        .replaceAll(" ", "-")}`}
    >
      <span className="is-status__dot" />
      {status}
    </span>
  );
}

export default function InventoryStock() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  const categories = useMemo(
    () => [
      "All Categories",
      ...Array.from(new Set(stockItems.map((item) => item.category))),
    ],
    []
  );

  const enrichedItems = useMemo(
    () =>
      stockItems.map((item) => ({
        ...item,
        status: getStockStatus(item),
        stockValue: item.quantity * item.unitCost,
      })),
    []
  );

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return enrichedItems.filter((item) => {
      const matchesSearch =
        !query ||
        [item.id, item.name, item.supplier, item.location, item.category].some(
          (value) => value.toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "All Statuses" || item.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All Categories" ||
        item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [enrichedItems, search, statusFilter, categoryFilter]);

  const totalUnits = stockItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = stockItems.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0
  );
  const lowStockCount = stockItems.filter(
    (item) => getStockStatus(item) === "Low Stock"
  ).length;
  const outOfStockCount = stockItems.filter(
    (item) => getStockStatus(item) === "Out of Stock"
  ).length;

  const exportCsv = () => {
    const headers = [
      "Item ID",
      "Item",
      "Category",
      "Location",
      "Quantity",
      "Minimum Level",
      "Unit Cost UGX",
      "Stock Value UGX",
      "Supplier",
      "Status",
      "Last Updated",
    ];

    const rows = filteredItems.map((item) => [
      item.id,
      item.name,
      item.category,
      item.location,
      item.quantity,
      item.minimumLevel,
      item.unitCost,
      item.stockValue,
      item.supplier,
      item.status,
      item.lastUpdated,
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
    link.download = "inventory-stock.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="is-page">
      <header className="is-header">


        <button
          className="is-button is-button--secondary"
          onClick={exportCsv}
        >
          <Download size={17} />
          Export CSV
        </button>
      </header>



      <section className="is-metrics">
        <article className="is-metric">
          <div className="is-metric__top">
            <span className="is-metric__icon is-icon--blue">
              <Package size={20} />
            </span>
            <span className="is-trend is-trend--positive">
              <ArrowUpRight size={15} /> Tracked
            </span>
          </div>
          <p>Total Stock Units</p>
          <h2>{totalUnits.toLocaleString("en-UG")}</h2>
          <span className="is-metric__foot">
            Across {stockItems.length} sample items
          </span>
        </article>

        <article className="is-metric">
          <div className="is-metric__top">
            <span className="is-metric__icon is-icon--green">
              <Archive size={20} />
            </span>
          </div>
          <p>Estimated Stock Value</p>
          <h2 className="is-metric__value">{currency(totalValue)}</h2>
          <span className="is-metric__foot">
            Illustrative value at recorded unit costs
          </span>
        </article>

        <article className="is-metric">
          <div className="is-metric__top">
            <span className="is-metric__icon is-icon--amber">
              <AlertTriangle size={20} />
            </span>
            <span className="is-trend is-trend--warning">Reorder</span>
          </div>
          <p>Low Stock Items</p>
          <h2>{lowStockCount}</h2>
          <span className="is-metric__foot">
            Below their minimum stock level
          </span>
        </article>

        <article className="is-metric">
          <div className="is-metric__top">
            <span className="is-metric__icon is-icon--red">
              <ArrowDownRight size={20} />
            </span>
          </div>
          <p>Out of Stock</p>
          <h2>{outOfStockCount}</h2>
          <span className="is-metric__foot">
            Items with zero available quantity
          </span>
        </article>
      </section>

      <section className="is-panel">
        <div className="is-section-heading">
          <div>
            <h2>Stock Movement</h2>
            <p>Illustrative monthly quantities received versus issued</p>
          </div>
          <span className="is-period">Last 6 months</span>
        </div>

        <div className="is-chart-legend">
          <span>
            <i className="is-legend-dot is-legend-dot--received" />
            Stock received
          </span>
          <span>
            <i className="is-legend-dot is-legend-dot--issued" />
            Stock issued
          </span>
        </div>

        <div className="is-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stockMovement}
              margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
              barGap={7}
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
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#788397", fontSize: 12 }}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e4e9f0",
                }}
              />

              <Bar
                dataKey="received"
                name="Stock Received"
                fill="#2AA4DD"
                radius={[5, 5, 0, 0]}
              />
              <Bar
                dataKey="issued"
                name="Stock Issued"
                fill="#203468"
                radius={[5, 5, 0, 0]}
              />

            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="is-panel">
        <div className="is-section-heading is-table-heading">
          <div>
            <h2>Inventory Register</h2>
            <p>
              Search stock records and identify items that need replenishment.
            </p>
          </div>
          <span className="is-result-count">
            {filteredItems.length} of {stockItems.length} sample items
          </span>
        </div>

        <div className="is-filters">
          <label className="is-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search item, supplier, location..."
              aria-label="Search inventory"
            />
          </label>

          <label className="is-select-wrap">
            <span className="is-sr-only">Filter by stock status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All Statuses</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
              <option>Overstocked</option>
            </select>
            <ChevronDown size={16} />
          </label>

          <label className="is-select-wrap">
            <span className="is-sr-only">Filter by category</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <ChevronDown size={16} />
          </label>
        </div>

        <div className="is-table-scroll">
          <table className="is-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Location</th>
                <th>Quantity</th>
                <th>Minimum Level</th>
                <th>Unit Cost</th>
                <th>Stock Value</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="is-item-name">{item.name}</div>
                    <div className="is-item-meta">
                      {item.id} · {item.category}
                    </div>
                  </td>
                  <td>{item.location}</td>
                  <td>
                    <strong className="is-quantity">{item.quantity.toLocaleString("en-UG")}</strong>
                  </td>
                  <td>{item.minimumLevel.toLocaleString("en-UG")}</td>
                  <td>{currency(item.unitCost)}</td>
                  <td className="is-stock-value">
                    {currency(item.quantity * item.unitCost)}
                  </td>
                  <td>
                    <StockStatusBadge status={getStockStatus(item)} />
                  </td>
                  <td>{item.lastUpdated}</td>
                  <td>
                    <button
                      className="is-view-button"
                      title={`View ${item.name}`}
                      aria-label={`View ${item.name}`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <Eye size={17} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={9} className="is-empty">
                    No stock items match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedItem && (
        <div
          className="is-modal-backdrop"
          onClick={() => setSelectedItem(null)}
          role="presentation"
        >
          <section
            className="is-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="is-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="is-modal__header">
              <div>
                <span className="is-eyebrow">{selectedItem.id}</span>
                <h2 id="is-modal-title">{selectedItem.name}</h2>
              </div>
              <button
                className="is-modal-close"
                onClick={() => setSelectedItem(null)}
                aria-label="Close stock details"
              >
                ×
              </button>
            </div>

            <StockStatusBadge status={getStockStatus(selectedItem)} />

            <dl className="is-details">
              <div><dt>Category</dt><dd>{selectedItem.category}</dd></div>
              <div><dt>Store location</dt><dd>{selectedItem.location}</dd></div>
              <div><dt>Supplier</dt><dd>{selectedItem.supplier}</dd></div>
              <div><dt>Quantity available</dt><dd>{selectedItem.quantity.toLocaleString("en-UG")}</dd></div>
              <div><dt>Minimum stock level</dt><dd>{selectedItem.minimumLevel.toLocaleString("en-UG")}</dd></div>
              <div><dt>Unit cost</dt><dd>{currency(selectedItem.unitCost)}</dd></div>
              <div><dt>Last updated</dt><dd>{selectedItem.lastUpdated}</dd></div>
              <div className="is-details__value">
                <dt>Estimated stock value</dt>
                <dd>{currency(selectedItem.quantity * selectedItem.unitCost)}</dd>
              </div>
            </dl>

            {getStockStatus(selectedItem) === "Low Stock" ||
            getStockStatus(selectedItem) === "Out of Stock" ? (
              <p className="is-modal-note">
                This item is below its minimum stock level. Review actual
                demand and available purchase orders before raising a
                replenishment request.
              </p>
            ) : (
              <p className="is-modal-note">
                This is an illustrative inventory record. Stock adjustments
                and replenishment actions require a connected inventory system.
              </p>
            )}

            <button
              className="is-button is-button--primary is-modal-done"
              onClick={() => setSelectedItem(null)}
            >
              Close Details
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
