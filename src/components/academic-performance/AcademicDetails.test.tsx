import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import api from "../../api/axios";
import type { AcademicFilterValues } from "../filters/academicFilters.types";
import { AcademicDetails } from "./AcademicDetails";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const currentYear = new Date().getFullYear();

const syllabusRecords = [
  ...[
    "Mathematics",
    "English Language",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Literature",
  ].map((subject, index) => ({
    id: index + 1,
    subject_name: subject,
    class_level: "S3",
    topics_planned: 100,
    topics_covered: 88,
    school: 1,
    term: 1,
  })),
  ...["Mathematics", "English Language", "Physics", "Chemistry", "Biology"].map(
    (subject, index) => ({
      id: index + 8,
      subject_name: subject,
      class_level: "S5",
      topics_planned: 100,
      topics_covered: 84,
      school: 1,
      term: 1,
    }),
  ),
];

const nationalExamRecords = [
  {
    id: 1,
    exam_display: "UCE",
    division_display: "Division 1",
    exam: "uce",
    year: currentYear,
    division: "1",
    aggregate: 8,
    principal_passes: null,
    passed: true,
    student: 1,
    school: 1,
  },
  {
    id: 2,
    exam_display: "UACE",
    division_display: "Principal passes",
    exam: "uace",
    year: currentYear,
    division: "1",
    aggregate: null,
    principal_passes: 3,
    passed: true,
    student: 2,
    school: 1,
  },
];

function renderAcademicDetails(filters: Partial<AcademicFilterValues> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchInterval: false,
        refetchOnWindowFocus: false,
        gcTime: 0,
      },
    },
  });

  const completeFilters: AcademicFilterValues = {
    school: "",
    campus: "",
    section: "",
    term: "",
    year: String(currentYear),
    ...filters,
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <AcademicDetails filters={completeFilters} />
    </QueryClientProvider>,
  );
}

function getCard(headingName: string): HTMLElement {
  const heading = screen.getByRole("heading", {
    name: headingName,
  });
  const card = heading.closest("article");

  if (!card) {
    throw new Error(`Could not find card: ${headingName}`);
  }

  return card;
}

describe("AcademicDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url === "/academics/syllabus-coverage/") {
        return { data: syllabusRecords };
      }

      if (url === "/academics/national-exam-results/") {
        return { data: nationalExamRecords };
      }

      return { data: [] };
    });
  });

  it("renders the academic details section", () => {
    renderAcademicDetails();

    expect(
      screen.getByRole("region", {
        name: "Subject comparison and national examination results",
      }),
    ).toBeInTheDocument();
  });

  it("renders both detail cards", async () => {
    renderAcademicDetails();

    expect(
      await screen.findByRole("heading", {
        name: "Subject Comparison",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "National Examinations",
      }),
    ).toBeInTheDocument();
  });

  it("renders the subject comparison table headings", async () => {
    renderAcademicDetails();

    const subjectHeader = await screen.findByRole("columnheader", {
      name: "Subject",
    });

    const card = subjectHeader.closest("article");
    expect(card).not.toBeNull();

    const comparison = within(card as HTMLElement);

    expect(
      comparison.getByRole("columnheader", { name: "Level" }),
    ).toBeInTheDocument();

    expect(
      comparison.getByRole("columnheader", {
        name: "Syllabus coverage",
      }),
    ).toBeInTheDocument();
  });

  it("renders grouped subject rows from the API", async () => {
    renderAcademicDetails();

    await screen.findByRole("columnheader", { name: "Subject" });

    const card = getCard("Subject Comparison");
    const rows = card.querySelectorAll(".acad-details__subject-row");

    expect(rows).toHaveLength(4);
    expect(within(card).getAllByText("SCIENCES")).toHaveLength(2);
    expect(within(card).getAllByText("ARTS")).toHaveLength(2);
  });

  it("displays the calculated syllabus coverage percentages", async () => {
    renderAcademicDetails();

    await screen.findByRole("columnheader", { name: "Subject" });

    const card = getCard("Subject Comparison");

    expect(within(card).getAllByText("88.0%")).toHaveLength(2);
    expect(within(card).getAllByText("84.0%")).toHaveLength(2);
  });

  it("does not render the old subject category filter", async () => {
    renderAcademicDetails();

    await screen.findByRole("columnheader", { name: "Subject" });

    const card = getCard("Subject Comparison");

    expect(
      within(card).queryByRole("combobox", {
        name: "Subject category",
      }),
    ).not.toBeInTheDocument();
  });

  it("filters subjects to O Level when selected", async () => {
    const user = userEvent.setup();

    renderAcademicDetails({
      school: "1",
      section: "Secondary",
    });

    const levelSelect = await screen.findByRole("combobox", {
      name: "Academic level",
    });

    await screen.findByRole("columnheader", { name: "Subject" });

    await user.selectOptions(levelSelect, "O Level");

    const card = getCard("Subject Comparison");
    const rows = card.querySelectorAll(".acad-details__subject-row");

    expect(rows).toHaveLength(2);

    rows.forEach((row) => {
      expect(row).toHaveTextContent("O Level");
      expect(row).not.toHaveTextContent("A Level");
    });
  });

  it("filters subjects to A Level when selected", async () => {
    const user = userEvent.setup();

    renderAcademicDetails({
      school: "1",
      section: "Secondary",
    });

    const levelSelect = await screen.findByRole("combobox", {
      name: "Academic level",
    });

    await screen.findByRole("columnheader", { name: "Subject" });

    await user.selectOptions(levelSelect, "A Level");

    const card = getCard("Subject Comparison");
    const rows = card.querySelectorAll(".acad-details__subject-row");

    expect(rows).toHaveLength(2);

    rows.forEach((row) => {
      expect(row).toHaveTextContent("A Level");
    });
  });

  it("renders national examination results from the API", async () => {
    renderAcademicDetails();

    expect(await screen.findByText("UCE")).toBeInTheDocument();
    expect(screen.getByText("Division 1")).toBeInTheDocument();
    expect(screen.getByText("UACE")).toBeInTheDocument();
    expect(screen.getByText("3 principal passes")).toBeInTheDocument();
  });
