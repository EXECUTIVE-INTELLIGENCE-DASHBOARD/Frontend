import { ALL_CAMPUSES, parseDate } from "./facilities.data";
import type { FacilitiesFilters } from "./facilities.types";

export const DEFAULT_FILTERS: FacilitiesFilters = {
  campus: ALL_CAMPUSES,
  section: "",
  start: "2026-02-01",
  end: "2026-10-26",
};

export const MIN_DATE = "2026-01-01";
export const MAX_DATE = "2026-10-26";
export const TODAY = parseDate(MAX_DATE);

/* Categories that open a detail row under them in the Work Orders table. */
export const REL: Record<string, { title: string; utility?: string }> = {
  Furniture: { title: "Chairs and desks" },
  Plumbing: { title: "Water costs", utility: "Water" },
  Electrical: { title: "Electricity costs", utility: "Electricity" },
  "ICT & Networking": { title: "Internet costs", utility: "Internet" },
};