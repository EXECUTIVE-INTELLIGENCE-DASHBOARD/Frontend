import "./Hero.css";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Search, Mic, Sun, Moon, ChevronRight } from "lucide-react";
import { searchNavigation } from "../navigation/navigation.search";

interface HeroProps {
  onSelectPage?: (pageId: string) => void;
}

interface UserProfileField {
  id: string;
  label: string;
  value: string;
}

interface UserProfile {
  name: string;
  role: string;
  email: string;
  initials: string;
  fields: UserProfileField[];
}

const HARDCODED_PROFILE: UserProfile = {
  name: "GreenHill User",
  role: "GreenHill User",
  email: "user@greenhillacademy.ac.ug",
  initials: "GU",
  fields: [
    {
      id: "email",
      label: "Email",
      value: "user@greenhillacademy.ac.ug",
    },
  ],
};

export function Hero({ onSelectPage }: HeroProps) {
  const { theme, setTheme } = useTheme();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isListening, setIsListening] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [userProfile] = useState<UserProfile>(HARDCODED_PROFILE);

  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isDark = theme === "dark";
  const results = searchNavigation(query);
  const showResults = searchOpen && query.trim().length > 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60_000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSearchChange(value: string) {
    setQuery(value);
    setSearchOpen(value.trim().length > 0);
  }

  function handleSelectPage(pageId: string) {
    onSelectPage?.(pageId);
    setSearchOpen(false);
    setQuery("");
  }

  function formatCurrentDate(date: Date) {
    return date.toLocaleDateString("en-UG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <header className={`hero ${isDark ? "hero--dark" : ""}`}>
      <div className="hero__top">
        <div className="hero__date">
          <span>{formatCurrentDate(currentDate)}</span>
        </div>

        <div className="hero__actions">
          <div className="hero__search" ref={searchRef}>
            <Search size={18} aria-hidden="true" />

            <input
              type="search"
              value={query}
              placeholder="Search dashboard..."
              aria-label="Search dashboard"
              onChange={(event) => handleSearchChange(event.target.value)}
              onFocus={() => {
                if (query.trim()) setSearchOpen(true);
              }}
            />

            {query.length > 0 && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  setSearchOpen(false);
                }}
              >
                ×
              </button>
            )}

            {showResults && (
              <div className="hero__search-results">
                {results.length > 0 ? (
                  results.map((result, index) => (
                    <button
                      type="button"
                      key={`${result.id}-${index}`}
                      onClick={() => handleSelectPage(result.id)}
                    >
                      <span>{result.label}</span>
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  ))
                ) : (
                  <p>No results found.</p>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className="hero__icon-button"
            aria-label={isListening ? "Stop voice search" : "Start voice search"}
            onClick={() => setIsListening((current) => !current)}
          >
            <Mic size={20} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="hero__icon-button"
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? (
              <Sun size={20} aria-hidden="true" />
            ) : (
              <Moon size={20} aria-hidden="true" />
            )}
          </button>

          <div className="hero__profile" ref={profileRef}>
            <button
              type="button"
              className="hero__profile-trigger"
              aria-expanded={profileOpen}
              aria-label="Open user profile"
              onClick={() => setProfileOpen((current) => !current)}
            >
              <span className="hero__avatar">{userProfile.initials}</span>

              <span>
                <span className="hero__user-name">{userProfile.name}</span>
                <span className="hero__user-role">{userProfile.role}</span>
              </span>
            </button>

            {profileOpen && (
              <div className="hero__profile-dropdown">
                <div className="hero__profile-header">
                  <span className="hero__avatar">{userProfile.initials}</span>

                  <div>
                    <span className="hero__profile-name">
                      {userProfile.name}
                    </span>
                    <span className="hero__profile-role">
                      {userProfile.role}
                    </span>
                  </div>
                </div>

                <dl>
                  {userProfile.fields.map((field) => (
                    <div key={field.id} className="hero__profile-field">
                      <dt>{field.label}</dt>
                      <dd>{field.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}