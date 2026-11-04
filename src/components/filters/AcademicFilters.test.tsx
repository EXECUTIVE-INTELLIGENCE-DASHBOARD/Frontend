import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import api from "../../api/axios";
import {
  AcademicFilters,
  getAcademicTermOptions,
  getAcademicYears,
  sortAcademicTerms,
} from "./AcademicFilters";
import type { AcademicFilterValues } from "./academicFilters.types";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const schools = [
  { id: 1, name: "Kibuli Primary", campus: "kibuli", level: "primary" },
  { id: 2, name: "Buwaate Primary", campus: "buwaate", level: "primary" },
  {
    id: 3,
    name: "GIS Kansanga",
    campus: "gis_kansanga",
    level: "international",
  },
];

const initialValues: AcademicFilterValues = {
  school: "",
  campus: "",
  section: "",
  term: "",
  year: "",
};

const terms = [
  { id: 8, academic_year: 2022, number: 3, start_date: "", end_date: "" },
  { id: 6, academic_year: 2022, number: 1, start_date: "", end_date: "" },
  { id: 7, academic_year: 2022, number: 2, start_date: "", end_date: "" },
  { id: 2, academic_year: 2019, number: 2, start_date: "", end_date: "" },
  { id: 3, academic_year: 2020, number: 1, start_date: "", end_date: "" },
];

