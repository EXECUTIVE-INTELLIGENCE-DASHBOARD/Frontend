import { academicYearOptions, campusOptions } from "../../lib/organisation";

import type {
  AcquisitionCallout,
  ConditionRow,
  FilterControl,
  InventoryRow,
  SchoolActivityRow,
  SummaryMetric,
  TitleRow,
  VolumeSeries,
} from "./libraryResourceUsage.types";

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
    id: "checkouts",
    label: "Checkouts",
    value: "1,240",
    caption: "Term 3 · +12.7% vs Term 2",
    tone: "blue",
  },
  {
    id: "returns",
    label: "Returns",
    value: "1,180",
    caption: "Term 3 · +9.3% vs Term 2",
    tone: "green",
  },
  {
    id: "available",
    label: "Available",
    value: "6,200",
    caption: "76.0% of 8,160 library items",
    tone: "blue",
  },
  {
    id: "overdue",
    label: "Overdue Items",
    value: "64",
    caption: "40 aged 1–7 days · oldest 14 days",
    tone: "amber",
  },
];

export const prototypeNote =
  "Illustrative — access, returns, comparisons and planned actions are " +
  "illustrative; not confirmed school reporting.";

/* ---------------------------------------------------- Checkout & return trend */

export const volumeMonths = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];

export const volumePeriodLabel = "Term 3";

export const volumeSeries: VolumeSeries[] = [
  {
    id: "checkouts",
    label: "Checkouts",
    tone: "checkouts",
    values: [350, 370, 380, 400, 410, 430],
  },
  {
    id: "returns",
    label: "Returns",
    tone: "returns",
    values: [345, 355, 380, 380, 395, 405],
  },
];

export const volumeCaptionLead = "Term 3 checkouts 1,240 vs 1,180 returns";

export const volumeCaptionHighlight = "+12.7%";

export const volumeCaptionTail = "on checkouts versus Term 2 · illustrative.";

/* ----------------------------------------------------- Activity by school */

export const schoolActivityNote = "Net = checkouts − returns across Term 3.";

export const schoolActivityRows: SchoolActivityRow[] = [
  {
    id: "school-a",
    school: "Sample school A",
    checkouts: "740",
    returns: "732",
    net: "+8",
  },
  {
    id: "school-b",
    school: "Sample school B",
    checkouts: "500",
    returns: "448",
    net: "+52",
  },
  {
    id: "total",
    school: "Total",
    checkouts: "1,240",
    returns: "1,180",
    net: "+60",
  },
];

export const schoolActivityFootnote =
  "Totals cover Term 3 and exclude digital-only loans.";

/* ------------------------------------------------------- Availability */

export const inventoryNote = "Stock position at the end of Term 3.";

export const inventoryRows: InventoryRow[] = [
  {
    id: "science",
    category: "Science & media",
    available: "1,820",
    borrowed: "620",
    reserved: "100",
    unavailable: "40",
  },
  {
    id: "reference",
    category: "Reference",
    available: "1,860",
    borrowed: "100",
    reserved: "60",
    unavailable: "30",
  },
  {
    id: "fiction",
    category: "Fiction",
    available: "1,040",
    borrowed: "400",
    reserved: "20",
    unavailable: "20",
  },
  {
    id: "art",
    category: "Art & textbooks",
    available: "1,030",
    borrowed: "200",
    reserved: "40",
    unavailable: "10",
  },
  {
    id: "digital",
    category: "Digital titles",
    available: "450",
    borrowed: "300",
    reserved: "0",
    unavailable: "20",
  },
  {
    id: "total",
    category: "Total",
    available: "6,200",
    borrowed: "1,620",
    reserved: "220",
    unavailable: "120",
  },
];

export const inventoryFootnote =
  "Available 6,200 of 8,160 items = 76.0%. Borrowed covers items on loan at " +
  "the end of Term 3.";

