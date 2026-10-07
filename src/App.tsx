import "./layout.css";
import { DashboardTopbar } from "./components/DashboardTopbar";
import { Sidebar } from "./components/Sidebar";
import { AcademicOverview } from "./pages/AcademicOverview/AcademicOverview";

export function App() {
  return (
    <div className="layout">
      <Sidebar />

      <div className="layout-body">
        <div className="dashboard-shell">
          <DashboardTopbar />

          <main className="dashboard-content">
            <AcademicOverview />
          </main>
        </div>
      </div>
    </div>
  );
}