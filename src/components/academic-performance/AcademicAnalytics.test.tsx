import { describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

import { AcademicAnalytics } from "./AcademicAnalytics";
import { useAcademicPerformanceDashboard } from "./useAcademicPerformanceDashboard";

import type { AcademicFilterValues } from "../filters/academicFilters.types";

import "@testing-library/jest-dom/vitest";

vi.mock("./useAcademicPerformanceDashboard", () => ({
  useAcademicPerformanceDashboard: vi.fn(),
}));

const mockedDashboard = vi.mocked(
  useAcademicPerformanceDashboard,
);

const defaultFilters: AcademicFilterValues = {
  school: "",
  campus: "",
  section: "",
  term: "3",
  year: "2026",
};

const dashboardData = {
  tests: [
    {
      id: 1,
      subject: "Mathematics",
      level: "primary",
      level_display: "Primary",
      test_1_average: 50,
      test_2_average: 60,
      test_1_pass_rate: 60,
      test_2_pass_rate: 70,
      students_assessed: 100,
    },
    {
      id: 2,
      subject: "English",
      level: "primary",
      level_display: "Primary",
      test_1_average: 70,
      test_2_average: 80,
      test_1_pass_rate: 80,
      test_2_pass_rate: 90,
      students_assessed: 120,
    },
    {
      id: 3,
      subject: "Science",
      level: "primary",
      level_display: "Primary",
      test_1_average: 80,
      test_2_average: 90,
      test_1_pass_rate: 90,
      test_2_pass_rate: 95,
      students_assessed: 110,
    },
    {
      id: 4,
      subject: "Physics",
      level: "a_level",
      level_display: "A Level",
      test_1_average: 65,
      test_2_average: 75,
      test_1_pass_rate: 75,
      test_2_pass_rate: 85,
      students_assessed: 40,
    },
  ],
};

type MockTest = {
  id?: number;
  subject?: string;
  level?: string;
  level_display?: string;
  test_1_average?: number | string | null;
  test_2_average?: number | string | null;
  test_1_pass_rate?: number | string | null;
  test_2_pass_rate?: number | string | null;
  students_assessed?: number | string | null;
};

type MockDashboardData = {
  tests?: MockTest[];
};

function mockDashboard(
  data: MockDashboardData | undefined = dashboardData,
  state: {
    isLoading?: boolean;
    isError?: boolean;
  } = {},
) {
  mockedDashboard.mockReturnValue({
    data,
    isLoading: state.isLoading ?? false,
    isError: state.isError ?? false,
  } as never);
}

function renderComponent(
  filters: AcademicFilterValues = defaultFilters,
) {
  return render(
    <AcademicAnalytics filters={filters} />,
  );
}

describe("AcademicAnalytics", () => {
  it("renders the internal assessment analysis heading", () => {
    mockDashboard();

    renderComponent();

    expect(
      screen.getByRole("heading", {
        name: "Internal assessment analysis",
      }),
    ).toBeInTheDocument();
  });

  it("renders the assessment period switch", () => {
    mockDashboard();

    renderComponent();

    expect(
      screen.getByRole("group", {
        name: "Select assessment period",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Midterm",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "End of term",
      }),
    ).toBeInTheDocument();
  });

  it("selects Midterm by default", () => {
    mockDashboard();

    renderComponent();

    expect(
      screen.getByRole("button", {
        name: "Midterm",
      }),
    ).toHaveAttribute("aria-pressed", "true");

    expect(
      screen.getByRole("button", {
        name: "End of term",
      }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("displays the subject assessment results table", () => {
    mockDashboard();

    renderComponent();

    expect(
      screen.getByRole("heading", {
        name: "Subject assessment results",
      }),
    ).toBeInTheDocument();

    const table = screen.getByRole("table");

    expect(
      within(table).getByRole("columnheader", {
        name: "Subject",
      }),
    ).toBeInTheDocument();

    expect(
      within(table).getByRole("columnheader", {
        name: "Section",
      }),
    ).toBeInTheDocument();

    expect(
      within(table).getByRole("columnheader", {
        name: "Average mark",
      }),
    ).toBeInTheDocument();

    expect(
      within(table).getByRole("columnheader", {
        name: "Pass rate",
      }),
    ).toBeInTheDocument();

    expect(
      within(table).getByRole("columnheader", {
        name: "Learners assessed",
      }),
    ).toBeInTheDocument();
  });

  it("displays all subjects when no section is selected", () => {
    mockDashboard();

    renderComponent();

    expect(screen.getByText("Mathematics")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Science")).toBeInTheDocument();
    expect(screen.getByText("Physics")).toBeInTheDocument();
  });

  it("filters subjects according to the selected section", () => {
    mockDashboard();

    renderComponent({
      ...defaultFilters,
      section: "Primary",
    });

    expect(screen.getByText("Mathematics")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Science")).toBeInTheDocument();

    expect(
      screen.queryByText("Physics"),
    ).not.toBeInTheDocument();
  });

  it("calculates the average mark correctly", () => {
    mockDashboard();

    renderComponent();

    // (50 + 70 + 80 + 65) / 4 = 66.25
    expect(screen.getByText("66.3%")).toBeInTheDocument();
  });

  it("calculates the average pass rate correctly", () => {
    mockDashboard();

    renderComponent();

    // (60 + 80 + 90 + 75) / 4 = 76.25
    expect(screen.getByText("76.3%")).toBeInTheDocument();
  });

  it("displays the highest subject-level learner count", () => {
    mockDashboard();

    renderComponent();

    expect(
      screen.getByText("Highest subject-level assessed count"),
    ).toBeInTheDocument();

    expect(screen.getAllByText("120").length).toBeGreaterThan(0);
  });

  it("identifies the subject with the lowest average mark", () => {
    mockDashboard();

    renderComponent();

    expect(
      screen.getByText("Lowest average:"),
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("Mathematics").length,
    ).toBeGreaterThan(0);

    expect(screen.getByText("Lowest")).toBeInTheDocument();
  });

  it("sorts subjects from lowest to highest average mark", () => {
    mockDashboard();

    renderComponent();

    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");

    expect(rows[1]).toHaveTextContent("Mathematics");
    expect(rows[2]).toHaveTextContent("Physics");
    expect(rows[3]).toHaveTextContent("English");
    expect(rows[4]).toHaveTextContent("Science");
  });

  it("switches to End of term assessment results", () => {
    mockDashboard();

    renderComponent();

    fireEvent.click(
      screen.getByRole("button", {
        name: "End of term",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "End of term",
      }),
    ).toHaveAttribute("aria-pressed", "true");

    expect(
      screen.getByText(
        "End-of-term results for the selected academic filters",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("76.3%")).toBeInTheDocument();
  });

  it("updates subject marks when the assessment period changes", () => {
    mockDashboard();

    renderComponent();

    const table = screen.getByRole("table");

    expect(
      within(table).getByText("50.0%"),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "End of term",
      }),
    );

    expect(
      within(table).getByText("60.0%"),
    ).toBeInTheDocument();
  });

  it("displays a loading state while dashboard data is loading", () => {
    mockDashboard(undefined, {
      isLoading: true,
    });

    renderComponent();

    expect(
      screen.getByText(/loading internal assessment results/i),
    ).toBeInTheDocument();
  });

  it("displays an error state when dashboard data cannot be loaded", () => {
    mockDashboard(undefined, {
      isError: true,
    });

    renderComponent();

    expect(
      screen.getByText(/assessment results are unavailable/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/we could not retrieve the results/i),
    ).toBeInTheDocument();
  });

  it("displays an empty state when no assessment results exist", () => {
    mockDashboard({
      tests: [],
    });

    renderComponent();

    expect(
      screen.getByText(/no midterm results available/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/there are no recorded subject assessment results/i),
    ).toBeInTheDocument();
  });

  it("displays an empty state when the selected assessment has no recorded marks or pass rates", () => {
    mockDashboard({
      tests: [
        {
          id: 1,
          subject: "Mathematics",
          level: "primary",
          level_display: "Primary",
          test_1_average: null,
          test_2_average: null,
          test_1_pass_rate: null,
          test_2_pass_rate: null,
          students_assessed: 50,
        },
      ],
    });

    renderComponent();

    expect(
      screen.getByText(/no midterm results available/i),
    ).toBeInTheDocument();
  });

  it("does not display NaN when assessment values are missing", () => {
    mockDashboard({
      tests: [
        {
          id: 1,
          subject: "Mathematics",
          level: "primary",
          level_display: "Primary",
          test_1_average: null,
          test_2_average: null,
          test_1_pass_rate: null,
          test_2_pass_rate: null,
          students_assessed: null,
        },
      ],
    });

    renderComponent();

    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it("uses a fallback subject name when the subject name is missing", () => {
    mockDashboard({
      tests: [
        {
          id: 1,
          level: "primary",
          level_display: "Primary",
          test_1_average: 65,
          test_1_pass_rate: 70,
          students_assessed: 30,
        },
      ],
    });

    renderComponent();

    expect(
      screen.getByText("Unnamed subject"),
    ).toBeInTheDocument();
  });

  it("uses a fallback section label when the level is missing", () => {
    mockDashboard({
      tests: [
        {
          id: 1,
          subject: "Mathematics",
          test_1_average: 65,
          test_1_pass_rate: 70,
          students_assessed: 30,
        },
      ],
    });

    renderComponent();

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});