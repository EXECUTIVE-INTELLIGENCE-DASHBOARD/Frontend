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
    expect(screen.getByText("Greenhill Academy")).toBeInTheDocument();
  });

  it("searches for a screen and navigates to it", () => {
    const onSelectPage = vi.fn();

    renderHero(onSelectPage);

    const search = screen.getByRole("searchbox", { name: "Search" });

    fireEvent.change(search, { target: { value: "attendance" } });
    fireEvent.focus(search);

    const result = screen.getByRole("button", {
      name: /Attendance/,
    });

    fireEvent.click(result);

    expect(onSelectPage).toHaveBeenCalledWith("attendance");
    expect(search).toHaveValue("");
  });

  it("shows an empty state when nothing matches the search", () => {
    renderHero();

    fireEvent.change(screen.getByRole("searchbox", { name: "Search" }), {
      target: { value: "zzz" },
    });

    expect(screen.getByText(/No pages match/i)).toBeInTheDocument();
  });

  it("shows only the logout option in the profile dropdown", () => {
    renderHero();

    fireEvent.click(screen.getByRole("button", { name: "Open user profile" }));

    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
    expect(screen.queryByText("UI Designer")).not.toBeInTheDocument();
    expect(screen.queryByText("maruf.hossen@greenhill.ac.ug")).not.toBeInTheDocument();
    expect(screen.queryByText("+256 772 480 116")).not.toBeInTheDocument();
    expect(screen.queryByText("Green Hill Academy Secondary School Kibuli")).not.toBeInTheDocument();
    expect(screen.queryByText("Digital & Innovation")).not.toBeInTheDocument();
    expect(screen.queryByText("GH-STAFF-0284")).not.toBeInTheDocument();
  });
});