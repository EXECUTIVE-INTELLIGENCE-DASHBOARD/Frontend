import { Bell, ChevronDown, Mic, Moon, Search, Sun } from "lucide-react";

import executivelogo from "../assets/executivelogo.png";
import { useTheme } from "../theme/ThemeProvider";

import "./DashboardTopbar.css";

export function DashboardTopbar() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="topbar" role="banner">
      <span className="sr-only">GreenHill EID</span>

      <div className="topbar__identity">
        <span className="topbar__logo-badge">
          <img src={executivelogo} alt="" className="topbar__logo" />
        </span>

        <span className="topbar__heading">
          <span className="topbar__title">Dashboard</span>
          <span className="topbar__date">01 August, 2025</span>
        </span>
      </div>

      <label className="topbar__search">
        <Search className="topbar__search-icon" size={18} aria-hidden="true" />

        <input
          type="search"
          className="topbar__search-input"
          placeholder="Search..."
          aria-label="Search dashboard"
        />

        <Mic className="topbar__search-mic" size={16} aria-hidden="true" />
      </label>

      <div className="topbar__actions">
        <button
          type="button"
          className="topbar__icon-button"
          onClick={toggleTheme}
          aria-label={
            isDark ? "Switch to light appearance" : "Switch to dark appearance"
          }
          aria-pressed={isDark}
        >
          {isDark ? (
            <Moon size={18} aria-hidden="true" />
          ) : (
            <Sun size={18} aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          className="topbar__icon-button"
          aria-label="Notifications"
        >
          <Bell size={18} aria-hidden="true" />
          <span className="topbar__badge" aria-hidden="true" />
        </button>

        <button type="button" className="topbar__profile">
          <span className="topbar__avatar" aria-hidden="true">
            MH
          </span>

          <span className="topbar__profile-text">
            <span className="topbar__profile-name">Munal Hassan</span>
            <span className="topbar__profile-role">Vice President</span>
          </span>

          <ChevronDown size={16} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
