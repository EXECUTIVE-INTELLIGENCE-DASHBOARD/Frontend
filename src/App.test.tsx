import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { App } from "./App";
import { ThemeProvider } from "./context/ThemeContext";

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchInterval: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
});

describe("App", () => {
  it("renders the EID application shell", () => {
    renderApp();

    expect(
      screen.getByRole("navigation", {
        name: "Main navigation",
      }),
    ).toBeInTheDocument();
  });

  it("renders the default Academic Performance page", () => {
    renderApp();

    expect(
      document.querySelector("main.app-shell.layout-content"),
    ).toBeInTheDocument();
  });

  it("renders a main content area", () => {
    renderApp();

    expect(
      document.querySelector("main.app-shell.layout-content"),
    ).toBeInTheDocument();
  });

  it("opens the Academic Overview screen from the Academics section", async () => {
    const user = userEvent.setup();

    renderApp();

    const submenu = document.getElementById("academics-submenu");

    expect(submenu).not.toBeNull();

    await user.click(
      within(submenu as HTMLElement).getByRole("button", {
        name: "Overview",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Academic Overview",
      }),
    ).toBeInTheDocument();
  });
});