import {
  cleanup,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import api from "../../api/axios";
import { AcademicAnalytics } from "./AcademicAnalytics";
import {
  getSecondaryLevel,
  isInternationalCampus,
} from "./AcademicAnalytics";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

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
              campus: "",
              section: "secondary",
              term,
              year: "2023",
            },
          }),
        ),
      );

      expect(await screen.findByRole("region", {
        name: "O Level",
      })).toBeInTheDocument();
      expect(screen.getByRole("region", { name: "A Level" })).toBeInTheDocument();
      expect(
        screen.getAllByRole("heading", { name: "By class" }),
      ).toHaveLength(2);
      expect(
        screen.getAllByRole("heading", { name: "By subject" }),
      ).toHaveLength(2);

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
