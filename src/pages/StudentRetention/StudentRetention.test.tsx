import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import api from "../../api/axios";
import { StudentRetention } from "./StudentRetention";
import type { RetentionDashboardData } from "./studentRetention.api";
import { fetchStudentRetention } from "./studentRetention.api";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("./studentRetention.api", () => ({
  fetchStudentRetention: vi.fn(),
}));

const mockSchools = [
  {
    id: 1,
    name: "Kibuli Secondary School",
    campus: "kibuli",
    campus_display: "Kibuli Main Campus",
    level: "secondary",
  },
  {
    id: 2,
    name: "Buwaate Secondary School",
    campus: "buwaate",
    campus_display: "Buwaate Campus",
    level: "secondary",
  },
  {
    id: 3,
    name: "Annex Preschool",
    campus: "annex",
    campus_display: "Annex / Preschool Branch",
    level: "nursery",
  },
];

const mockRetentionData = {
  summary: {
    total_re_enrolled: 1200,
    eligible_to_return: 1356,
    at_risk: 150,
  },
  by_nationality: [
    {
      nationality: "Ugandan",
      campus: "kibuli",
      campus_display: "Kibuli Main Campus",
      re_enrolled: 1100,
      eligible: 1250,
      retention_rate: 88.0,
    },
    {
      nationality: "South Sudanese & Other Intl",
      campus: "buwaate",
      campus_display: "Buwaate Campus",
      re_enrolled: 90,
      eligible: 100,
      retention_rate: 90.0,
    },
    {
      nationality: "Kenyan",
      campus: "buwaate",
      campus_display: "Buwaate Campus",
      re_enrolled: 200,
      eligible: 230,
      retention_rate: 86.7,
    },
    {
      nationality: "Other Nationalities",
      campus: "buwaate",
      campus_display: "Buwaate Campus",
      re_enrolled: 160,
      eligible: 183,
      retention_rate: 87.4,
    },
  ],
  withdrawals_total: 124,
  withdrawal_reasons: [
    {
      reason: "financial_hardship",
      label: "Financial Constraints",
      count: 44,
      share: 35.5,
    },
    {
      reason: "relocated",
      label: "Transfer to Another School",
      count: 34,
      share: 27.4,
    },
    {
      reason: "deceased",
      label: "Death",
      count: 23,
      share: 18.5,
    },
    {
      reason: "academic",
      label: "Academic Performance",
      count: 23,
      share: 18.5,
    },
  ],
} as RetentionDashboardData;

