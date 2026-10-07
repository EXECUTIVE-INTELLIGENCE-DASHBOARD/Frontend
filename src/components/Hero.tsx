import "./Hero.css";
import { Search, Mic, Sun, Moon, ChevronRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function Hero() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <header className="hero">
      {/* Page information */}
      <div className="hero__page-info">
        <h1 className="hero__title">Dashboard</h1>
        <p className="hero__date">01 August, 2026</p>
      </div>

      {/* Search */}
      <div className="hero__search-wrapper">
        <div className="hero__search">
          <Search
            className="hero__search-icon"
            size={15}
            aria-hidden="true"
          />

          <input
            className="hero__search-input"
            type="search"
            placeholder="Search..."
            aria-label="Search"
          />
        </div>

        <button
          className="hero__search-mic"
          type="button"
          aria-label="Voice search"
        >
          <Mic size={15} aria-hidden="true" />
        </button>
      </div>

      {/* Actions */}
      <div className="hero__actions">
        {/* Theme toggle */}
        <div className="hero__theme-toggle">
          <button
            className={`hero__theme-button ${
              !isDark ? "hero__theme-button--active" : ""
            }`}
            type="button"
            onClick={() => setTheme("light")}
            aria-label="Light mode"
            aria-pressed={!isDark}
          >
            <Sun size={15} aria-hidden="true" />
          </button>

          <button
            className={`hero__theme-button ${
              isDark ? "hero__theme-button--active" : ""
            }`}
            type="button"
            onClick={() => setTheme("dark")}
            aria-label="Dark mode"
            aria-pressed={isDark}
          >
            <Moon size={15} aria-hidden="true" />
          </button>
        </div>

        {/* User profile */}
        <button
          className="hero__profile"
          type="button"
          aria-label="Open user profile"
        >
          <span className="hero__avatar">M</span>

          <span className="hero__user-info">
            <span className="hero__user-name">Maruf Hossen</span>

            <span className="hero__user-role">UI Designer</span>
          </span>

          <ChevronRight
            className="hero__profile-arrow"
            size={16}
            aria-hidden="true"
          />
        </button>
      </div>
    </header>
  );
}