import "./Hero.css";
import { useEffect, useRef, useState } from "react";
import { Search, Mic, Bell, Sun, Moon, ChevronRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { userProfile } from "../lib/userProfile";
import { searchNavigation } from "../navigation/navigation.search";

interface HeroProps {
  /** Lets the header jump to another screen from the search results. */
  onSelectPage?: (pageId: string) => void;
}

export function Hero({ onSelectPage }: HeroProps) {
  const { theme, setTheme } = useTheme();

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isDark = theme === "dark";
  const results = searchNavigation(query);
  const showResults = searchOpen && query.trim().length > 0;

  // Close the popovers when the user clicks away.
  useEffect(() => {
    if (!searchOpen && !profileOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (!searchRef.current?.contains(target)) {
        setSearchOpen(false);
      }

      if (!profileRef.current?.contains(target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [searchOpen, profileOpen]);

  // Escape closes whichever popover is open.
  useEffect(() => {
    if (!searchOpen && !profileOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setProfileOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, profileOpen]);

  function goToPage(pageId: string) {
    onSelectPage?.(pageId);
    setQuery("");
    setSearchOpen(false);
  }

  return (
    <header className="hero">
      {/* Page information */}
      <div className="hero__page-info">
        <h1 className="hero__title">Dashboard</h1>
        <p className="hero__date">01 August, 2026</p>
      </div>

      {/* Search */}
      <div className="hero__search-wrapper" ref={searchRef}>
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
            value={query}
            aria-expanded={showResults}
            aria-controls="hero-search-results"
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
              setProfileOpen(false);
            }}
            onFocus={() => {
              setSearchOpen(true);
              setProfileOpen(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && results.length > 0) {
                event.preventDefault();
                goToPage(results[0].id);
              }
            }}
          />
        </div>

        <button
          className="hero__search-mic"
          type="button"
          aria-label="Voice search"
        >
          <Mic size={15} aria-hidden="true" />
        </button>

        {showResults && (
          <div
            className="hero__search-results"
            id="hero-search-results"
            aria-label="Search results"
          >
            {results.length > 0 ? (
              <>
                <p className="hero__search-results-title">Pages</p>

                <ul className="hero__search-list">
                  {results.map((result) => (
                    <li key={result.id}>
                      <button
                        className="hero__search-result"
                        type="button"
                        onClick={() => goToPage(result.id)}
                      >
                        <span className="hero__search-result-label">
                          {result.label}
                        </span>

                        <span className="hero__search-result-group">
                          {result.group}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="hero__search-empty">
                No pages match &ldquo;{query.trim()}&rdquo;.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="hero__actions">
        {/* Notifications */}
        <button
          className="hero__notify"
          type="button"
          aria-label="Notifications"
        >
          <Bell size={15} aria-hidden="true" />

          <span className="hero__notify-badge" aria-hidden="true" />
        </button>

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
        <div className="hero__profile-menu" ref={profileRef}>
          <button
            className="hero__profile"
            type="button"
            aria-label="Open user profile"
            aria-expanded={profileOpen}
            aria-controls="hero-profile-panel"
            onClick={() => {
              setProfileOpen((open) => !open);
              setSearchOpen(false);
            }}
          >
            <span className="hero__avatar">{userProfile.initials}</span>

            <span className="hero__user-info">
              <span className="hero__user-name">{userProfile.name}</span>

              <span className="hero__user-role">{userProfile.role}</span>
            </span>

            <ChevronRight
              className={`hero__profile-arrow ${
                profileOpen ? "hero__profile-arrow--open" : ""
              }`}
              size={16}
              aria-hidden="true"
            />
          </button>

          {profileOpen && (
            <div
              className="hero__profile-panel"
              id="hero-profile-panel"
              aria-label="Your profile"
            >
              <div className="hero__profile-head">
                <span className="hero__profile-avatar" aria-hidden="true">
                  {userProfile.initials}
                </span>

                <span className="hero__profile-identity">
                  <span className="hero__profile-name">
                    {userProfile.name}
                  </span>

                  <span className="hero__profile-role">
                    {userProfile.role}
                  </span>
                </span>
              </div>

              <dl className="hero__profile-fields">
                {userProfile.fields.map((field) => (
                  <div className="hero__profile-field" key={field.id}>
                    <dt className="hero__profile-field-label">
                      {field.label}
                    </dt>

                    <dd className="hero__profile-field-value">
                      {field.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}