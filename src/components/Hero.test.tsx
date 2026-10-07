import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Hero } from "./Hero";
import { ThemeProvider } from "../context/ThemeContext";

describe("Hero", () => {
  const renderHero = () =>
    render(
      <ThemeProvider>
        <Hero />
      </ThemeProvider>,
    );

  it("renders the dashboard heading", () => {
    renderHero();

    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
  });

  it("renders the current date", () => {
    renderHero();

    expect(
      screen.getByText("01 August, 2026"),
    ).toBeInTheDocument();
  });

  it("renders the search field", () => {
    renderHero();

    expect(
      screen.getByRole("searchbox", { name: "Search" }),
    ).toBeInTheDocument();
  });

  it("renders the voice search button", () => {
    renderHero();

    expect(
      screen.getByRole("button", { name: "Voice search" }),
    ).toBeInTheDocument();
  });

  it("renders the theme controls", () => {
    renderHero();

    expect(
      screen.getByRole("button", { name: "Light mode" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Dark mode" }),
    ).toBeInTheDocument();
  });

  it("renders the user profile", () => {
    renderHero();

    expect(
      screen.getByRole("button", { name: "Open user profile" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Maruf Hossen")).toBeInTheDocument();
    expect(screen.getByText("UI Designer")).toBeInTheDocument();
  });
});