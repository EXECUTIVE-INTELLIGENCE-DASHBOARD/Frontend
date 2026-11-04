import { useMemo } from "react";
import {
  buildProcurementFinancialsData,
} from "./procurementFinancials.data";
import {
  useProcurementTransactions,
  useVendors,
} from "../../lib/api/queries";
import { SpendSummaryCard } from "./SpendSummaryCard";
import { TopVendorsCard } from "./TopVendorsCard";
import { SpendAllocationCard } from "./SpendAllocationCard";
import { SettlementAnalysisCard } from "./SettlementAnalysisCard";

import "../../palette.css";
import "./ProcurementFinancials.css";

export function ProcurementFinancials() {
  const transactionsQuery = useProcurementTransactions();
  const vendorsQuery = useVendors();
  const procurementData = useMemo(
    () =>
      buildProcurementFinancialsData(
        transactionsQuery.data ?? [],
        vendorsQuery.data ?? [],
      ),
    [transactionsQuery.data, vendorsQuery.data],
  );
  const isPending = transactionsQuery.isPending || vendorsQuery.isPending;
  const error = transactionsQuery.error ?? vendorsQuery.error;

  if (error) {
    return (
      <p className="pf-message pf-message--error" role="alert">
        Unable to load procurement financials:{" "}
        {error instanceof Error ? error.message : "Please try again."}
      </p>
    );
  }

  if (isPending) {
    return (
      <p className="pf-message" role="status">
        Loading procurement financials…
      </p>
    );
  }

  if (!transactionsQuery.data?.length) {
    return (
      <p className="pf-message" role="status">
        No procurement transactions are available yet.
      </p>
    );
  }

  return (
    <div className="pf-page">
      <p className="pf-live-status" role="status" aria-live="polite">
        Live data · refreshes every 30 seconds
        {(transactionsQuery.isFetching || vendorsQuery.isFetching) &&
          " · Refreshing…"}
      </p>

      <div className="pf-metrics">
        {procurementData.categories.map((category) => (
          <SpendSummaryCard
            key={category.id}
            category={category}
            totalSpend={procurementData.totalSpend}
          />
        ))}
      </div>

      <div className="pf-grid">
        <TopVendorsCard
          vendors={procurementData.vendors}
          totalSpend={procurementData.totalSpend}
        />
        <SpendAllocationCard
          categories={procurementData.categories}
          totalSpend={procurementData.totalSpend}
        />
      </div>

      <SettlementAnalysisCard categories={procurementData.categories} />
    </div>
  );
}
