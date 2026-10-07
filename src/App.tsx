import "./layout.css";
import { Sidebar } from "./components/Sidebar";

export function App() {
  return (
    <div className="layout">
      <Sidebar />

      <header className="layout-header">
        <span className="layout-brand">GreenHill EID</span>
      </header>

      <main className="app-shell layout-content">
        <h1>Frontend foundation</h1>

        <p>
          The application shell is ready for the approved Enterprise Incident
          and Service Management requirements.
        </p>

        <p className="next-step">
          Next: implement reviewed product workflows and connect the API.
        </p>
      </main>
    </div>
  );
}