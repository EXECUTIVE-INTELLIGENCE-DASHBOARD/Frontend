import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Hero } from "./Hero";
import { ThemeProvider } from "../context/ThemeContext";

describe("Hero", () => {
  const renderHero = (onSelectPage?: (pageId: string) => void) =>
    render(
      <ThemeProvider>
        <Hero onSelectPage={onSelectPage} />
      </ThemeProvider>,
    );

  it("renders the dashboard heading", () => {
    renderHero();

    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
  });

  it("renders today's date", () => {
    renderHero();

    // The header date is generated at render time, so compare against the
    // same formatter rather than a frozen string.
    const expected = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    expect(screen.getByText(expected)).toBeInTheDocument();
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

  it("searches for a screen and navigates to it", () => {
    const onSelectPage = vi.fn();

    renderHero(onSelectPage);

    const search = screen.getByRole("searchbox", { name: "Search" });

    fireEvent.change(search, { target: { value: "library" } });
    fireEvent.focus(search);

    const result = screen.getByRole("button", {
      name: /Library & Resource Usage/,
    });

    fireEvent.click(result);

    expect(onSelectPage).toHaveBeenCalledWith("library-resource-usage");
    expect(search).toHaveValue("");
  });

  it("shows an empty state when nothing matches the search", () => {
    renderHero();

    fireEvent.change(screen.getByRole("searchbox", { name: "Search" }), {
      target: { value: "zzz" },
    });

    expect(screen.getByText(/No pages match/i)).toBeInTheDocument();
  });

  it("reveals the signed-in user's details from the profile", () => {
    renderHero();

    // Closed by default.
    expect(
      screen.queryByText("maruf.hossen@greenhill.ac.ug"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open user profile" }));

    expect(
      screen.getByText("maruf.hossen@greenhill.ac.ug"),
    ).toBeInTheDocument();

    expect(screen.getByText("GH-STAFF-0284")).toBeInTheDocument();
  });
});