import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("renders the project foundation shell", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Frontend foundation", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/approved Enterprise Incident and Service Management requirements/i))
      .toBeInTheDocument();
  });
});