it("displays examination candidate, pass and pass-rate summaries", async () => {
  renderAcademicDetails();

  const candidates = await screen.findAllByText("Candidates");
  const card = candidates[0].closest("article");

  expect(card).not.toBeNull();

  const summaryElement = (card as HTMLElement).querySelector(
    ".acad-details__exam-summary",
  );

  expect(summaryElement).not.toBeNull();

  const summary = within(summaryElement as HTMLElement);

  expect(summary.getByText("Candidates")).toBeInTheDocument();
  expect(summary.getByText("Passed")).toBeInTheDocument();
  expect(summary.getByText("Pass rate")).toBeInTheDocument();

  // Both summary metrics should show 2.
  expect(summary.getAllByText("2")).toHaveLength(2);

  expect(summary.getByText("100.0%")).toBeInTheDocument();
});
 

  it("shows UACE results when A Level is selected", async () => {
    const user = userEvent.setup();

    renderAcademicDetails({
      school: "1",
      section: "Secondary",
    });

    const levelSelect = await screen.findByRole("combobox", {
      name: "Academic level",
    });

    await user.selectOptions(levelSelect, "A Level");

    expect(screen.getByText("UACE results")).toBeInTheDocument();
    expect(await screen.findByText("UACE")).toBeInTheDocument();
    expect(screen.queryByText("UCE")).not.toBeInTheDocument();
  });

  it("shows UCE results when O Level is selected", async () => {
    const user = userEvent.setup();

    renderAcademicDetails({
      school: "1",
      section: "Secondary",
    });

    const levelSelect = await screen.findByRole("combobox", {
      name: "Academic level",
    });

    await user.selectOptions(levelSelect, "O Level");

    expect(screen.getByText("UCE results")).toBeInTheDocument();
    expect(await screen.findByText("UCE")).toBeInTheDocument();
    expect(screen.queryByText("UACE")).not.toBeInTheDocument();
  });

  it("shows the nursery-specific examination message", () => {
    renderAcademicDetails({
      school: "1",
      section: "Nursery",
    });

    expect(
      screen.getByText(
        "National examination results are not applicable to nursery schools.",
      ),
    ).toBeInTheDocument();
  });
});
