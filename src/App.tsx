import { useState } from "react";
import type { ReactElement } from "react";

import "./layout.css";
import { Hero } from "./components/Hero";
import { Sidebar } from "./components/Sidebar";
import { findNavigationLabel } from "./navigation/navigation.config";
import { AcademicOverview } from "./pages/AcademicOverview/AcademicOverview";
import { AcademicPerformance } from "./pages/AcademicPerformance/AcademicPerformance";
import { PlaceholderPage } from "./pages/Placeholder/PlaceholderPage";

const pages: Record<string, ReactElement> = {
  overview: <AcademicOverview />,
  "academics-overview": <AcademicOverview />,
  "academic-performance": <AcademicPerformance />,
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
        <Hero />

        <main className="app-shell layout-content">
          {currentPage ?? <PlaceholderPage title={pageLabel} />}
        </main>
      </div>
    </div>
  );
}