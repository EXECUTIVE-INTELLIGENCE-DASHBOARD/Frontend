import { academicYearOptions, campusOptions } from "../../lib/organisation";

import type {
  AttentionRow,
  CapacityRow,
  CohortRow,
  ComparisonStat,
  EnrollmentSeries,
  FilterControl,
  SummaryMetric,
} from "./studentEnrollment.types";

export const filterControls: FilterControl[] = [
  {
    id: "academic-year",
    label: "Select Academic Year",
    value: academicYearOptions[0],
    options: academicYearOptions,
  },
  {
    id: "campus",
    label: "Select Campus",
    value: campusOptions[0],
    options: campusOptions,
  },
];

export const summaryMetrics: SummaryMetric[] = [
  {
    id: "enrollment",
    label: "Current Enrollment",
    value: "3,420",
    caption: "3,500 total capacity",
    tone: "blue",
  },
  {
    id: "capacity",
    label: "Capacity Used",
    value: "97.7%",
    caption: "80 places available · derived",
    tone: "amber",
  },
  {
    id: "change",
    label: "Net Period Change",
    value: "+120",
    caption: "+3.6% vs term 3 last year · illustrative",
    tone: "green",
  },
];

export const prototypeNote =
  "Prototype: enrolled 3,420 / 3,500 capacity from the seating guideline. " +
  "All other figures, comparisons and actions are illustrative.";

export const trendTerms = ["Term 1", "Term 2", "Term 3"];

export const trendPeriodLabel = "Term 3";

export const enrollmentSeries: EnrollmentSeries[] = [
  {
    id: "ay-2025",
    label: "AY 2025/2026",
    tone: "current",
    values: [3190, 3160, 3420],
  },
  {
    id: "ay-2024",
    label: "AY 2024/2025",
    tone: "previous",
    values: [3040, 3020, 3300],
  },
];

export const trendCaptionLead = "Term 3 3,420 vs 3,300 last year";

export const trendCaptionHighlight = "+3.6%";

export const trendCaptionTail =
  "Year-on-year comparison is illustrative.";

export const comparisonStats: ComparisonStat[] = [
  {
    id: "total",
    label: "Total Enrolment",
    value: "3,420 students",
  },
  {
    id: "new-students",
    label: "New Students",
    value: "1,840 students",
    note: "53.8% of enrolment",
  },
];

export const cohortRows: CohortRow[] = [
  {
    id: "new",
    group: "New students",
    sciences: "1,000",
    arts: "840",
    total: "1,840",
  },
  {
    id: "continuing",
    group: "Continuing",
    sciences: "840",
    arts: "740",
    total: "1,580",
  },
  {
    id: "all",
    group: "All students",
    sciences: "1,840",
    arts: "1,580",
    total: "3,420",
  },
];

export const cohortNote =
  "Movement: 1,840 new students + 1,580 continuing = 3,420 enrolled.";

export const capacityNote =
  "80 places remain — allocate and resource against planning options, not signed seats.";

export const capacityRows: CapacityRow[] = [
  {
    id: "sciences",
    group: "Sciences",
    enrolled: "1,840",
    capacity: "1,880",
    placesLeft: "40",
    utilization: "97.9%",
    owner: "Review lab allocation and equipment access · Science lead",
  },
  {
    id: "arts",
    group: "Arts",
    enrolled: "1,580",
    capacity: "1,620",
    placesLeft: "40",
    utilization: "97.5%",
    owner: "Assess an additional teaching space · Academic office",
  },
  {
    id: "all",
    group: "Total",
    enrolled: "3,420",
    capacity: "3,500",
    placesLeft: "80",
    utilization: "97.7%",
    owner: "Validate room and teacher availability before new intake",
  },
];

export const attentionNote =
  "Descriptive early signals; validate before committing staffing or capacity.";

export const attentionRows: AttentionRow[] = [
  {
    id: "arts-intake",
    area: "Arts intake",
    change: "30 places requested; 6 in the same enrolment scenario",
    followUp: "Check additional classroom availability",
    owner: "Academic office",
    status: "Closing",
    tone: "closing",
  },
  {
    id: "science-growth",
    area: "Science growth",
    change: "+50 since last year; largest group increase",
    followUp: "Map lab timetable and teaching loads",
    owner: "Science lead",
    status: "Planning",
    tone: "planning",
  },
  {
    id: "applied-arts",
    area: "Applied arts",
    change: "20 seats vs 20 in Sciences; same intake window",
    followUp: "Review resources and context set-up",
    owner: "Admissions lead",
    status: "Planning",
    tone: "planning",
  },
  {
    id: "next-intake",
    area: "Next intake",
    change: "Demand shown may exceed remaining capacity",
    followUp: "Briefing forecast after admissions review",
    owner: "Registrar",
    status: "Monitor",
    tone: "monitor",
  },
];

export const attentionFootnote =
  "Signals are descriptive and illustrative; they are not approved changes.";
