
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import api from "../../api/axios";
import { AcademicSummary } from "./AcademicSummary";

import type { AcademicFilterValues } from "../filters/academicFilters.types";

import "@testing-library/jest-dom/vitest";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("./useAcademicPerformanceDashboard", () => ({
  useAcademicPerformanceDashboard: vi.fn(),
}));

const mockedApiGet = vi.mocked(api.get);

const defaultFilters: AcademicFilterValues = {
  school: "",
  campus: "",
  section: "",
  term: "3",
  year: "2026",
};



const terms = [
  {
    id: 1,
    number: 1,
    academic_year: "2026",
  },
  {
    id: 2,
    number: 2,
    academic_year: "2026",
  },
  {
    id: 3,
    number: 3,
    academic_year: "2026",
  },
];



function renderComponent(
  filters: AcademicFilterValues = defaultFilters,
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AcademicSummary filters={filters} />
    </QueryClientProvider>,
  );
}



describe("AcademicSummary", () => {
  

  afterEach(() => {
    cleanup();
  });

  it("renders the national and Cambridge examinations heading", async () => {
    renderComponent();

    expect(
      screen.getByRole("heading", {
        name: /national and cambridge examinations over the years/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/examination outcomes, candidate numbers/i),
    ).toBeInTheDocument();
  });

  it("loads national examination results from the API", async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockedApiGet).toHaveBeenCalledWith(
        "/academics/national-exam-results/",
        expect.objectContaining({
          params: expect.any(Object),
          signal: expect.any(AbortSignal),
        }),
      );
    });
  });

  it("loads academic terms from the API", async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockedApiGet).toHaveBeenCalledWith(
        "/academics/terms/",
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      );
    });
  });

  it("displays the PLE, UCE, UACE and Cambridge cards", async () => {
    renderComponent();

    expect(
      await screen.findByRole("heading", {
        name: "Primary Leaving Examination",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Uganda Certificate of Education",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Uganda Advanced Certificate",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Cambridge Checkpoint",
      }),
    ).toBeInTheDocument();
  });

  it("calculates the PLE pass rate using the returned results", async () => {
    renderComponent();

    await screen.findByRole("heading", {
      name: "Primary Leaving Examination",
    });

    expect(screen.getByText("67%")).toBeInTheDocument();
    expect(screen.getByText("3 candidates")).toBeInTheDocument();
  });

  it("calculates the UCE pass rate using the returned results", async () => {
    renderComponent();

    await screen.findByRole("heading", {
      name: "Uganda Certificate of Education",
    });

    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("2 candidates")).toBeInTheDocument();
  });

  it("displays UACE principal passes", async () => {
    renderComponent();

    await screen.findByRole("heading", {
      name: "Uganda Advanced Certificate",
    });

    expect(screen.getByText("3 principal passes")).toBeInTheDocument();
  });

  it("displays historical examination results", async () => {
    renderComponent();

    await screen.findByRole("heading", {
      name: "Primary Leaving Examination",
    });

    expect(
      screen.getByText("Historical pass rate"),
    ).toBeInTheDocument();

    expect(screen.getByText("2024")).toBeInTheDocument();
    expect(screen.getByText("2025")).toBeInTheDocument();
  });

  it("displays candidate division information", async () => {
    renderComponent();

    await screen.findByRole("heading", {
      name: "Primary Leaving Examination",
    });

    expect(
      screen.getAllByText("Candidate divisions").length,
    ).toBeGreaterThan(0);

    expect(screen.getAllByText("Division 1").length).toBeGreaterThan(0);
  });

  it("shows the Cambridge results unavailable message", async () => {
    renderComponent();

    await screen.findByRole("heading", {
      name: "Cambridge Checkpoint",
    });

    expect(
      screen.getByText(
        /cambridge checkpoint results are not yet available/i,
      ),
    ).toBeInTheDocument();
  });

  it("shows the Term 3 notice when Term 1 is selected", () => {
    renderComponent({
      ...defaultFilters,
      term: "1",
    });

    expect(
      screen.getByText(/external examinations are reported in term 3/i),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Primary Leaving Examination",
      }),
    ).not.toBeInTheDocument();
  });

  it("shows the Term 3 notice when Term 2 is selected", () => {
    renderComponent({
      ...defaultFilters,
      term: "2",
    });

    expect(
      screen.getByText(/external examinations are reported in term 3/i),
    ).toBeInTheDocument();
  });

  it("displays primary academic summary cards when Primary is selected", () => {
    renderComponent({
      ...defaultFilters,
      section: "Primary",
    });

    expect(screen.getByText("Average mark")).toBeInTheDocument();
    expect(screen.getByText("Pass rate")).toBeInTheDocument();
    expect(screen.getByText("Learners assessed")).toBeInTheDocument();

    expect(screen.getByText("68.5%")).toBeInTheDocument();
    expect(screen.getByText("78.0%")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
  });

  it("does not display the examination heading in the primary summary view", () => {
    renderComponent({
      ...defaultFilters,
      section: "Primary",
    });

    expect(
      screen.queryByRole("heading", {
        name: /national and cambridge examinations over the years/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("displays an error message when examination results fail to load", async () => {
    mockedApiGet.mockImplementation((url) => {
      if (url === "/academics/national-exam-results/") {
        return Promise.reject(new Error("Network error"));
      }

      return Promise.resolve({
        data: terms,
      });
    });

    renderComponent();

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(/unable to load national examination results/i);
  });

  it("displays an empty state when no examination results are returned", async () => {
    mockedApiGet.mockImplementation((url) => {
      if (url === "/academics/national-exam-results/") {
        return Promise.resolve({
          data: [],
        });
      }

      return Promise.resolve({
        data: terms,
      });
    });

    renderComponent();

    expect(
      await screen.findAllByText(
        /no examination results are available for these filters/i,
      ),
    ).toHaveLength(3);
  });
});