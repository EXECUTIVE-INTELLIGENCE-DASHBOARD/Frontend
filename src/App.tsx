import "./layout.css";
import { Hero } from "./components/Hero";
import { Sidebar } from "./components/Sidebar";
import { AcademicOverview } from "./pages/AcademicOverview/AcademicOverview";

export function App() {
  return (
    <div className="layout">
      <Sidebar />

      <div className="layout-main">
        <Hero />

        <main className="app-shell layout-content">
          <AcademicOverview />
        </main>
      </div>
    </div>
  );
}