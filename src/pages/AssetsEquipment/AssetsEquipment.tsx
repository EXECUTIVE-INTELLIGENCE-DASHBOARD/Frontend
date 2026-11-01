import { useState } from "react";

import { assets, campusOptions, conditionLabels, summaries } from "./assetsEquipment.data";
import type { CampusFilterValue } from "./assetsEquipment.types";
import "./AssetsEquipment.css";

const fmt = (n: number) => n.toLocaleString("en-US");

const icons = {
  // a package (the register) and a ticked circle (in working order)
  monitor: <><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></>,
  shield: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5 5-5.5" /></>,
  alert: <><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18v.01" /></>,
};

function MetricCard({ icon, label, value, tone }: { icon: keyof typeof icons; label: string; value: string; tone?: "blue" | "amber" }) {
  return (
    <div className={`ae-card ${tone ?? ""}`}>
      <div className="ae-ch">
        <span className="ae-ic"><svg viewBox="0 0 24 24" aria-hidden="true">{icons[icon]}</svg></span>
        <span className="ae-lb">{label}</span>
      </div>
      <div className="ae-val">{value}</div>
    </div>
  );
}

const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
function downloadCsv(name: string, headers: string[], rows: (string | number)[][]) {
  const csv = [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AssetsEquipment() {
  const [campus, setCampus] = useState<CampusFilterValue>("all");
  const rows = assets.filter((a) => campus === "all" || a.campus === campus);
  const s = summaries[campus];

  const exportRows = () =>
    downloadCsv(
      "asset-register",
      ["Asset Name & Class", "Nature / Category", "Location & Campus", "Total Value (UGX)", "Quantity", "Condition Status"],
      rows.map((a) => [a.name, a.category, a.location, a.value, `${a.quantity} ${a.unit}`, conditionLabels[a.condition]]),
    );

  return (
    <div className="ae">
      <div className="ae-fl">
        <select aria-label="Date range" defaultValue="">
          <option value="">01 Feb 2026 → 17 Oct 2026</option>
          <option>This term</option>
        </select>
        <select aria-label="Campus" value={campus} onChange={(e) => setCampus(e.target.value as CampusFilterValue)}>
          {campusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="ae-cards">
        <MetricCard icon="monitor" label="Total Assets" value={fmt(s.totalAssets)} />
        <MetricCard icon="shield" label="Operational Rate" value={`${s.operationalRate.toFixed(1)}%`} tone="blue" />
        <MetricCard icon="alert" label="Capital Risk" value={`${(100 - s.operationalRate).toFixed(1)}%`} tone="amber" />
      </div>

      <section className="ae-panel">
        <div className="ae-ph">
          <h2>Institutional Asset Register &amp; Condition Summary</h2>
          <button className="ae-btn" onClick={exportRows}>Export Report</button>
        </div>
        {rows.length === 0 ? (
          <p className="ae-empty">No assets recorded for this campus.</p>
        ) : (
          <div className="ae-scroll">
            <table>
              <thead>
                <tr>
                  <th>Asset Name &amp; Class</th>
                  <th>Nature / Category</th>
                  <th>Location &amp; Campus</th>
                  <th className="r">Total Value (UGX)</th>
                  <th className="r">Quantity</th>
                  <th>Condition Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id}>
                    <td className="nm">{a.name}</td>
                    <td className="mut">{a.category}</td>
                    <td>{a.location}</td>
                    <td className="r nm">UGX {fmt(a.value)}</td>
                    <td className="r mut">{a.quantity} {a.unit}</td>
                    <td><span className={`ae-st ${a.condition}`}>{conditionLabels[a.condition]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AssetsEquipment;