beforeEach(() => {
  vi.mocked(fetchStudentRetention).mockResolvedValue(mockRetentionData);
  vi.mocked(api.get).mockImplementation(async (url) => {
    if (url === "/academics/schools/") {
      return { data: mockSchools };
    }

    if (url === "/academics/terms/") {
      return { data: [] };
    }

    throw new Error(`Unexpected API endpoint: ${url}`);
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const renderDashboard = async () => {
  render(<StudentRetention />);

  await waitFor(() => {
    expect(fetchStudentRetention).toHaveBeenCalledTimes(1);
  });

  expect(
    await screen.findByText("Total Re-enrolled Students"),
  ).toBeInTheDocument();
};

const chooseCampus = async (from: string, to: string) => {
  const campusSelect = screen.getByRole("combobox", {
    name: "Campus",
  });

  expect(campusSelect).toHaveValue(from);

  fireEvent.change(campusSelect, {
    target: { value: to },
  });

  await waitFor(() => {
    expect(campusSelect).toHaveValue(to);
  });
};

describe("StudentRetention API", () => {
  it("fetches retention data when the dashboard loads", async () => {
    await renderDashboard();

    expect(fetchStudentRetention).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByText("Total Re-enrolled Students"),
    ).toBeInTheDocument();
    expect(await screen.findByText("1,200")).toBeInTheDocument();
    expect(await screen.findByText("88.5%")).toBeInTheDocument();
    expect(await screen.findByText("150")).toBeInTheDocument();
  });

  it("displays an error when the API request fails", async () => {
    vi.mocked(fetchStudentRetention).mockRejectedValueOnce(
      new Error("Request failed"),
    );

    render(<StudentRetention />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to load retention data: Request failed",
    );
  });
});

describe("StudentRetention", () => {
  it("shows the shared campus filter", async () => {
    await renderDashboard();

    expect(
      screen.getByRole("combobox", { name: "Campus" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "All Campuses" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Kibuli Main" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("option", { name: "Buwaate" })).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Greenhill International (GIS)",
      }),
    ).toBeInTheDocument();
  });

  it("renders the three headline cards from the API response", async () => {
    await renderDashboard();

    const cards = screen.getAllByRole("article");

    expect(cards).toHaveLength(4);

    const expected: Array<[string, string]> = [
      ["Total Re-enrolled Students", "1,200"],
      ["Re-enrollment Rate", "88.5%"],
      ["At-Risk Retention", "150"],
    ];

    expected.forEach(([label, value], index) => {
      expect(within(cards[index]).getByText(label)).toBeInTheDocument();
      expect(within(cards[index]).getByText(value)).toBeInTheDocument();
    });
  });

  it("shows the entrants and retention trend instead of nationality rows", async () => {
    await renderDashboard();

    expect(
      screen.getByRole("heading", { name: "New entrants vs retained" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: /new entrants and continuing learners/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: /new entrants and continuing learners/i,
      }),
    ).not.toHaveAttribute("preserveAspectRatio", "none");
    expect(
      screen
        .getByRole("heading", { name: "New entrants vs retained" })
        .closest("article"),
    ).toHaveTextContent(/\d+ new and [\d,]+ continuing in Term .*retained/);
    expect(
      screen.queryByText("Student Retention by Nationality"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Ugandan")).not.toBeInTheDocument();
  });

  it("shows the reasons for withdrawal card", async () => {
    await renderDashboard();

    const heading = screen.getByRole("heading", {
      name: "Reasons for Withdrawal",
    });

    const card = heading.closest("section");

    expect(card).not.toBeNull();

    const withdrawalCard = card as HTMLElement;

    expect(
      within(withdrawalCard).getByRole("img", {
        name: "Student withdrawals by reason",
      }),
    ).toBeInTheDocument();

    expect(within(withdrawalCard).getByText("124")).toBeInTheDocument();

    expect(
      within(withdrawalCard).getByText("Total Withdrawals"),
    ).toBeInTheDocument();

    expect(
      within(withdrawalCard).getByText("Financial Constraints"),
    ).toBeInTheDocument();

    expect(
      within(withdrawalCard).getByText("Transfer to Another School"),
    ).toBeInTheDocument();

    expect(within(withdrawalCard).getByText("Death")).toBeInTheDocument();

    expect(
      within(withdrawalCard).getByText("Academic Performance"),
    ).toBeInTheDocument();
  });

  it("updates the retention metrics when a campus is selected", async () => {
    await renderDashboard();

    await chooseCampus("All Campuses", "Buwaate Campus");

    const cards = screen.getAllByRole("article");

    expect(within(cards[0]).getByText("450")).toBeInTheDocument();
    expect(within(cards[1]).getByText("87.7%")).toBeInTheDocument();
    expect(within(cards[2]).getByText("150")).toBeInTheDocument();

    expect(screen.queryByText("Ugandan")).not.toBeInTheDocument();

    expect(screen.getByRole("combobox", { name: "Campus" })).toHaveValue(
      "Buwaate Campus",
    );
  });

  it("explains when a campus has no retention records", async () => {
    await renderDashboard();
    await chooseCampus("All Campuses", "Annex / Preschool Branch");

    expect(
      screen.getByText("No retention records match the selected filters."),
    ).toBeInTheDocument();

    /* No rows for the campus means the total is unknown, so it is dashed. */
    expect(
      within(screen.getAllByRole("article")[0]).getByText("—"),
    ).toBeInTheDocument();
  });
});
