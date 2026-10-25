/**
 * Fleet & Transport domain types.
 *
 * Every field that the API may not report is nullable. The views render an em
 * dash for `null`; they never substitute a zero or a sample figure.
 */

/** Campus keys as the backend spells them (`/operations/assets/dashboard/`). */
export type CampusKey = "kibuli" | "buwaate" | "annex";

/** The filter also allows the unfiltered option. */
export type CampusSelection = CampusKey | "all";

/**
 * School-owned vs hired in.
 *
 * The asset register only lists the school's own assets and carries no
 * ownership column, so a register line cannot be labelled with either value
 * until a hired-transport record exists.
 */
export type VehicleOwnership = "owned" | "hired";

/** A vehicle line from the asset register. One row can cover several units. */
export interface FleetVehicle {
  id: number;
  /** Register line name, e.g. "67-Seater Student Transport Buses". */
  name: string;
  /** Registration plate. The register does not store one. */
  registration: string | null;
  campus: CampusKey;
  campusLabel: string;
  /** Facility the vehicles are held at, e.g. "Transport Depot". */
  depot: string;
  /** School owned or hired in. `null` until ownership is recorded. */
  ownership: VehicleOwnership | null;
  /** Availability status when the register records one, e.g. "Available". */
  availability: string | null;
  /** Number of physical vehicles this line represents. */
  units: number;
  unitValue: number | null;
  totalValue: number | null;
  /** Raw condition code, e.g. "operational". */
  condition: string;
  conditionLabel: string;
  /** ISO date the vehicles were acquired, when recorded. */
  acquiredDate: string | null;
}

export interface FleetSummary {
  /** Total physical vehicles (the sum of each line's quantity). */
  units: number;
  /** Number of register lines behind `units`. */
  lines: number;
  totalValue: number | null;
  operationalRate: number | null;
  /** Mean age in years; `null` when no line has an acquisition date. */
  averageAgeYears: number | null;
}

/* ------------------------------------------------------------------ *
 * OI-07 — mileage and availability
 * ------------------------------------------------------------------ */

export interface MileageRecord {
  id: string;
  vehicleId: number | null;
  vehicleLabel: string;
  campusLabel: string;
  /** Kilometres on the most recent recorded day. `null` when not reported. */
  dayKm: number | null;
  /** Kilometres recorded for the current month. `null` when not reported. */
  monthKm: number | null;
}

/** Fleet-wide mileage totals, summed only from records that carry a figure. */
export interface MileageSummary {
  dayKm: number | null;
  monthKm: number | null;
  /** Vehicles that reported mileage at all. */
  vehicleCount: number;
}

/* ------------------------------------------------------------------ *
 * Story 1 — disruptions, servicing and incidents
 * ------------------------------------------------------------------ */

/** Delays and breakdowns are deliberately separate record kinds. */
export type DisruptionKind = "delay" | "breakdown";

export type DisruptionStatus = "open" | "monitoring" | "resolved";

export interface DisruptionRecord {
  id: string;
  kind: DisruptionKind;
  vehicleId: number | null;
  vehicleLabel: string;
  /** ISO timestamp the disruption began. */
  startedAt: string | null;
  /** ISO timestamp it ended. `null` while it is still open. */
  endedAt: string | null;
  /**
   * Gap between `startedAt` and `endedAt` in minutes. `null` when either end of
   * the window is missing, so the view can show a dash instead of `0`.
   */
  durationMinutes: number | null;
  status: DisruptionStatus;
  /** Primary incident record this disruption rolls up to. */
  incidentRef: string | null;
  route: string | null;
}

/** Servicing and repairs share a shape; `kind` keeps them separable. */
export type ServiceKind = "service" | "repair";

export interface ServiceRecord {
  id: string;
  kind: ServiceKind;
  vehicleId: number | null;
  vehicleLabel: string;
  /** ISO date the work was carried out. */
  performedOn: string | null;
  odometerKm: number | null;
  cost: number | null;
  /** ISO date of the next service. */
  nextServiceOn: string | null;
  /**
   * Only `true` when a valid service schedule supplied `nextServiceOn`.
   * The view omits the date entirely otherwise.
   */
  nextServiceScheduled: boolean;
  notes: string | null;
}

/* ------------------------------------------------------------------ *
 * Story 2 — costs
 * ------------------------------------------------------------------ */

export type CostCategory = "fuel" | "servicing" | "repair";

export interface FleetCostRow {
  id: string;
  category: CostCategory;
  /** Vehicle the cost was matched to, or the unallocated label. */
  vehicleLabel: string;
  campusLabel: string;
  /** Amount in UGX. `null` when the record has no amount. */
  amount: number | null;
  /** Normalised period label, e.g. "Term 1 2026". */
  period: string;
  /**
   * `true` when the cost could not be matched to a vehicle or campus. These
   * are reported in their own row and never folded into a vehicle total.
   */
  unallocated: boolean;
}

export interface CostSummary {
  byCategory: Array<{ category: CostCategory; label: string; total: number | null }>;
  allocatedTotal: number | null;
  unallocatedTotal: number | null;
  allocatedCount: number;
  unallocatedCount: number;
  /** Kilometres travelled in the period, when the API reports a distance. */
  distanceKm: number | null;
  costPerKm: CostPerKmResult;
}

/** The result of the cost-per-kilometre completeness check. */
export interface CostPerKmResult {
  /** `null` whenever the completeness rules are not met. */
  value: number | null;
  /** Why the figure is withheld. `null` when `value` is present. */
  reason: string | null;
}

/** One field the backend must expose before a view can show live numbers. */
export interface ReportedFieldGap {
  /** What the view needs, in the user's language. */
  field: string;
  /** Which of the two stories it unblocks. */
  story: string;
}
