import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { App } from "./App";
import { ThemeProvider } from "./context/ThemeContext";

afterEach(() => {
  cleanup();
});

describe("App", () => {
  it("renders the EID application shell", () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );

    expect(
      screen.getByRole("navigation", {
        name: "Main navigation",
      }),
    ).toBeInTheDocument();
  });
  it("renders the default Academic Performance page", () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );

    expect(
      document.querySelector("main.app-shell.layout-content"),
    ).toBeInTheDocument();
  });

  it("renders a main content area", () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );

    expect(
      document.querySelector("main.app-shell.layout-content"),
    ).toBeInTheDocument();
  });

  it("opens the Academic Overview screen from the Academics section", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );

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
