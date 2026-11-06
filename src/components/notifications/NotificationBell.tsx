import {
  Bell,
  CalendarClock,
  TrendingDown,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { shortSchoolName } from "../../lib/finance.format";
import { findNavigationLabel } from "../../navigation/navigation.config";
import {
  getFinanceAlerts,
  type AlertSeverity,
  type FinanceAlert,
} from "./notifications.api";

import "./NotificationBell.css";

/** Alerts read in this browser; stored so the count stays down after a reload. */
const READ_KEY = "eid.notifications.read";
/** Urgent alerts already shown as a pop-up in this session, so each pops up once. */
const SHOWN_KEY = "eid.notifications.shown";
const REFRESH_MS = 5 * 60 * 1000;
const TOAST_MS = 8000;
const PANEL_LIMIT = 5;

const icons: Record<AlertSeverity, LucideIcon> = {
  critical: TriangleAlert,
  warning: TrendingDown,
  info: CalendarClock,
};

function loadIds(storage: () => Storage, key: string): Set<string> {
  try {
    return new Set(JSON.parse(storage().getItem(key) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

function saveIds(storage: () => Storage, key: string, ids: Set<string>) {
  try {
    storage().setItem(key, JSON.stringify([...ids]));
  } catch {
    // Private windows can refuse storage; the bell still works for this visit.
  }
}

const local = () => window.localStorage;
const session = () => window.sessionStorage;

const heading = (alert: FinanceAlert) =>
  `${alert.title}: ${shortSchoolName(alert.school.name, alert.school.campus)}`;

const showDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/** "Liabilities" for liabilities-management: where the alert came from. */
const pageLabel = (pageId: string) =>
  (findNavigationLabel(pageId) ?? "Finance").replace(" Management", "");

/** Whether an alert belongs on a screen; with no screen given, every alert does. */
const belongsOn = (alert: FinanceAlert, pageId?: string) =>
  !pageId || (alert.pages ?? [alert.page]).includes(pageId);

interface NotificationBellProps {
  /** The screen being shown: only its alerts are counted, listed and popped up. */
  pageId?: string;
  /** Opens the screen an alert came from. */
  onSelectPage?: (pageId: string) => void;
}

/**
 * The bell in the top bar: an unread count, a panel listing the alerts, and a one-off
 * pop-up for urgent ones, all for the screen being shown. Alerts live here rather than on
 * the screens.
 */
export function NotificationBell({ pageId }: NotificationBellProps) {
  const [alerts, setAlerts] = useState<FinanceAlert[]>([]);
  const [read, setRead] = useState(() => loadIds(local, READ_KEY));
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [toast, setToast] = useState<{
    alert: FinanceAlert;
    more: number;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;

    function load() {
      getFinanceAlerts().then((next) => {
        if (live) setAlerts(next);
      });
    }

    load();
    const timer = window.setInterval(load, REFRESH_MS);
    return () => {
      live = false;
      window.clearInterval(timer);
    };
  }, []);

  // Pop up this screen's urgent alerts not yet shown this session, once each.
  useEffect(() => {
    const shown = loadIds(session, SHOWN_KEY);
    const alreadyRead = loadIds(local, READ_KEY);
    const fresh = alerts.filter(
      (a) =>
        a.severity === "critical" &&
        belongsOn(a, pageId) &&
        !shown.has(a.id) &&
        !alreadyRead.has(a.id),
    );
    setToast(
      fresh.length > 0 ? { alert: fresh[0], more: fresh.length - 1 } : null,
    );
    if (fresh.length > 0) {
      fresh.forEach((a) => shown.add(a.id));
      saveIds(session, SHOWN_KEY, shown);
    }
  }, [alerts, pageId]);

  // The panel and its "view all" start fresh on each screen.
  useEffect(() => {
    setOpen(false);
    setShowAll(false);
  }, [pageId]);

  // The pop-up fades on its own; the alert stays in the bell until it is read.
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Close the panel on an outside click or Escape.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function markRead(ids: string[]) {
    // Keep only ids still in the list, so the stored set does not grow forever.
    const current = new Set(alerts.map((a) => a.id));
    const next = new Set([...read, ...ids].filter((id) => current.has(id)));
    setRead(next);
    saveIds(local, READ_KEY, next);
  }

  function markAlertViewed(alertId: string) {
    markRead([alertId]);
    setOpen(false);
    setToast(null);
  }

  const here = alerts.filter((a) => belongsOn(a, pageId));
  const unread = here.filter((a) => !read.has(a.id)).length;
  const listed = showAll ? here : here.slice(0, PANEL_LIMIT);

  return (
    <div className="notify" ref={menuRef}>
      <button
        className="hero__notify"
        type="button"
        aria-label={
          unread ? `Notifications, ${unread} unread` : "Notifications"
        }
        aria-expanded={open}
        aria-controls="notify-panel"
        onClick={() => setOpen((o) => !o)}
      >
        <Bell size={15} aria-hidden="true" />
        {unread > 0 && (
          <span className="notify__count" aria-hidden="true">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <section
          className="notify__panel"
          id="notify-panel"
          aria-label="Notifications"
        >
          <header className="notify__head">
            <strong>
              Notifications {unread > 0 && <span>{unread} unread</span>}
            </strong>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markRead(here.map((a) => a.id))}
              >
                Mark all as read
              </button>
            )}
          </header>

          {here.length === 0 ? (
            <p className="notify__empty">No alerts for this screen.</p>
          ) : (
            <ul
              className={`notify__list${showAll ? " notify__list--all" : ""}`}
            >
              {listed.map((alert) => {
                const Icon = icons[alert.severity];
                const isRead = read.has(alert.id);
                return (
                  <li
                    key={alert.id}
                    className={`notify__item notify__item--${alert.severity}${isRead ? " is-read" : ""}`}
                  >
                    <span className="notify__icon" aria-hidden="true">
                      <Icon size={15} />
                    </span>
                    <div className="notify__text">
                      <strong>{heading(alert)}</strong>
                      <span>{alert.message}</span>
                      <span className="notify__meta">
                        {pageLabel(alert.page)} · {showDate(alert.date)} ·{" "}
                        <Link
                          to={`/${alert.page}`}
                          onClick={() => markAlertViewed(alert.id)}
                        >
                          View
                        </Link>
                      </span>
                    </div>
                    {!isRead && (
                      <span className="notify__dot" aria-label="Unread" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {here.length > PANEL_LIMIT && (
            <button
              type="button"
              className="notify__foot"
              onClick={() => setShowAll((all) => !all)}
            >
              {showAll
                ? "Show fewer"
                : `View all notifications (${here.length})`}
            </button>
          )}
        </section>
      )}

      {toast && (
        <div className="notify__toast" role="status">
          <button
            type="button"
            className="notify__toast-close"
            aria-label="Close"
            onClick={() => setToast(null)}
          >
            <X size={14} />
          </button>
          <strong>Compliance alert</strong>
          <p>
            {heading(toast.alert)}. {toast.alert.message}
            {toast.more > 0 &&
              ` And ${toast.more} more urgent alert${toast.more === 1 ? "" : "s"} in the bell.`}
          </p>
          <div className="notify__toast-actions">
            <Link
              to={`/${toast.alert.page}`}
              className="notify__toast-view"
              onClick={() => markAlertViewed(toast.alert.id)}
            >
              View
            </Link>
            <button
              type="button"
              className="notify__toast-dismiss"
              onClick={() => setToast(null)}
            >
              Dismiss
            </button>
          </div>
          <span
            className="notify__toast-timer"
            style={{ animationDuration: `${TOAST_MS}ms` }}
          />
        </div>
      )}
    </div>
  );
}
