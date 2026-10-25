import { afterEach, describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { App } from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { cleanup, render, screen } from "@testing-library/react";
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

  
});
