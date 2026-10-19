import { useState } from "react";
import { monthlySales, salesByOutlet } from "../../lib/services.data";
import type { OutletFilterValue, SalesRow } from "../../lib/services.types";
import { byOutlet, fmt, toM } from "../../lib/services.utils";
import { Kpi, KpiRow, Pill, DataTable, OutletName, type Column, FilterBar, SalesTrendChart } from "./ServicesComponents";
import "./services.css";

const columns: Column<SalesRow>[] = [
  { header: "Outlet", cell: (s) => <OutletName icon={s.icon} name={s.name} /> },
  { header: "Business", cell: (s) => <Pill tone="nu">{s.type}</Pill> },
  { header: "Revenue", unit: "UGX millions", numeric: true, cell: (s) => toM(s.revenue) },
  { header: "Gross margin", unit: "%", numeric: true, cell: (s) => s.grossMargin },
  { header: "Transactions", unit: "sales", numeric: true, cell: (s) => fmt(s.transactions) },
  { header: "Avg. sale", unit: "UGX", numeric: true, cell: (s) => fmt(Math.round(s.revenue / s.transactions)) },
  { header: "Change", unit: "%", numeric: true, cell: (s) => <Pill tone={s.change < 0 ? "bad" : "ok"}>{s.change > 0 ? "+" : ""}{s.change}</Pill> },
  { header: "Team", unit: "staff", numeric: true, cell: (s) => s.staff },
];

export default function SalesPage() {
  const [outlet, setOutlet] = useState<OutletFilterValue>("all");
  const rows = salesByOutlet.filter(byOutlet(outlet));
  const total = rows.reduce((a, s) => a + s.revenue, 0);
  const profit = rows.reduce((a, s) => a + (s.revenue * s.grossMargin) / 100, 0);
  const tx = rows.reduce((a, s) => a + s.transactions, 0);

  return (
    <div className="svc">
      <FilterBar value={outlet} onChange={setOutlet} />
      <KpiRow>
        <Kpi icon="coins" title="Total Sales" value={toM(total)} unit="M UGX" note="▲ 5.9% vs previous period" tone="ok" />
        <Kpi icon="trend" title="Gross Profit" value={toM(profit)} unit="M UGX" note={`${Math.round((profit / total) * 100)}% gross margin`} />
        <Kpi icon="receipt" title="Transactions" value={fmt(tx)} unit="Sales" note={`Avg. sale UGX ${fmt(Math.round(total / tx))}`} />
      </KpiRow>
      {outlet === "all" && <SalesTrendChart data={monthlySales} />}
      <DataTable title="Sales by Outlet" columns={columns} rows={rows} rowKey={(s) => s.id} />
    </div>
  );
}
