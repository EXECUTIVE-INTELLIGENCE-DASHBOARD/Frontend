import type {
  AttendanceStat,
  ChildTab,
  FilterControl,
  MissedDayRow,
  ProgressSeries,
  SubjectRow,
  SummaryMetric,
} from "./myChildProgress.types";

export const filterControls: FilterControl[] = [
  {
    id: "academic-year",
    label: "Select Academic Year",
    value: "AY 2025/2026",
  },
  {
    id: "reporting-period",
    label: "Reporting Period",
    value: "Term 3",
  },
  {
    id: "child",
    label: "Child",
    value: "Mwi R · Year 6",
  },
];

export const summaryMetrics: SummaryMetric[] = [
  {
    id: "attendance",
    label: "Child Attendance",
    value: "96.7%",
    caption: "96 of 99 school days attended",
    tone: "blue",
  },
  {
    id: "result",
    label: "Average Result",
    value: "85%",
    caption: "+4 pts since Term 1 · 5 subjects",
    tone: "green",
  },
  {
    id: "support",
    label: "Support Needs",
    value: "1",
    caption: "action open · support plan below",
    tone: "amber",
  },
];

export const prototypeNote =
  "Prototype: attendance, results and support figures are illustrative. " +
  "Nothing on this view is a confirmed school record.";

/* ------------------------------------------------------- Child identification */

export const childName = "Mwi R";

export const childInitials = "MR";

export const childMeta = "Year 6 · Sample child";

export const childNote =
  "Top 5 assessed subjects; each child's progress and next steps are " +
  "connected within this report. All figures are illustrative.";

export const childTabs: ChildTab[] = [
  { id: "academic-progress", label: "Academic progress" },
  { id: "daily-attendance", label: "Daily attendance" },
  { id: "support-plan", label: "Support plan" },
];

export const childActiveTab = "Academic progress";

/* ------------------------------------------------------- Reporting progress */

export const progressTerms = ["Term 1", "Term 2", "Term 3"];

export const progressSeries: ProgressSeries[] = [
  {
    id: "all-subjects",
    label: "All subjects",
    tone: "all",
    values: [81, 81, 85],
  },
  {
    id: "english",
    label: "English",
    tone: "subject",
    values: [78, 79, 84],
  },
];

export const progressNote =
  "Average scores per reported term. Figures are illustrative.";

export const progressHighlightLead = "English";

export const progressHighlightValue = "+6 pts";

export const progressCaptionLead = "English 78% in Term 1 to 84% in Term 3";

export const progressCaptionHighlight = "+6 pts";

export const progressCaptionTail =
  "Support was reviewed in each reporting period. Comparisons are illustrative.";

/* --------------------------------------------------- Attendance & follow-up */

export const attendanceNote =
  "Session, meeting, contact and absence figures are illustrative; " +
  "not confirmed records.";

export const attendanceStats: AttendanceStat[] = [
  {
    id: "year-to-date",
    label: "Year to date",
    value: "96.7%",
    note: "96 of 99 days",
  },
  {
    id: "days-absent",
    label: "Days absent",
    value: "3",
    note: "all notified",
  },
  {
    id: "term-3",
    label: "Term 3",
    value: "97.2%",
    note: "vs 96.4% last year",
  },
];

export const missedDaysLabel = "Missed Days";

export const missedDayRows: MissedDayRow[] = [
  {
    id: "jun-2026",
    date: "19 Jun 2026",
    reason: "Illness · 1 day",
    followUp: "Parent notified the school; work sent home",
    status: "Acknowledged",
    tone: "building",
  },
  {
    id: "mar-2026",
    date: "12 Mar 2026",
    reason: "Medical appointment · 2 days",
    followUp: "Catch-up session completed with class teacher",
    status: "Closed",
    tone: "building",
  },
];

export const missedDaysFootnote =
  "Late arrivals are not included in absent days.";

/* -------------------------------------------------- Subject results & feedback */

export const subjectNote =
  "Scores per subject across reported terms. Figures are illustrative.";

export const subjectRows: SubjectRow[] = [
  {
    id: "english",
    subject: "English",
    term1: "78%",
    term2: "79%",
    term3: "84%",
    progress: "+6 pts",
    feedback: "Clear writing and growing confidence in discussion.",
    followUp: "Building well",
    tone: "building",
  },
  {
    id: "mathematics",
    subject: "Mathematics",
    term1: "76%",
    term2: "82%",
    term3: "83%",
    progress: "+7 pts",
    feedback: "Completes homework; explain reasoning more often.",
    followUp: "Building well",
    tone: "building",
  },
  {
    id: "science",
    subject: "Science",
    term1: "84%",
    term2: "78%",
    term3: "85%",
    progress: "+1 pt",
    feedback: "Practical work is strong; revision notes need structure.",
    followUp: "Keep practising",
    tone: "practice",
  },
  {
    id: "geography",
    subject: "Geography",
    term1: "80%",
    term2: "82%",
    term3: "85%",
    progress: "+5 pts",
    feedback: "Detailed case studies and careful map work.",
    followUp: "Building well",
    tone: "building",
  },
  {
    id: "ict",
    subject: "ICT",
    term1: "88%",
    term2: "84%",
    term3: "90%",
    progress: "+2 pts",
    feedback: "Project completed with clear technical analysis.",
    followUp: "Building well",
    tone: "building",
  },
];

export const subjectSummary =
  "Average: Term 1 81% · Term 2 81% · Term 3 85% — 5 of 5 subjects improved";

/* ------------------------------------------------------- Flagged support need */

export const supportPlanLabel = "Support planned";

export const supportPlanSummary =
  "Targeted and classroom strategies reviewed for Term 3. Short, focused " +
  "reading practice with weekly check-ins.";

export const supportPlanOwner = "Additional learning";

export const supportPlanDue = "30 Oct 2026";

export const supportPlanAction = "View support plan";

export const supportPlanFootnote =
  "One open action; the review closes when the Term 3 targets are met.";

/* ------------------------------------------------------ Parent engagement */

export const engagementTitle = "Teacher contact on 19 Aug 2026";

export const engagementBody =
  "Discussed the 1:1 provision, improving attendance, and keeping support " +
  "contact and meeting notes up to date.";

export const engagementActions = ["View report", "Log a call"];

export const engagementFootnote =
  "Contacts are logged by teaching staff; illustrative only.";
