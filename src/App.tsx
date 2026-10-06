import "./layout.css";

export function App() {
  return (
    <div className="layout">
      <header className="layout-header">
        <span className="layout-brand">GreenHill EID</span>
        <nav aria-label="Primary" className="layout-nav">
          <ul>
            <li>
              {/* Placeholder: replace with real routes once the SRS screens are approved */}
              <a href="/" aria-current="page">
                Home
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main className="app-shell layout-content">
        <h1>Frontend foundation</h1>
        <p>
          The application shell is ready for the approved Enterprise Incident and Service
          Management requirements.
        </p>
        <p className="next-step">Next: implement reviewed product workflows and connect the API.</p>
      </main>
    </div>
  );
}

