import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NotificationBell } from "./NotificationBell";
import { getFinanceAlerts, type FinanceAlert } from "./notifications.api";

vi.mock("./notifications.api", () => ({ getFinanceAlerts: vi.fn() }));

const school = (name: string, campus: string) => ({ id: name.length, name, campus });

const alerts: FinanceAlert[] = [
  { id: "statutory-1", severity: "critical", title: "NSSF overdue",
    message: "UGX 5.0M is overdue; the oldest was due 15 Feb 2026. Compliance risk.",
    school: school("Greenhill International School", "gis"), page: "assets-liabilities",
    date: "2026-02-15" },
  { id: "cash-cover-2", severity: "warning", title: "Cash cover below 1.5×",
    message: "Cash covers 1.3× of the UGX 55.5M due in the next 30 days.",
    school: school("GreenHill Academy Primary Buwaate", "buwaate"),
    page: "assets-liabilities", date: "2026-11-01" },
  { id: "loan-due-3", severity: "info", title: "Loan instalment due 01 Dec",
    message: "UGX 5.5M to School Lender (LOAN-001).",
    school: school("Green Hill Academy Secondary School Kibuli", "kibuli"),
    page: "assets-liabilities", date: "2026-12-01" },
];

describe("NotificationBell", () => {
  const load = vi.mocked(getFinanceAlerts);

  beforeEach(() => {
    load.mockReset();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("shows the unread count and lists the alerts", async () => {
    load.mockResolvedValue(alerts);
    render(<NotificationBell />);

    const bell = await screen.findByRole("button", { name: "Notifications, 3 unread" });
    fireEvent.click(bell);

    const panel = screen.getByRole("region", { name: "Notifications" });
    expect(within(panel).getByText("NSSF overdue: GIS")).toBeInTheDocument();
    expect(within(panel).getByText("Cash cover below 1.5×: Buwaate Primary")).toBeInTheDocument();
    expect(within(panel).getByText("Loan instalment due 01 Dec: Kibuli Secondary")).toBeInTheDocument();
    expect(within(panel).getAllByText(/Assets & Liabilities ·/)).toHaveLength(3);
  });

  it("marks everything read and remembers it", async () => {
    load.mockResolvedValue(alerts);
    const { unmount } = render(<NotificationBell />);

    fireEvent.click(await screen.findByRole("button", { name: "Notifications, 3 unread" }));
    fireEvent.click(screen.getByRole("button", { name: "Mark all as read" }));
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
    unmount();

    render(<NotificationBell />);
    expect(await screen.findByRole("button", { name: "Notifications" })).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("opens the alert's screen and marks it read", async () => {
    load.mockResolvedValue(alerts);
    const onSelectPage = vi.fn();
    render(<NotificationBell onSelectPage={onSelectPage} />);

    fireEvent.click(await screen.findByRole("button", { name: "Notifications, 3 unread" }));
    const item = screen.getByText("Cash cover below 1.5×: Buwaate Primary").closest("li")!;
    fireEvent.click(within(item).getByRole("button", { name: "View" }));

    expect(onSelectPage).toHaveBeenCalledWith("assets-liabilities");
    expect(screen.getByRole("button", { name: "Notifications, 2 unread" })).toBeInTheDocument();
  });

  it("pops up an urgent alert once per session", async () => {
    load.mockResolvedValue(alerts);
    const { unmount } = render(<NotificationBell />);

    const toast = await screen.findByRole("status");
    expect(toast).toHaveTextContent("Compliance alert");
    expect(toast).toHaveTextContent("NSSF overdue: GIS");
    fireEvent.click(within(toast).getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    // Dismissing the pop-up does not mark the alert read.
    expect(screen.getByRole("button", { name: "Notifications, 3 unread" })).toBeInTheDocument();
    unmount();

    render(<NotificationBell />);
    await screen.findByRole("button", { name: "Notifications, 3 unread" });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("does not pop up warnings or reminders", async () => {
    load.mockResolvedValue(alerts.slice(1));
    render(<NotificationBell />);

    await screen.findByRole("button", { name: "Notifications, 2 unread" });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows only the alerts that belong on the screen", async () => {
    const onScreens: FinanceAlert[] = [
      { ...alerts[0], pages: ["assets-liabilities", "liabilities-management", "finance-overview"] },
      { ...alerts[1], id: "collection-9", title: "Fee collection behind", page: "revenue-fee-collection",
        pages: ["revenue-fee-collection"] },
    ];
    load.mockResolvedValue(onScreens);
    const { rerender } = render(<NotificationBell pageId="revenue-fee-collection" />);

    fireEvent.click(await screen.findByRole("button", { name: "Notifications, 1 unread" }));
    expect(screen.getByText("Fee collection behind: Buwaate Primary")).toBeInTheDocument();
    expect(screen.queryByText("NSSF overdue: GIS")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument(); // nothing urgent here

    rerender(<NotificationBell pageId="assets-liabilities" />);
    expect(await screen.findByRole("status")).toHaveTextContent("NSSF overdue: GIS");
    expect(screen.getByRole("button", { name: "Notifications, 1 unread" })).toBeInTheDocument();

    rerender(<NotificationBell pageId="academic-performance" />);
    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByText("No alerts for this screen.")).toBeInTheDocument();
  });

  it("is quiet when there is nothing to report", async () => {
    load.mockResolvedValue([]);
    render(<NotificationBell />);

    fireEvent.click(await screen.findByRole("button", { name: "Notifications" }));
    expect(screen.getByText("No alerts for this screen.")).toBeInTheDocument();
  });
});
