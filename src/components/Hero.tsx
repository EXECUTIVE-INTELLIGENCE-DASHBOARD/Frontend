import "./Hero.css";
import { useEffect, useRef, useState } from "react";
import { Search, Mic, Sun, Moon, ChevronRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { userProfile } from "../lib/userProfile";
import { searchNavigation } from "../navigation/navigation.search";
import { signOut } from "../lib/api/core";
import { NotificationBell } from "./notifications/NotificationBell";

interface HeroProps {
  /** The screen being shown, so the bell lists only its alerts. */
  activePage?: string;
  /** Lets the header jump to another screen from the search results. */
  onSelectPage?: (pageId: string) => void;
}

export function Hero({ activePage, onSelectPage }: HeroProps) {
  const { theme, setTheme } = useTheme();

  // The header date is live, so a tab left open overnight does not go stale.
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60_000);

    return () => clearInterval(timer);
  }, []);

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isDark = theme === "dark";

  function handleSignOut() {
    setProfileOpen(false);

    // The session ending here is not this app's: it belongs to the identity
    // provider and is the same one PMS and ISMP are using, so only that
    // service can end it. It navigates the whole browser, which is why the
    // promise is deliberately not awaited.
    void signOut();
  }

  const results = searchNavigation(query);
  const showResults = searchOpen && query.trim().length > 0;

  function startVoiceSearch() {
    type SpeechRecognitionInstance = {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      onresult:
        | ((event: {
            results: ArrayLike<ArrayLike<{ transcript: string }>>;
          }) => void)
        | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      start: () => void;
    };

    type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

    const SpeechRecognitionAPI =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      window.alert("Voice search is not supported. Please try Chrome.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();

      recognition.lang = "en-UG";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        setQuery(event.results[0][0].transcript);
        setSearchOpen(true);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      setIsListening(true);
      recognition.start();
    } catch {
      setIsListening(false);
      window.alert(
        "Could not start voice search. Check microphone permissions.",
      );
    }
  }

  // Close either popover when the user clicks outside or presses Escape.
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

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
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
        <p className="hero__date">
          {currentDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
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
          onClick={startVoiceSearch}
          aria-label={isListening ? "Listening..." : "Voice search"}
          aria-pressed={isListening}
          title={isListening ? "Listening..." : "Voice search"}
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
        {/* Notifications: alerts live here, not on the screens */}
        <NotificationBell pageId={activePage} onSelectPage={onSelectPage} />

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
              <button
                className="hero__logout"
                type="button"
                onClick={handleSignOut}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}