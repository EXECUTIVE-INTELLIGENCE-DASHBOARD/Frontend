import type {
  BudgetPoint,
  CapitalProject,
  IncidentPoint,
  OpenOrder,
  OverviewMetric,
  PipelineStage,
} from "./executiveOverview.types";

export const reportDate = "01 August, 2026";

export const overviewMetrics: OverviewMetric[] = [
  {
    id: "enrolment",
    label: "Total Enrolment",
    value: "2,800",
    icon: "users",
    tone: "blue",
  },
  {
    id: "attendance",
    label: "Avg. Attendance (YTD)",
    value: "94.5%",
    icon: "calendar",
    tone: "green",
  },
  {
    id: "staffing",
    label: "Staffing Health",
    value: "98% Filled",
    icon: "staff",
    tone: "amber",
  },
];

export const budgetPoints: BudgetPoint[] = [
  { id: "q1", quarter: "Q1", period: "Sep-Nov", actual: 4.5, budget: 4.8 },
  { id: "q2", quarter: "Q2", period: "Dec-Feb", actual: 9.2, budget: 9.1 },
  { id: "q3", quarter: "Q3", period: "Mar-May", actual: 13.7, budget: 13.9 },
  { id: "q4", quarter: "Q4", period: "Jun-Aug", actual: 18.4, budget: 18.3 },
];

export const budgetSummary = {
  actual: "UGX 18.4M",
  planned: "UGX 18.3M",
};

export const pipelineStages: PipelineStage[] = [
  {
    id: "applications",
    label: "Applications",
    value: "2,450",
    share: "",
    width: 100,
    tone: "navy",
  },
  {
    id: "qualified",
    label: "Qualified",
    value: "50.9%",
    share: "50.9%",
    width: 76,
    tone: "blue",
  },
  {
    id: "interviewed",
    label: "Interviewed",
    value: "18.2%",
    share: "18.2%",
    width: 56,
    tone: "sky",
  },
  {
    id: "accepted",
    label: "Accepted",
    value: "12.4%",
    share: "12.4%",
    width: 40,
    tone: "gold",
  },
];

export const pipelineLegend = [
  { id: "total", label: "Total", value: "2,450", tone: "navy" as const },
  {
    id: "qualified",
    label: "Qualified",
    value: "50.9%",
    tone: "blue" as const,
  },
  {
    id: "interviewed",
    label: "Interviewed",
    value: "18.2%",
    tone: "sky" as const,
  },
  {
    id: "accepted",
    label: "Accepted",
    value: "12.4%",
    tone: "gold" as const,
  },
];

export const incidentPoints: IncidentPoint[] = [
  { id: "jan", label: "Jan", safety: 14, disciplinary: 9 },
  { id: "feb", label: "Feb", safety: 13, disciplinary: 8 },
  { id: "mar", label: "Mar", safety: 10, disciplinary: 6 },
  { id: "apr", label: "Apr", safety: 13, disciplinary: 4 },
  { id: "may", label: "May", safety: 14, disciplinary: 9 },
  { id: "jun", label: "Jun", safety: 11, disciplinary: 7 },
  { id: "jul", label: "Jul", safety: 16, disciplinary: 12 },
  { id: "aug", label: "Aug", safety: 10, disciplinary: 3 },
  { id: "sep", label: "Sep", safety: 6, disciplinary: 2 },
  { id: "oct", label: "Oct", safety: 4, disciplinary: 1 },
  { id: "nov", label: "Nov", safety: 3, disciplinary: 2 },
  { id: "dec", label: "Dec", safety: 3, disciplinary: 1 },
];

export const resolutionRate = "96.5%";

export const openOrders: OpenOrder[] = [
  {
    id: "hwc-central",
    name: "HWC Central",
    date: "24 Jul 26",
    status: "Overdue",
    tone: "critical",
  },
  {
    id: "bead-look-wing",
    name: "Bead Look Wing",
    date: "21 Aug 26",
    status: "Overdue",
    tone: "critical",
  },
  {
    id: "cultural-fete-day",
    name: "Cultural Fete Day",
    date: "10 Aug 26",
    status: "Overdue",
    tone: "critical",
  },
  {
    id: "lab-power-grid-5",
    name: "Lab Power Grid 5",
    date: "18 Aug 26",
    status: "Overdue",
    tone: "critical",
  },
];

export const capitalProjects: CapitalProject[] = [
  {
    id: "science-block",
    name: "Science Block Extension",
    percent: 72,
    tone: "blue",
  },
  {
    id: "boarding-house",
    name: "Boarding House Phase 2",
    percent: 45,
    tone: "gold",
  },
  {
    id: "sports-turf",
    name: "Sports Complex Turf",
    percent: 28,
    tone: "amber",
  },
];
