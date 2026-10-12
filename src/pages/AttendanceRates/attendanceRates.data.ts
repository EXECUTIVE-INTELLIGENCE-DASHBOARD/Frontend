import { academicYearOptions, campusOptions } from "../../lib/organisation";

import type {
  ClassComparisonRow,
  FilterControl,
  GroupSeries,
  InterventionRow,
  SummaryMetric,
  TrendSeries,
} from "./attendanceRates.types";

export const prototypeNote =
  "Prototype view: figures are sample data until the attendance API is connected.";

export const filterControls: FilterControl[] = [
  {
    id: "academic-year",
    label: "Select Academic Year",
    options: academicYearOptions,
  },
  {
    id: "campus",
    label: "Select Campus",
    options: campusOptions,
  },
];

export const termOptions = ["All Terms", "Term 1", "Term 2", "Term 3"];

export const summaryMetrics: SummaryMetric[] = [
  {
    id: "rate",
    label: "Attendance Rate",
    value: "96.5%",
    caption: "Tracking attendance rate",
    tone: "green",
  },
  {
    id: "followup",
    label: "Learners to Follow Up",
    value: "24",
    caption: "Learners requiring additional support",
    tone: "amber",
  },
  {
    id: "declining",
    label: "Declining Classes",
    value: "3",
    caption: "Classes with falling attendance",
    tone: "red",
  },
];

export const trendWeeks = [
  "Week 1",
  "Week 2",
  "Week 3",
  "Week 4",
  "Week 5",
  "Week 6",
  "Week 7",
  "Week 8",
];

export const trendSeries: TrendSeries[] = [
  {
    id: "rate",
    label: "Attendance rate",
    tone: "primary",
    values: [62, 68, 58, 72, 66, 78, 71, 82],
  },
  {
    id: "target",
    label: "Target",
    tone: "target",
    values: [48, 55, 61, 58, 64, 69, 74, 70],
  },
  {
    id: "previous",
    label: "Previous year",
    tone: "previous",
    values: [71, 66, 74, 69, 80, 76, 84, 79],
  },
];

export const groupLabels = [
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
];

export const groupSeries: GroupSeries[] = [
  {
    id: "present",
    label: "Present",
    tone: "present",
    values: [96, 94, 97, 92, 95],
  },
  {
    id: "late",
    label: "Late",
    tone: "late",
    values: [91, 89, 93, 95, 90],
  },
  {
    id: "absent",
    label: "Absent",
    tone: "absent",
    values: [88, 92, 90, 87, 93],
  },
];

export const classComparison: ClassComparisonRow[] = [
  { id: "9a", kind: "Class", name: "9A", term1: 95.4, term2: 96.1, term3: 96.7, change: 1.3, flag: "Effective", tone: "green" },
  { id: "9b", kind: "Class", name: "9B", term1: 93.8, term2: 94.2, term3: 93.5, change: -0.7, flag: "Decreasing", tone: "red" },
  { id: "g10", kind: "Grade", name: "Grade 10", term1: 95.2, term2: 95.8, term3: 96.4, change: 1.2, flag: "Effective", tone: "green" },
  { id: "11a", kind: "Class", name: "11A", term1: 92.1, term2: 92.8, term3: 91.6, change: -1.2, flag: "Declining", tone: "red" },
  { id: "11b", kind: "Class", name: "11B", term1: 94.0, term2: 93.5, term3: 93.9, change: -0.1, flag: "Stable", tone: "slate" },
  { id: "boarders", kind: "Group", name: "Boarders", term1: 97.1, term2: 96.8, term3: 97.4, change: 0.6, flag: "Effective", tone: "green" },
  { id: "day", kind: "Group", name: "Day Scholars", term1: 95.6, term2: 96.2, term3: 96.9, change: 1.3, flag: "Trending up", tone: "blue" },
];

export const interventionQueue: InterventionRow[] = [
  {
    id: "11a",
    band: "Class 11A",
    bandMeta: "Grade 11",
    signal: "3 learners",
    signalMeta: "92.1% attendance",
    action: "Increase attendance support for cohort",
    owner: "Class Teacher",
    ownerMeta: "S. Whitfield",
    due: "04 Sep 2026",
    status: "In progress",
    tone: "amber",
  },
  {
    id: "9b",
    band: "Class 9B",
    bandMeta: "Grade 9",
    signal: "2 learners",
    signalMeta: "93.5% attendance",
    action: "Parent meeting scheduled",
    owner: "Head of Year",
    ownerMeta: "M. Hussain",
    due: "05 Sep 2026",
    status: "Not started",
    tone: "slate",
  },
  {
    id: "g10",
    band: "Grade 10",
    bandMeta: "Whole year",
    signal: "5 learners",
    signalMeta: "Below 90% attendance",
    action: "Review feedback and intervention plan",
    owner: "Deputy Head",
    ownerMeta: "A. Bennett",
    due: "06 Sep 2026",
    status: "Overdue",
    tone: "red",
  },
  {
    id: "11b",
    band: "Class 11B",
    bandMeta: "Grade 11",
    signal: "1 learner",
    signalMeta: "93.9% attendance",
    action: "Weekly attendance review",
    owner: "Class Teacher",
    ownerMeta: "R. Okoro",
    due: "08 Sep 2026",
    status: "In progress",
    tone: "amber",
  },
];
