import "./layout.css";
import { Sidebar } from "./components/Sidebar";
import { Hero } from "./components/Hero";

export function App() {
  return (
    <div className="layout">
      <Sidebar />

      <div className="layout-main">
        <Hero />

        <main className="app-shell layout-content">
          <h1>Frontend foundation</h1>

          <p>
            The application shell is ready for the approved Enterprise
            Incident and Service Management requirements.
          </p>

          <p className="next-step">
            Next: implement reviewed product workflows and connect the API.
          </p>
        </main>
      </div>
    </div>
  );
}