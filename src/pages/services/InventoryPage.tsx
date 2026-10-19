import { useState } from "react";
import { inventory } from "../../lib/services.data";
import type { InventoryRow, OutletFilterValue, Tone } from "../../lib/services.types";
import { byOutlet, fmt, toM } from "../../lib/services.utils";
import { Kpi, KpiRow, Pill, DataTable, type Column, FilterBar } from "./ServicesComponents";
import "./services.css";

const status = (r: InventoryRow): [Tone, string] =>
  r.onHand < r.minLevel * 0.4 ? ["bad", "Critical"] : r.onHand < r.minLevel ? ["wn", "Reorder soon"] : ["ok", "In stock"];

const columns: Column<InventoryRow>[] = [
  { header: "Item", cell: (r) => r.item },
  { header: "Outlet", cell: (r) => <>{r.outlet.name} <small>{r.outlet.type}</small></> },
  { header: "On hand", unit: "units", numeric: true, cell: (r) => fmt(r.onHand) },
  { header: "Min. level", unit: "units", numeric: true, cell: (r) => fmt(r.minLevel) },
  { header: "Unit cost", unit: "UGX", numeric: true, cell: (r) => fmt(r.unitCost) },
  { header: "Stock value", unit: "UGX", numeric: true, cell: (r) => fmt(r.onHand * r.unitCost) },
  { header: "Status", cell: (r) => { const [t, l] = status(r); return <Pill tone={t}>{l}</Pill>; } },
];

export default function InventoryPage() {
  const [outlet, setOutlet] = useState<OutletFilterValue>("all");
  const rows = inventory.filter(byOutlet(outlet));
  const value = rows.reduce((a, r) => a + r.onHand * r.unitCost, 0);
  const low = rows.filter((r) => r.onHand < r.minLevel).length;

  return (
    <div className="svc">
      <FilterBar value={outlet} onChange={setOutlet} />
      <KpiRow>
        <Kpi icon="box" title="Stock Value" value={toM(value)} unit="M UGX" note={`At cost, ${rows.length} items tracked`} />
        <Kpi icon="alert" title="Below Minimum" value={low} unit="Items" note={low ? "Reorder recommended" : "All healthy"} tone={low ? "bad" : "ok"} />
        <Kpi icon="store" title="Outlets" value={new Set(rows.map((r) => r.outlet.id)).size} unit="Outlets" note="Reporting stock levels" />
      </KpiRow>
      <DataTable title="Inventory by Outlet & Item" columns={columns} rows={rows} rowKey={(r) => r.outlet.id + r.item} />
    </div>
  );
}
