
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import api from "../../api/axios";
import { StudentEnrollment } from "./StudentEnrollment";
import {
  axisFor,
  fetchEnrollmentDashboard,
  funnelWidths,
  toSummary,
  type EnrollmentDashboard,
} from "./studentEnrollment.data";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockEnrollmentData: EnrollmentDashboard = {
  term: {
    id: 1,
    label: "Term 1, 2026",
  },
  summary: {
    total_active_enrolment: 2800,
    admissions_conversion: 84.5,
    capacity: 3070,
    capacity_utilisation: 91.2,
  },
  gender: {
    boys: 1430,
    girls: 1370,
    boys_pct: 51.1,
    girls_pct: 48.9,
  },
  campuses: [
    {
      campus: "kibuli",
      campus_display: "Kibuli Main",
      boys: 640,
      girls: 610,
      total: 1250,
    },
    {
      campus: "buwaate",
      campus_display: "Buwaate",
      boys: 430,
      girls: 420,
      total: 850,
    },
    {
      campus: "annex",
      campus_display: "Annex Preschool",
      boys: 360,
      girls: 340,
      total: 700,
    },
  ],
  schools: [],
  pipeline: [
    {
      stage: "applications",
      label: "Applications",
      count: 1000,
      rate: 100,
    },
    {
      stage: "admissions",
      label: "Admissions",
      count: 845,
      rate: 84.5,
    },
    {
      stage: "enrolled",
      label: "Enrolled",
      count: 700,
      rate: 70,
    },
  ],
};

const mockKibuliData: EnrollmentDashboard = {
  ...mockEnrollmentData,
  summary: {
    ...mockEnrollmentData.summary,
    total_active_enrolment: 1250,
    admissions_conversion: 85.8,
    capacity_utilisation: 93.3,
  },
  gender: {
    boys: 640,
    girls: 610,
    boys_pct: 51.2,
    girls_pct: 48.8,
  },
  campuses: [mockEnrollmentData.campuses[0]],
};

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        refetchInterval: false,
      },
    },
  });

const renderDashboard = () => {
  const queryClient = createQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <StudentEnrollment />
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  vi.mocked(api.get).mockImplementation(
    async (_url, config?: AxiosRequestConfig) => {
      const campus = config?.params?.campus;

      return {
        data: campus === "kibuli" ? mockKibuliData : mockEnrollmentData,
      };
    },
  );
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("fetchEnrollmentDashboard", () => {
  it("fetches enrollment data from the API endpoint", async () => {
    const result = await fetchEnrollmentDashboard();

    expect(api.get).toHaveBeenCalledWith(
      "/academics/enrollment/dashboard/",
      expect.objectContaining({
        params: {},
      }),
    );

    expect(result).toEqual(mockEnrollmentData);
  });

  it("sends the selected campus as an API parameter", async () => {
    await fetchEnrollmentDashboard("kibuli");

    expect(api.get).toHaveBeenCalledWith(
      "/academics/enrollment/dashboard/",
      expect.objectContaining({
        params: { campus: "kibuli" },
      }),
    );
  });

  it("passes the abort signal to the API request", async () => {
    const controller = new AbortController();

    await fetchEnrollmentDashboard("", controller.signal);

    expect(api.get).toHaveBeenCalledWith(
      "/academics/enrollment/dashboard/",
      expect.objectContaining({
        signal: controller.signal,
      }),
    );
  });
});

describe("StudentEnrollment", () => {
  it("fetches data and renders the three headline cards", async () => {
    renderDashboard();

    expect(
      await screen.findByText("Total Active Enrolment"),
    ).toBeInTheDocument();

    expect(await screen.findByText("2,800")).toBeInTheDocument();
    expect(screen.getAllByText("84.5%").length).toBeGreaterThan(0);
    expect(screen.getAllByText("91.2%").length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        "/academics/enrollment/dashboard/",
        expect.objectContaining({
          params: {},
        }),
      );
    });
  });

  it("shows the four campus filter options", async () => {
    renderDashboard();

    const campusSelect = screen.getByLabelText("Select Campus");

    expect(campusSelect).toHaveValue("");

    await screen.findByText("2,800");

    expect(
      within(campusSelect).getAllByRole("option").map(
        (option) => option.textContent,
      ),
    ).toEqual([
      "All Campuses",
      "Kibuli Main",
      "Buwaate",
      "Annex Preschool",
    ]);
  });

  it("changes the figures when a campus is selected", async () => {
    renderDashboard();

    await screen.findByText("2,800");

    fireEvent.change(screen.getByLabelText("Select Campus"), {
      target: { value: "kibuli" },
    });

    expect(await screen.findByText("1,250")).toBeInTheDocument();
    expect(screen.getByText("85.8%")).toBeInTheDocument();
    expect(screen.getByText("93.3%")).toBeInTheDocument();
    expect(screen.getByText("Kibuli Main 1,250 students")).toBeInTheDocument();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        "/academics/enrollment/dashboard/",
        expect.objectContaining({
          params: { campus: "kibuli" },
        }),
      );
    });
  });

  it("shows a loading status while the initial API request is pending", async () => {
    let resolveRequest!: (value: { data: EnrollmentDashboard }) => void;

    vi.mocked(api.get).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );

    renderDashboard();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading student enrolment data",
    );

    resolveRequest({ data: mockEnrollmentData });

    expect(await screen.findByText("2,800")).toBeInTheDocument();
  });

  it("shows an error and allows the user to retry", async () => {
    vi.mocked(api.get)
      .mockRejectedValueOnce(new Error("Request failed"))
      .mockResolvedValueOnce({ data: mockEnrollmentData });

    renderDashboard();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Request failed",
    );

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("2,800")).toBeInTheDocument();
  });
});

describe("enrollment data helpers", () => {
  it("maps the API response into the dashboard summary", () => {
    const summary = toSummary(mockEnrollmentData, null);

    expect(summary.total).toBe(2800);
    expect(summary.boys).toBe(1430);
    expect(summary.girls).toBe(1370);
    expect(summary.conversion).toBe(84.5);
    expect(summary.utilization).toBe(91.2);
    expect(summary.scopeText).toBe("Aggregate 2,800 students");
  });

  it("calculates the chart axis for expected peaks", () => {
    expect(axisFor(640).top).toBe(800);
    expect(axisFor(640).ticks).toEqual([0, 200, 400, 600, 800]);

    expect(axisFor(1450).top).toBe(1600);
    expect(axisFor(1450).ticks).toEqual([0, 400, 800, 1200, 1600]);
  });

  it("calculates funnel widths from the pipeline counts", () => {
    expect(funnelWidths(mockEnrollmentData.pipeline)).toEqual([
      100,
      84.5,
      70,
    ]);
  });

  it("does not lose students when campus gender totals are combined", () => {
    const campusTotal = mockEnrollmentData.campuses.reduce(
      (total, campus) => total + campus.boys + campus.girls,
      0,
    );

    expect(campusTotal).toBe(2800);
  });
});
