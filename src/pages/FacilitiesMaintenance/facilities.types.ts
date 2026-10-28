export type SectionName = "" | "Nursery" | "Primary" | "Secondary";
export type OrderStatus = "Completed" | "In progress" | "Overdue";
export type Compare = "prev" | "year";


export interface FacilitiesFilters {
  /** "All Campuses" or one school. GSL is never a campus. */
  campus: string;
  section: SectionName;
  /** ISO dates, e.g. 2026-02-01 */
  start: string;
  end: string;
}

export interface WorkOrder {
  id: string;
  campus: string;
  category: string;
  location: string;
  type: "Repair" | "Replacement";
  provider: string;
  logged: number;
  due: number;
  done: boolean;
  status: OrderStatus;
}

export interface CategoryRow {
  category: string;
  logged: number;
  done: number;
  open: number;
  overdue: number;
}

export interface CleaningDay {
  date: number;
  complete: number;
  incomplete: number;
  /** No completion evidence was recorded */
  missing: number;
}

export interface FurnitureRow {
  cls: string;
  campus: string;
  learners: number;
  chairs: number;
  desks: number;
  short: number;
}

export interface UtilityRow {
  campus: string;
  utility: string;
  current: number;
  previous: number;
  /** Fractional cost change, 0.1 = +10% */
  change: number;
}
