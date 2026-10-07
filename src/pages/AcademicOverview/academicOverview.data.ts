import type {
  Metric,
  RetentionSegment,
  RetentionStat,
  SubjectPerformanceRow,
  SupportRow,
} from "./academicOverview.types";

export const academicYear = "AY 2025/2026";

export const metrics: Metric[] = [
  {
    id: "enrolment",
    label: "Total Student Enrolment",
    value: "3,420",
    delta: "2.7%",
    deltaDirection: "up",
    context: "from last year",
    tone: "blue",
  },
  {
    id: "attendance",
    label: "Attendance Rate",
    value: "96.5%",
    delta: "1.2%",
    deltaDirection: "up",
    context: "from last term",
    tone: "green",
  },
  {
    id: "performance",
    label: "Academic Performance Rate",
    value: "88.5%",
    delta: "3.4%",
    deltaDirection: "up",
    context: "from last term",
    tone: "amber",
  },
];

export const subjectPerformance: SubjectPerformanceRow[] = [
  {
    id: "science",
    name: "Science",
    caption: "Total Graded",
    icon: "science",
    graded: 1340,
    average: 82.4,
    delta: 1.6,
    pass: 1120,
    fail: 100,
  },
  {
    id: "maths",
    name: "Maths",
    caption: "Total Graded",
    icon: "maths",
    graded: 1500,
    average: 91.2,
    delta: 2.4,
    pass: 1250,
    fail: 80,
  },
  {
    id: "english",
    name: "English",
    caption: "Total Graded",
    icon: "english",
    graded: 1420,
    average: 87.6,
    delta: 1.1,
    pass: 1180,
    fail: 92,
  },
  {
    id: "ict",
    name: "ICT",
    caption: "Total Graded",
    icon: "ict",
    graded: 1180,
    average: 89.4,
    delta: 0.8,
    pass: 1010,
    fail: 74,
  },
];

export const retentionOverall = 96.2;

export const retentionSegments: RetentionSegment[] = [
  { id: "primary", label: "Primary", value: 98.3, tone: "navy" },
  { id: "junior", label: "Junior", value: 96.4, tone: "blue" },
  { id: "senior", label: "Senior", value: 93.1, tone: "sky" },
];

export const retentionStats: RetentionStat[] = [
  { id: "current", label: "Current Enrolment", value: "3,420" },
  { id: "alumni", label: "Alumni since last year", value: "284" },
];

export const supportRows: SupportRow[] = [
  {
    id: "aggregated",
    group: "Aggregated Students",
    trend: "Declining Attendance & Sub-Performance",
    indicator: "1,236 Students (12.2%)",
    impact: 2.2,
    action: "Reteach Basics / Targeted Tutorials",
    actionTone: "warning",
  },
  {
    id: "grade-9",
    group: "Grade 9 Retention",
    trend: "Mid-Term GPA Drop (>15% Concern)",
    indicator: "78 Students Flagged",
    impact: 4.4,
    action: "Parent Conference & Study Plan",
    actionTone: "warning",
  },
  {
    id: "grade-11",
    group: "Grade 11 Enrolment",
    trend: "Late Subject Fail Transfers",
    indicator: "54 Students Flagged",
    impact: 3.5,
    action: "Academic Monitoring",
    actionTone: "info",
  },
  {
    id: "ap-year-10",
    group: "AP Level Year 10",
    trend: "Chronic Assignment Non-Submission",
    indicator: "118 Students Flagged",
    impact: 0.8,
    action: "Remedial Labs & Catch-Up",
    actionTone: "info",
  },
  {
    id: "primary-year-2",
    group: "Primary Year 2",
    trend: "Literacy Assessment Below Warning",
    indicator: "77 Students Flagged",
    impact: 3.5,
    action: "Reading Recovery",
    actionTone: "warning",
  },
];
