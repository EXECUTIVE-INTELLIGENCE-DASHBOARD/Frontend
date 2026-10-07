import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "./App";

afterEach(() => {
  cleanup();
});

describe("App", () => {
  it("renders the EID application shell", () => {
    render(<App />);

    expect(
      screen.getByRole("navigation", {
        name: "Main navigation",
      }),
    ).toBeInTheDocument();
  });

  it("renders the header with the product name", () => {
    render(<App />);

    expect(screen.getByRole("banner")).toHaveTextContent("GreenHill EID");
  });

  it("renders a main content area", () => {
    render(<App />);

    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});