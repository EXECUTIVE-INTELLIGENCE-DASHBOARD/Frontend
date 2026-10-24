import { useState } from "react";
import type { ReactElement } from "react";

import "./layout.css";
import { Hero } from "./components/Hero";
import { Sidebar } from "./components/Sidebar";
import { findNavigationLabel } from "./navigation/navigation.config";
import { AcademicPerformance } from "./pages/academic-performance/AcademicPerformance";
import { ExecutiveOverview } from "./pages/ExecutiveOverview/ExecutiveOverview";
import { PlaceholderPage } from "./pages/Placeholder/PlaceholderPage";
import { AttendanceRates } from "./pages/AttendanceRates/AttendanceRates";
import { Revenue } from "./pages/Revenue";
import { Liabilities } from "./pages/Liabilities/Liabilities";
import { ProcurementFinancials } from "./pages/ProcurementFinancials/ProcurementFinancials";
import { ExpenseManagement } from "./pages/ExpenseManagement/ExpenseManagement";
import { CoCurricularActivities } from "./pages/CoCurricularActivities/CoCurricularActivities";
import { StudentRetention } from "./pages/StudentRetention/StudentRetention";
import { AdmissionsEnrollment } from "./pages/AdmissionsEnrollment/AdmissionsEnrollment";
import { HrWorkforce } from "./pages/HrWorkforce/HrWorkforce";

import { FinanceOverview } from "./pages/FinanceOverview/FinanceOverview";
import { BudgetExpenditure } from "./pages/BudgetExpenditure/BudgetExpenditure";
import { CostCentreAnalysis } from "./pages/CostCentreAnalysis/CostCentreAnalysis";
import { FinancialForecasts } from "./pages/FinancialForecasts/FinancialForecasts";
import PurchaseOrdersApprovals from "./pages/Procurement/PurchaseOrdersApprovals";
import SupplierPerformance from "./pages/Procurement/SupplierPerformance";
import InventoryStock from "./pages/Procurement/InventoryStock";
import ProcurementRequests from "./pages/Procurement/ProcurementRequests";

import { AssetsEquipment } from "./pages/AssetsEquipment/AssetsEquipment";
import { Sales, Inventory, Budget } from "./pages/services";

const pages: Record<string, ReactElement> = {
  /* Overview + academic group */
  overview: <ExecutiveOverview />,
  "admissions-enrollment": <AdmissionsEnrollment />,
  "academic-performance": <AcademicPerformance />,
  "attendance-rates": <AttendanceRates />,
  "co-curricular-activities": <CoCurricularActivities />,
  "student-retention": <StudentRetention />,

  /* Finance & Procurement group — the ids must match the `id`s used in
     `navigation.config.ts`, or the sidebar entry renders a placeholder. */
  "finance-overview": <FinanceOverview />,
  "cost-centre-analysis": <CostCentreAnalysis />,
  "financial-forecasts": <FinancialForecasts />,
  "budget-management": <BudgetExpenditure />,
  "liabilities-management": <Liabilities />,
  "revenue-fee-collection": <Revenue />,
  "expense-management": <ExpenseManagement />,

  // New procurement page
  "procurement-financials": <ProcurementFinancials />,
  "purchase-orders-approvals": <PurchaseOrdersApprovals />,
  "supplier-performance": <SupplierPerformance />,
  "inventory-stock": <InventoryStock />,
  "procurement-requests": <ProcurementRequests />,
  
  /* Operational group — approved menu. `facilities-maintenance`,
     `fleet-transport` and `incidents-security` have no page component yet, so
     they render `PlaceholderPage`; work orders live inside facilities and ICT
     equipment inside asset management. */
  "hr-workforce": <HrWorkforce />,
  "asset-management": <AssetsEquipment />,

  /* Services group  */
  "sales": <Sales />,
  "inventory": <Inventory />,
  "budget-utilisation": <Budget />,
};

const defaultPageId = "academic-performance";

export function App() {
  const [activePage, setActivePage] = useState(defaultPageId);

  const currentPage = pages[activePage];
  const pageLabel = findNavigationLabel(activePage) ?? "Dashboard";

  return (
    <div className="layout">
      <Sidebar activeItem={activePage} onSelectItem={setActivePage} />

      <div className="layout-main">
        <Hero onSelectPage={setActivePage} />

        <main className="app-shell layout-content">
          {currentPage ?? <PlaceholderPage title={pageLabel} />}
        </main>
      </div>
    </div>
  );
}