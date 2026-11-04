import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import api from "../../api/axios";
import { AcademicFilters } from "./AcademicFilters";
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
