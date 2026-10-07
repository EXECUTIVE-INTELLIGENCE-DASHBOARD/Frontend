import type {
  FilterControl,
  GraduationRow,
  PathwayComparison,
  RetentionGroupRow,
  RiskIndicator,
  SubjectSignalRow,
  SummaryMetric,
  SupportRosterRow,
  TrendPoint,
} from "./academicPerformance.types";

export const filterControls: FilterControl[] = [
  {
    id: "academic-year",
    label: "Select Academic Year",
    value: "AY 2025/2026",
  },
  {
    id: "campus",
    label: "Select Campus",
    value: "All Campuses",
  },
];

export const summaryMetrics: SummaryMetric[] = [
  {
    id: "pass-rate",
    label: "Academic Pass Rate",
    value: "88.5%",
    caption: "Existing academic prototype",
    tone: "blue",
  },
  {
    id: "retention",
    label: "Student Retention",
    value: "96.2%",
    caption: "Existing academic prototype",
    tone: "green",
  },
  {
    id: "completion",
    label: "Completion Rate",
    value: "92.0%",
    caption: "400 eligible · illustrative",
    tone: "amber",
    highlight: true,
  },
];

export const prototypeNote =
  "Prototype data: pass rate 88.5%, retention 96.2%, Science 82.4% / Maths " +
  "91.2% / English 87.6% / ICT 89.4% / AP 76.8% / 1,236 learners flagged. " +
  "All other figures, comparisons and actions are illustrative.";

export const resultsTrend: TrendPoint[] = [
  { id: "aug", label: "Aug", classAverage: 79.6, schoolAverage: 80.4 },
  { id: "sep", label: "Sep", classAverage: 81.2, schoolAverage: 80.9 },
  { id: "oct", label: "Oct", classAverage: 83.0, schoolAverage: 81.4 },
  { id: "nov", label: "Nov", classAverage: 84.3, schoolAverage: 82.1 },
  { id: "feb", label: "Feb", classAverage: 86.1, schoolAverage: 83.2 },
  { id: "mar", label: "Mar", classAverage: 88.5, schoolAverage: 84.6 },
];

export const subjectSignals: SubjectSignalRow[] = [
  { id: "science", subject: "Science", term2: 81.3, term3: 83.4, signal: "strong" },
  { id: "maths", subject: "Maths", term2: 81.2, term3: 84.1, signal: "strong" },
  { id: "english", subject: "English", term2: 76.1, term3: 77.2, signal: "steady" },
  { id: "history", subject: "History", term2: 78.4, term3: 79.0, signal: "steady" },
  { id: "geography", subject: "Geography", term2: 72.1, term3: 72.4, signal: "steady" },
  { id: "chemistry", subject: "Chemistry", term2: 80.1, term3: 79.1, signal: "watch" },
  { id: "mathematics", subject: "Mathematics", term2: 90.0, term3: 78.6, signal: "watch" },
];

export const subjectSignalsNote =
  "Priority flagged: numeracy and Chemistry practical. Focused tutorial " +
  "support recommended for both cohorts.";

export const pathwayComparisons: PathwayComparison[] = [
  {
    id: "sciences",
    pathway: "Sciences",
    detail: "Science, Chemistry, Physics, Biology, Mathematics",
    value: 82.4,
    tone: "blue",
  },
  {
    id: "arts",
    pathway: "Arts",
    detail: "English, HSIE, Creative Arts, Languages",
    value: 91.2,
    tone: "navy",
  },
];

export const pathwayNote =
  "Arts pass rate sits 8.8 pp higher. Priority: reading support and numeracy " +
  "intervention for the Sciences cohort.";

export const riskIndicators: RiskIndicator[] = [
  {
    id: "academic",
    label: "Academic risk",
    learners: 30,
    percent: "1.8%",
    bands: [
      { id: "severe", label: "Severe", value: 12, tone: "severe" },
      { id: "moderate", label: "Moderate", value: 11, tone: "moderate" },
      { id: "watch", label: "Watch", value: 7, tone: "watch" },
    ],
  },
  {
    id: "retention",
    label: "Retention risk",
    learners: 89,
    percent: "5.2%",
    bands: [
      { id: "severe", label: "Severe", value: 24, tone: "severe" },
      { id: "moderate", label: "Moderate", value: 38, tone: "moderate" },
      { id: "watch", label: "Watch", value: 27, tone: "watch" },
    ],
  },
];

export const riskNote =
  "Attendance signals flag two learners per Academic Performance cycle. " +
  "Numbers are illustrative and derived from the current cohort evaluation.";

export const retentionGroups: RetentionGroupRow[] = [
  { id: "sciences", group: "Sciences", term2: 90.7, term3: 96.6 },
  { id: "arts", group: "Arts", term2: 90.5, term3: 90.1 },
  { id: "primary", group: "Primary", term2: 97.2, term3: 98.0 },
  { id: "junior", group: "Junior", term2: 95.4, term3: 96.4 },
  { id: "senior", group: "Senior", term2: 92.1, term3: 93.1 },
];

export const graduationRows: GraduationRow[] = [
  {
    id: "y12-2025",
    cohort: "Year 12 · 2025",
    completed: "328 / 400",
    eligible: "362 / 400",
    term2: 86.9,
    term3: 90.9,
  },
  {
    id: "y12-2024",
    cohort: "Year 12 · 2024",
    completed: "312 / 400",
    eligible: "351 / 392",
    term2: 84.5,
    term3: 88.2,
  },
  {
    id: "y12-2023",
    cohort: "Year 12 · 2023",
    completed: "296 / 384",
    eligible: "338 / 384",
    term2: 83.1,
    term3: 87.4,
  },
  {
    id: "y11-2025",
    cohort: "Year 11 · 2025",
    completed: "402 / 430",
    eligible: "418 / 430",
    term2: 88.0,
    term3: 92.0,
  },
];

export const supportRoster: SupportRosterRow[] = [
  {
    id: "ava-r",
    learner: "Ava R.",
    cohort: "10/A · Sciences",
    signal: "Maths 62%, attendance 91.2%",
    route: "Academic",
    support: "Numeracy tutoring + weekly check-in",
    owner: "M. Okoro · 03 Aug",
    status: "Scheduled",
    statusTone: "scheduled",
  },
  {
    id: "patel-h",
    learner: "Patel, H.",
    cohort: "11/C · Arts",
    signal: "Missed assessments, coursework late",
    route: "Academic",
    support: "Assessment recovery + catch-up sessions",
    owner: "L. Bennett · 04 Aug",
    status: "Coaching",
    statusTone: "coaching",
  },
  {
    id: "lopez-ma",
    learner: "M. A. Lopez",
    cohort: "10 · Sciences",
    signal: "Practical exam 58%, two missed labs",
    route: "Academic",
    support: "Science lab tutorials",
    owner: "S. Devi · 04 Aug",
    status: "In progress",
    statusTone: "progress",
  },
  {
    id: "joel-s",
    learner: "Joel S.",
    cohort: "8/E · Arts",
    signal: "Literacy below benchmark, 28 days support",
    route: "Academic",
    support: "Weekly reading mentoring",
    owner: "C. Doe · 07 Aug",
    status: "Review due",
    statusTone: "review",
  },
];
