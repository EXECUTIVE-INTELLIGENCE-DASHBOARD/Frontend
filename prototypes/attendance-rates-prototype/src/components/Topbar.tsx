import {
  Bell,
  ChevronDown,
  CircleHelp,
  LayoutGrid,
  Moon,
  Search,
  Sun,
} from 'lucide-react';
import { useTheme } from '../theme';

export function Topbar() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <div className="topbar__heading">
        <span className="topbar__title">Dashboard</span>
        <span className="topbar__date">31 August 2026</span>
      </div>

      <div className="topbar__search">
        <Search size={16} aria-hidden />
        <input type="search" placeholder="Search" aria-label="Search" />
      </div>

      <div className="topbar__actions">
        <button type="button" className="icon-button" aria-label="Applications">
          <LayoutGrid size={18} strokeWidth={1.9} aria-hidden />
        </button>
        <button type="button" className="icon-button" aria-label="Help">
          <CircleHelp size={18} strokeWidth={1.9} aria-hidden />
        </button>
        <button type="button" className="icon-button" aria-label="Notifications">
          <Bell size={18} strokeWidth={1.9} aria-hidden />
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={toggleTheme}
          aria-pressed={isDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <Sun size={18} strokeWidth={1.9} aria-hidden />
          ) : (
            <Moon size={18} strokeWidth={1.9} aria-hidden />
          )}
        </button>

        <span className="topbar__divider" aria-hidden />

        <button type="button" className="topbar__user">
          <span className="avatar" aria-hidden>
            MH
          </span>
          <span className="topbar__user-meta">
            <span className="topbar__user-name">Mark Hussain</span>
            <span className="topbar__user-role">Campus Administrator</span>
          </span>
          <ChevronDown size={15} aria-hidden />
        </button>
      </div>
    </header>
  );
}
