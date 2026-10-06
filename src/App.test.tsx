import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "./App";

afterEach(() => {
  cleanup();
});

describe("App", () => {
  it("renders the project foundation shell", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Frontend foundation", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/approved Enterprise Incident and Service Management requirements/i))
      .toBeInTheDocument();
  });

  it("renders the header with the product name", () => {
    render(<App />);

    expect(screen.getByRole("banner")).toHaveTextContent("GreenHill EID");
  });

  it("renders a primary navigation area", () => {
    render(<App />);

    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
  });

  it("renders a main content area", () => {
    render(<App />);

    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
