import { budgets, timeElapsedPct } from "../../lib/services.data";
import type { BudgetRow, Tone } from "../../lib/services.types";
import { toM } from "../../lib/services.utils";
import { Kpi, KpiRow, Pill, DataTable, OutletName, type Column, FilterBar } from "./ServicesComponents";
import "./services.css";

const usedPct = (b: BudgetRow) => Math.round((b.spent / b.allocated) * 100);
const status = (b: BudgetRow): [Tone, string] => {
  const gap = usedPct(b) - timeElapsedPct;
  return gap > 8 ? ["bad", "Overspending"] : gap > 0 ? ["wn", "Slightly ahead"] : ["ok", "On track"];
};

const columns: Column<BudgetRow>[] = [
  { header: "Outlet", cell: (b) => <OutletName icon={b.icon} name={b.name} /> },
  { header: "Allocated", unit: "UGX millions", numeric: true, cell: (b) => toM(b.allocated) },
  { header: "Spent", unit: "UGX millions", numeric: true, cell: (b) => toM(b.spent) },
  { header: "Used", unit: "%", numeric: true, cell: (b) => usedPct(b) },
  { header: "Status", cell: (b) => { const [t, l] = status(b); return <Pill tone={t}>{l}</Pill>; } },
];

export default function BudgetPage() {
  const total = budgets.reduce((a, b) => a + b.allocated, 0);
  const spent = budgets.reduce((a, b) => a + b.spent, 0);
  const pct = Math.round((spent / total) * 100);

  return (
    <div className="svc">
      <FilterBar value="all" onChange={() => {}} showOutlet={false} />
      <KpiRow>
        <Kpi icon="wallet" title="Operating Budget" value={toM(total)} unit="M UGX" note="Financial year 2026" />
        <Kpi icon="gauge" title="Budget Used" value={pct} unit="%" note={`${toM(spent)}M UGX spent`} tone={pct > timeElapsedPct ? "bad" : "ok"} />
        <Kpi icon="clock" title="Time Elapsed" value={timeElapsedPct} unit="%" note="290 of 365 days" />
      </KpiRow>
      <DataTable
        title="Budget Used vs Time Elapsed by Outlet"
        columns={columns}
        rows={budgets}
        rowKey={(b) => b.id}
        note={<div className="svc-leg">Time elapsed: {timeElapsedPct}% of the financial year</div>}
      />
    </div>
  );
}
