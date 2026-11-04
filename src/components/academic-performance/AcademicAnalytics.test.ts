import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import api from "../../api/axios";
import { AcademicAnalytics, getSecondaryLevel, isInternationalCampus } from "./AcademicAnalytics";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderAnalytics(section: string, term: string, campus = "") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(AcademicAnalytics, {
        filters: {
          school: "",
          campus,
          section,
          term,
          year: "2023",
        },
      }),
    ),
  );
}

describe("AcademicAnalytics helpers", () => {
  it("recognizes international campuses by their name", () => {
    expect(isInternationalCampus("Greenhill International")).toBe(true);
    expect(isInternationalCampus("Kibuli Main Campus")).toBe(false);
  });

  it("maps secondary class labels to their academic level", () => {
    expect(getSecondaryLevel("S.4")).toBe("O Level");
    expect(getSecondaryLevel("S.5")).toBe("A Level");
    expect(getSecondaryLevel("Primary 7")).toBeNull();
  });
});

describe("all-campus secondary analytics", () => {
  it.each(["1", "2", "3"])(
    "loads class and subject charts for Term %s using the dashboard endpoint",
    async (term) => {
      vi.mocked(api.get).mockImplementation(async (url) => {
        if (url === "/academics/performance/dashboard/") {
          return {
            data: {
              term: { id: Number(term), number: Number(term), label: `Term ${term}` },
              compared_with: null,
              summary: { students_assessed: 20 },
              tests: [
                {
                  subject: "Mathematics",
                  level: "secondary",
                  class_level: "S.1",
                  test_1_average: 58,
                  test_2_average: 60,
                },
                {
                  subject: "Physics",
                  level: "secondary",
                  class_level: "S.5",
                  test_1_average: 61,
                  test_2_average: 63,
                },
              ],
              by_class: [
                {
                  class_level: "S.1",
                  level: "secondary",
                  test_1_average: 58,
                  test_2_average: 60,
                },
                {
                  class_level: "S.5",
                  level: "secondary",
                  test_1_average: 61,
                  test_2_average: 63,
                },
              ],
            },
          };
        }

        throw new Error(`Unexpected API endpoint: ${url}`);
      });

      renderAnalytics("secondary", term);

      expect(await screen.findByRole("region", { name: "O Level" })).toBeInTheDocument();
      expect(screen.getByRole("region", { name: "A Level" })).toBeInTheDocument();
      expect(screen.getAllByRole("heading", { name: "By class" })).toHaveLength(2);
      expect(screen.getAllByRole("heading", { name: "By subject" })).toHaveLength(2);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith(
          "/academics/performance/dashboard/",
          expect.objectContaining({
            params: { level: "secondary", term: Number(term), year: "2023" },
          }),
        );
      });
    },
  );
});

describe("all-campus primary analytics", () => {
  it.each(["1", "2", "3"])(
    "loads campus comparison charts from live school data for Term %s",
    async (term) => {
      vi.mocked(api.get).mockImplementation(async (url, config) => {
        if (url === "/academics/schools/") {
          return {
            data: [
              {
                id: 11,
                name: "Kibuli Primary",
                level: "primary",
                campus: "kibuli",
                campus_display: "Kibuli Primary",
              },
              {
                id: 12,
                name: "Buwaate Primary",
                level: "primary",
                campus: "buwaate",
                campus_display: "Buwaate Primary",
              },
            ],
          };
        }

        if (url === "/academics/performance/dashboard/") {
          const params = config?.params as { school?: number } | undefined;
          const offset = params?.school === 12 ? 2 : 0;
          return {
            data: {
              tests: [
                {
                  subject: "Mathematics",
                  level: "primary",
                  class_level: "P.1",
                  test_1_average: 58 + offset,
                  test_2_average: 60 + offset,
                },
              ],
              by_class: [
                {
                  class_level: "P.1",
                  level: "primary",
                  test_1_average: 58 + offset,
                  test_2_average: 60 + offset,
                },
              ],
            },
          };
        }

        throw new Error(`Unexpected API endpoint: ${url}`);
      });

      renderAnalytics("primary", term);

      expect(
        await screen.findByRole("heading", {
          name: "Internal assessments · by class and by subject",
        }),
      ).toBeInTheDocument();
      expect(screen.getByText(/All campuses · Primary/)).toBeInTheDocument();
      expect(
        await screen.findByRole("heading", { name: "By class" }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole("heading", { name: "By subject" }),
      ).toBeInTheDocument();
      expect(await screen.findAllByText("Kibuli Primary")).toHaveLength(2);
      expect(await screen.findAllByText("Buwaate Primary")).toHaveLength(2);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith(
          "/academics/performance/dashboard/",
          expect.objectContaining({
            params: { school: 11, level: "primary", term: Number(term), year: "2023" },
          }),
        );
        expect(api.get).toHaveBeenCalledWith(
          "/academics/performance/dashboard/",
          expect.objectContaining({
            params: { school: 12, level: "primary", term: Number(term), year: "2023" },
          }),
        );
      });

    },
  );
});

describe("primary campus assessment insights", () => {
  it.each(["kibuli", "buwaate"])(
    "loads real learner history for the %s campus and does not invent gender data",
    async (campus) => {
      vi.mocked(api.get).mockImplementation(async (url, config) => {
        if (url === "/academics/terms/") {
          return {
            data: [
              { id: 1, number: 1, academic_year: "2023" },
              { id: 2, number: 2, academic_year: "2023" },
              { id: 3, number: 3, academic_year: "2023" },
              { id: 4, number: 1, academic_year: "2022" },
              { id: 5, number: 2, academic_year: "2022" },
              { id: 6, number: 3, academic_year: "2022" },
            ],
          };
        }

        if (url === "/academics/performance/dashboard/") {
          const params = config?.params as { term?: number } | undefined;
          const termId = params?.term ?? 1;
          const termNumber = ((termId - 1) % 3) + 1;
          return {
            data: {
              term: {
                id: termId,
                number: termNumber,
                label: `Term ${termNumber}`,
              },
              summary: {
                students_assessed:
                  termId <= 3 ? 290 + termNumber : 280 + termNumber,
              },
              tests: [
                {
                  subject: "Mathematics",
                  level: "primary",
                  class_level: "P.1",
                  test_1_average: 58,
                  test_2_average: 60,
                },
              ],
              by_class: [
                {
                  class_level: "P.1",
                  level: "primary",
                  test_1_average: 58,
                  test_2_average: 60,
                },
              ],
            },
          };
        }

        throw new Error(`Unexpected API endpoint: ${url}`);
      });

      renderAnalytics("primary", "1", campus);

      expect(
        await screen.findByRole("heading", { name: "Learners assessed" }),
      ).toBeInTheDocument();
      expect(await screen.findByText(/Term 1:/)).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Girls vs boys" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Gender-disaggregated assessment counts and averages are not provided/,
        ),
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith(
          "/academics/performance/dashboard/",
          expect.objectContaining({
            params: expect.objectContaining({
              campus,
              level: "primary",
              term: 1,
            }),
          }),
        );
      });
    },
  );
});