/* ------------------------------------------------------- Overdue & damage */

export const conditionNote = "64 overdue items, split by how long they are out.";

export const conditionRows: ConditionRow[] = [
  {
    id: "1-7-days",
    condition: "1–7 days",
    items: "40",
    action: "Email reminder to borrower · Library desk",
    status: "Overdue",
    tone: "overdue",
  },
  {
    id: "8-14-days",
    condition: "8–14 days",
    items: "24",
    action: "Written notice and phone call · Library desk",
    status: "Overdue",
    tone: "overdue",
  },
  {
    id: "15-30-days",
    condition: "15–30 days",
    items: "0",
    action: "No action required at this stage",
    status: "On track",
    tone: "track",
  },
  {
    id: "over-30-days",
    condition: "Over 30 days",
    items: "0",
    action: "Inventory write-off prepared",
    status: "On track",
    tone: "track",
  },
  {
    id: "lost",
    condition: "Lost",
    items: "12",
    action: "Recorded against stock · Finance",
    status: "Written off",
    tone: "written-off",
  },
  {
    id: "damaged",
    condition: "Damaged",
    items: "8",
    action: "Replacements ordered · Library desk",
    status: "Replacement",
    tone: "replacement",
  },
  {
    id: "overdue-total",
    condition: "Overdue total",
    items: "64",
    action: "Lost and damaged items sit outside the overdue total",
    tone: "total",
  },
];

export const conditionFootnote =
  "64 overdue = 40 aged 1–7 days + 24 aged 8–14 days. The 20 lost or damaged " +
  "items are written off or replaced, not chased.";

/* -------------------------------------------------- Acquisition planning */

export const acquisitionCallouts: AcquisitionCallout[] = [
  {
    id: "science",
    label: "Science titles · 14 waiting requests",
    body:
      "Use existing stock first — 5 of the 14 requests are for titles already " +
      "held at another campus.",
    tone: "amber",
  },
  {
    id: "reference",
    label: "Reference · 6 waiting requests",
    body:
      "Reallocate copies from the under-used reference set before ordering " +
      "replacements.",
    tone: "blue",
  },
  {
    id: "order",
    label: "Order planned · 5 titles",
    body:
      "Order 5 additional titles to cover the 18 outstanding requests — 2,340 " +
      "total at 11.40 per copy.",
    tone: "green",
  },
];

export const acquisitionFootnote =
  "Cost figures are illustrative and are not a confirmed order commitment.";

/* -------------------------------------------------- Title demand & signals */

export const titlesNote =
  "The five titles with the highest number of waiting requests.";

export const titleRows: TitleRow[] = [
  {
    id: "chemistry",
    title: "Practical Chemistry",
    copies: "80",
    available: "0",
    borrowedReserved: "35 / 14",
    waiting: "14",
    signal: "Over-subscribed · order more",
    tone: "order",
  },
  {
    id: "algebra",
    title: "Further Algebra",
    copies: "30",
    available: "4",
    borrowedReserved: "20 / 4",
    waiting: "8",
    signal: "Over-subscribed · order more",
    tone: "order",
  },
  {
    id: "atlas",
    title: "World Atlas",
    copies: "24",
    available: "9",
    borrowedReserved: "14 / 2",
    waiting: "3",
    signal: "Available · no order needed",
    tone: "hold",
  },
  {
    id: "casebook",
    title: "Modern History Casebook",
    copies: "18",
    available: "6",
    borrowedReserved: "7 / 2",
    waiting: "0",
    signal: "Under-used · promote or reallocate",
    tone: "promote",
  },
  {
    id: "digital",
    title: "Digital titles",
    copies: "120",
    available: "96",
    borrowedReserved: "20 / 4",
    waiting: "0",
    signal: "Subscription · no order needed",
    tone: "hold",
  },
];

export const titlesFootnote =
  "Waiting requests are unfilled loans. Signals inform the next accession round.";