beforeEach(() => {
  vi.mocked(api.get).mockImplementation(async (url) => {
    if (url === "/academics/schools/") return { data: schools };
    if (url === "/academics/terms/") return { data: [] };
    throw new Error(`Unexpected API endpoint: ${url}`);
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AcademicFilters school selection", () => {
  it("lists available academic years from 2020 in chronological order", () => {
    const finalYear = Math.max(new Date().getFullYear(), 2022);
    expect(getAcademicYears(terms)).toEqual(
      Array.from({ length: finalYear - 2019 }, (_, index) =>
        String(2020 + index),
      ),
    );
  });

  it("generates years through the current year and includes future API years", () => {
    expect(getAcademicYears(terms, 2026)).toEqual([
      "2020",
      "2021",
      "2022",
      "2023",
      "2024",
      "2025",
      "2026",
    ]);
    expect(
      getAcademicYears(
        [
          ...terms,
          {
            id: 20,
            academic_year: 2028,
            number: 1,
            start_date: "",
            end_date: "",
          },
        ],
        2026,
      ),
    ).toContain("2028");
  });

  it("orders terms as Term 1, Term 2, then Term 3 within each year", () => {
    expect(sortAcademicTerms(terms).map((term) => [term.academic_year, term.number]))
      .toEqual([
        [2022, 1],
        [2022, 2],
        [2022, 3],
        [2020, 1],
      ]);
  });

  it("always provides Term 1 through Term 3, using API ids when available", () => {
    expect(getAcademicTermOptions(terms, "2022")).toEqual([
      { value: "6", number: 1 },
      { value: "7", number: 2 },
      { value: "8", number: 3 },
    ]);
    expect(getAcademicTermOptions([], "2024", 2026)).toEqual([
      { value: "term-number-1", number: 1 },
      { value: "term-number-2", number: 2 },
      { value: "term-number-3", number: 3 },
    ]);
  });

  it("shows Term 1 through Term 3 and years from 2020", async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url === "/academics/schools/") return { data: schools };
      if (url === "/academics/terms/") return { data: terms };
      throw new Error(`Unexpected API endpoint: ${url}`);
    });

    render(
      <AcademicFilters
        values={{ ...initialValues, year: "2022" }}
        onChange={vi.fn()}
        showCampusFilter={false}
        showSectionFilter={false}
      />,
    );

    const termSelect = await screen.findByRole("combobox", { name: "Term" });
    const options = Array.from(termSelect.querySelectorAll("option")).map(
      (option) => option.textContent,
    );
    expect(options).toEqual([
      "All Terms",
      "Term 1",
      "Term 2",
      "Term 3",
    ]);

    const yearSelect = screen.getByRole("combobox", { name: "Academic Year" });
    expect(
      Array.from(yearSelect.querySelectorAll("option")).map(
        (option) => option.textContent,
      ),
    ).toContain("2020");
    expect(
      Array.from(yearSelect.querySelectorAll("option")).map(
        (option) => option.textContent,
      ),
    ).toContain(String(new Date().getFullYear()));
  });

  it("renders just the term and year controls when campus and section are provided separately", async () => {
    render(
      <AcademicFilters
        values={initialValues}
        onChange={vi.fn()}
        showCampusFilter={false}
        showSectionFilter={false}
        showFilterLabels={false}
      />,
    );

    expect(await screen.findByRole("combobox", { name: "Term" })).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Academic Year" })).toBeVisible();
    expect(screen.queryByRole("combobox", { name: "Campus" })).toBeNull();
    expect(screen.queryByRole("combobox", { name: "Section" })).toBeNull();
    expect(
      screen.getByRole("combobox", { name: "Term" }).closest("label")?.querySelector("span"),
    ).toHaveClass("academic-performance__filter-label--sr-only");
    expect(
      screen
        .getByRole("combobox", { name: "Academic Year" })
        .closest("label")
        ?.querySelector("span"),
    ).toHaveClass("academic-performance__filter-label--sr-only");
  });

  it("hides filter labels by default while keeping controls accessible", async () => {
    render(
      <AcademicFilters
        values={initialValues}
        onChange={vi.fn()}
      />,
    );

    const campusSelect = await screen.findByRole("combobox", {
      name: "Campus",
    });
    expect(campusSelect.closest("label")?.querySelector("span")).toHaveClass(
      "campus-filter__sr-only",
    );
    expect(
      screen.getByRole("combobox", { name: "Term" })
        .closest("label")
        ?.querySelector("span"),
    ).toHaveClass("academic-performance__filter-label--sr-only");
    expect(
      screen.getByRole("combobox", { name: "Academic Year" })
        .closest("label")
        ?.querySelector("span"),
    ).toHaveClass("academic-performance__filter-label--sr-only");
  });

  it("keeps Term and Academic Year enabled when the terms request fails", async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url === "/academics/schools/") return { data: schools };
      if (url === "/academics/terms/") throw new Error("Terms unavailable");
      throw new Error(`Unexpected API endpoint: ${url}`);
    });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <AcademicFilters
        values={initialValues}
        onChange={vi.fn()}
        showCampusFilter={false}
        showSectionFilter={false}
      />,
    );

    const termSelect = await screen.findByRole("combobox", { name: "Term" });
    const yearSelect = screen.getByRole("combobox", { name: "Academic Year" });

    expect(termSelect).toBeEnabled();
    expect(yearSelect).toBeEnabled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not load term data.",
    );
    expect(termSelect.querySelectorAll("option")).toHaveLength(4);

    consoleError.mockRestore();
  });

  it("uses the shared campus options when schools cannot load", async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url === "/academics/schools/") throw new Error("Schools unavailable");
      if (url === "/academics/terms/") return { data: [] };
      throw new Error(`Unexpected API endpoint: ${url}`);
    });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const onChange = vi.fn();

    render(
      <AcademicFilters
        values={initialValues}
        onChange={onChange}
      />,
    );

    const campusSelect = await screen.findByRole("combobox", {
      name: "Campus",
    });
    expect(
      screen.getByRole("option", { name: "Kibuli Main" }),
    ).toBeInTheDocument();

    fireEvent.change(campusSelect, {
      target: { value: "Buwaate Campus" },
    });
    expect(onChange).toHaveBeenLastCalledWith({
      ...initialValues,
      campus: "buwaate",
    });

    consoleError.mockRestore();
  });

  it("scopes Kibuli and Buwaate school selections to the matching campus and section", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <AcademicFilters
        values={initialValues}
        onChange={onChange}
        showSchoolFilter
      />,
    );

    const schoolSelect = await screen.findByRole("combobox", {
      name: "School",
    });

    await waitFor(() => {
      expect(schoolSelect).toHaveValue("");
    });

    fireEvent.change(schoolSelect, { target: { value: "1" } });
    expect(onChange).toHaveBeenLastCalledWith({
      ...initialValues,
      school: "1",
      campus: "kibuli",
      section: "primary",
    });

    const kibuliValues = onChange.mock.calls.at(-1)?.[0];
    rerender(
      <AcademicFilters
        values={kibuliValues}
        onChange={onChange}
        showSchoolFilter
      />,
    );
    fireEvent.change(schoolSelect, { target: { value: "2" } });

    expect(onChange).toHaveBeenLastCalledWith({
      ...initialValues,
      school: "2",
      campus: "buwaate",
      section: "primary",
    });

    const buwaateValues = onChange.mock.calls.at(-1)?.[0];
    rerender(
      <AcademicFilters
        values={buwaateValues}
        onChange={onChange}
        showSchoolFilter
      />,
    );
    fireEvent.change(schoolSelect, { target: { value: "" } });

    expect(onChange).toHaveBeenLastCalledWith(initialValues);
  });

  it("keeps the international school on All sections", async () => {
    const onChange = vi.fn();
    render(
      <AcademicFilters
        values={initialValues}
        onChange={onChange}
        showSchoolFilter
      />,
    );

    const schoolSelect = await screen.findByRole("combobox", {
      name: "School",
    });

    fireEvent.change(schoolSelect, { target: { value: "3" } });

    expect(onChange).toHaveBeenLastCalledWith({
      ...initialValues,
      school: "3",
      campus: "gis_kansanga",
      section: "",
    });
  });
});
