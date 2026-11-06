import type { ReactElement } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "./layout.css";
import { Hero } from "./components/Hero";
import { Sidebar } from "./components/Sidebar";
import { findNavigationLabel } from "./navigation/navigation.config";
import { ExecutiveOverview } from "./pages/ExecutiveOverview/ExecutiveOverview";
import { PlaceholderPage } from "./pages/Placeholder/PlaceholderPage";
import AttendanceAnalysis from "./pages/Attendance/AttendanceAnalysis";
import { Revenue } from "./pages/Revenue";
import { AcademicOverview } from "./pages/AcademicOverview/AcademicOverview";
import AcademicPerformance from "./pages/academic-performance/AcademicPerformance";
import { Liabilities } from "./pages/Liabilities/Liabilities";
import { AssetsLiabilities } from "./pages/AssetsLiabilities/AssetsLiabilities";
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
import FacilitiesMaintenance from "./pages/FacilitiesMaintenance/FacilitiesMaintenance";
import { FleetTransport } from "./pages/FleetTransport/FleetTransport";
import { Inventory, Budget, TradingPerformance } from "./pages/services";
import { IncidentSecurity } from "./pages/operations/IncidentSecurity";
const pages: Record<string, ReactElement> = {
  /* Overview + academic group */
  overview: <ExecutiveOverview />,
  "academic-overview": <AcademicOverview />,
  "admissions-enrollment": <AdmissionsEnrollment />,
  "academic-performance": <AcademicPerformance />,
  attendance: <AttendanceAnalysis />,
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
  "assets-liabilities": <AssetsLiabilities />,
  // New procurement page
  "procurement-financials": <ProcurementFinancials />,
  "purchase-orders-approvals": <PurchaseOrdersApprovals />,
  "supplier-performance": <SupplierPerformance />,
  "inventory-stock": <InventoryStock />,
  "procurement-requests": <ProcurementRequests />,

  /* Operational group — approved menu. Work orders live inside facilities
     and ICT equipment inside asset management. */
  "hr-workforce": <HrWorkforce />,
  "facilities-maintenance": <FacilitiesMaintenance />,
  "fleet-transport": <FleetTransport />,
  "asset-management": <AssetsEquipment />,
  "incidents-security": <IncidentSecurity />,

  /* Services group */
  inventory: <Inventory />,
  "budget-utilisation": <Budget />,
  "trading-performance": <TradingPerformance />,
};

const defaultPageId = "academic-performance";

export function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const activePage =
    location.pathname.replace(/^\/+|\/+$/g, "") || defaultPageId;
  // Navigate to another page using its page ID.
  const openPage = (pageId: string) => {
    navigate(`/${pageId}`);
  };

  const pageLabel = findNavigationLabel(activePage) ?? "Dashboard";

  return (
    <div className="layout">
      <Sidebar activeItem={activePage} onSelectItem={openPage} />

      <div className="layout-main">
        <Hero activePage={activePage} onSelectPage={openPage} />

        <main className="app-shell layout-content">
          <Routes>
            {/* Default page when someone opens the application root URL. */}
            <Route
              path="/"
              element={<Navigate to={`/${defaultPageId}`} replace />}
            />

            {/* Pages from the existing pages mapping. */}
            {Object.entries(pages).map(([pageId, page]) => (
              <Route key={pageId} path={`/${pageId}`} element={page} />
            ))}

            {/* Fallback for navigation items without a dedicated page yet. */}
            <Route path="*" element={<PlaceholderPage title={pageLabel} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
