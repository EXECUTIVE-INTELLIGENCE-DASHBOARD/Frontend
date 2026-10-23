import { cleanup, render, screen } from "@testing-library/react";
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
});
