import { useState } from "react";
import type { ReactElement } from "react";

import "./layout.css";
import { Hero } from "./components/Hero";
import { Sidebar } from "./components/Sidebar";
import { findNavigationLabel } from "./navigation/navigation.config";
import { AcademicOverview } from "./pages/AcademicOverview/AcademicOverview";
import { AcademicPerformance } from "./pages/AcademicPerformance/AcademicPerformance";
import { ExecutiveOverview } from "./pages/ExecutiveOverview/ExecutiveOverview";
import { LibraryResourceUsage } from "./pages/LibraryResourceUsage/LibraryResourceUsage";
import { MyChildProgress } from "./pages/MyChildProgress/MyChildProgress";
import { PlaceholderPage } from "./pages/Placeholder/PlaceholderPage";
import { StudentEnrollment } from "./pages/StudentEnrollment/StudentEnrollment";
import { AttendanceRates } from "./pages/AttendanceRates/AttendanceRates";
import { Revenue } from "./pages/Revenue";
import { Liabilities } from "./pages/Liabilities/Liabilities";
import { ProcurementFinancials } from "./pages/ProcurementFinancials/ProcurementFinancials";
import { ExpenseManagement } from "./pages/ExpenseManagement/ExpenseManagement";
import { CoCurricularActivities } from "./pages/CoCurricularActivities/CoCurricularActivities";
import { StudentRetention } from "./pages/StudentRetention/StudentRetention";
import { HrWorkforce } from "./pages/HrWorkforce/HrWorkforce";

const pages: Record<string, ReactElement> = {
  /* Overview + academic group */
  overview: <ExecutiveOverview />,
  "academics-overview": <AcademicOverview />,
  "student-enrollment": <StudentEnrollment />,
  "academic-performance": <AcademicPerformance />,
  "parent-access": <MyChildProgress />,
  "library-resource-usage": <LibraryResourceUsage />,
  "attendance-rates": <AttendanceRates />,
  "co-curricular-activities": <CoCurricularActivities />,
  "student-retention": <StudentRetention />,

  /* Finance & Procurement group — the ids must match the `id`s used in
     `navigation.config.ts`, or the sidebar entry renders a placeholder. */
  "liabilities-management": <Liabilities />,
  "revenue-fee-collection": <Revenue />,
  "procurement-financials": <ProcurementFinancials />,
  "expense-management": <ExpenseManagement />,
  
  /* Operational group */
  "hr-workforce": <HrWorkforce />,
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