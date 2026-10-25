/**
 * Fleet & Transport label maps, formatters and the record rules the two user
 * stories call for (duration gaps, chronological ordering, duplicate
 * protection, unallocated cost splitting and the cost-per-kilometre gate).
 *
 * Nothing here invents a figure. `DASH` is the single representation of
 * "the API does not report this".
 */
import type {
  CampusKey,
  CampusSelection,
  CostCategory,
  CostPerKmResult,
  CostSummary,
  DisruptionKind,
  DisruptionRecord,
  DisruptionStatus,
  FleetCostRow,
  FleetSummary,
  FleetVehicle,
  MileageRecord,
  MileageSummary,
  ReportedFieldGap,
  ServiceKind,
  ServiceRecord,
  VehicleOwnership,
} from "./fleetTransport.types";

/** The one character shown wherever the API reports nothing. */
export const DASH = "—";

export const reportingPeriod = "01 Feb 2026 → 17 Oct 2026";

export const allCampuses: CampusSelection = "all";

export const campusLabels: Record<CampusKey, string> = {
  kibuli: "Kibuli Main Campus",
  buwaate: "Buwaate Campus",
  annex: "Annex / Preschool Branch",
};

export const campusOptions: Array<{ value: CampusSelection; label: string }> = [
  { value: "all", label: "All Campuses" },
  { value: "kibuli", label: campusLabels.kibuli },
  { value: "buwaate", label: campusLabels.buwaate },
  { value: "annex", label: campusLabels.annex },
];

export const disruptionKindLabels: Record<DisruptionKind, string> = {
  delay: "Delay",
  breakdown: "Breakdown",
};

export const disruptionStatusLabels: Record<DisruptionStatus, string> = {
  open: "Open",
  monitoring: "Monitoring",
  resolved: "Resolved",
};

export const serviceKindLabels: Record<ServiceKind, string> = {
  service: "Scheduled service",
  repair: "Repair",
};

export const costCategoryLabels: Record<CostCategory, string> = {
  fuel: "Fuel",
  servicing: "Servicing",
  repair: "Repairs",
};

export const ownershipLabels: Record<VehicleOwnership, string> = {
  owned: "School owned",
  hired: "Hired",
};

const conditionLabels: Record<string, string> = {
  operational: "Operational",
  needs_repair: "Needs repair",
  under_repair: "Under repair",
  decommissioned: "Decommissioned",
};

/* ------------------------------------------------------------------ *
 * Formatting
 * ------------------------------------------------------------------ */

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return DASH;
  return Math.round(value).toLocaleString("en-US");
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return DASH;
  return `UGX ${Math.round(value).toLocaleString("en-US")}`;
}

/** Short form for metric cards, e.g. `UGX 980.0M`. */
export function formatCompactCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return DASH;

  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `UGX ${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `UGX ${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `UGX ${(value / 1_000).toFixed(1)}K`;

  return `UGX ${value.toLocaleString("en-US")}`;
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return DASH;
  return `${value.toFixed(1)}%`;
}

/** Distance in kilometres, or a dash when none is reported. */
export function formatKm(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return DASH;
  return `${formatNumber(value)} km`;
}

/** Any free-text status, dashed when it is blank rather than shown as an empty cell. */
export function textOrDash(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : DASH;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** `2023-08-01` → `01 Aug 2023`. Read as plain calendar text, no time zone shift. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return DASH;

  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day || month > 12) return DASH;

  return `${String(day).padStart(2, "0")} ${MONTHS[month - 1]} ${year}`;
}

/** Date plus time for disruption rows. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return DASH;

  const date = formatDate(value);
  if (date === DASH) return DASH;

  const clock = value.slice(11, 16);
  return /^\d{2}:\d{2}$/.test(clock) ? `${date} · ${clock}` : date;
}

/**
 * Duration gap. A missing end time yields a dash, never `0 min`, so an open
 * disruption is not mistaken for an instant one.
 */
export function formatDuration(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined || !Number.isFinite(minutes)) return DASH;

  const total = Math.max(0, Math.round(minutes));
  if (total < 60) return `${total} min`;

  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

/** Minutes between two ISO timestamps, or `null` when either is missing. */export function durationBetween(
  startedAt: string | null,
  endedAt: string | null,
): number | null {
  if (!startedAt || !endedAt) return null;

  const from = Date.parse(startedAt);
  const to = Date.parse(endedAt);
  if (Number.isNaN(from) || Number.isNaN(to)) return null;

  const minutes = (to - from) / 60_000;
  return minutes < 0 ? null : minutes;
}

/* ------------------------------------------------------------------ *
 * Vehicles
 * ------------------------------------------------------------------ */

/** Shapes one asset-register line into a fleet vehicle. */
export function toVehicle(row: {
  id: number;
  name: string;
  campus: string;
  campus_display?: string;
  facility_name?: string;
  quantity?: number | null;
  unit_value?: string | number | null;
  total_value?: string | number | null;
  condition?: string;
  condition_display?: string;
  acquired_date?: string | null;
}): FleetVehicle {
  const campus = (row.campus as CampusKey) ?? "kibuli";

  return {
    id: row.id,
    name: row.name,
    // The asset register has no registration-plate column.
    registration: null,
    campus,
    campusLabel: campusLabels[campus] ?? (row.campus_display ?? DASH),
    depot: row.facility_name ?? DASH,
    // The register records the school's own assets and no ownership column.
    ownership: null,
    availability: null,
    units: row.quantity ?? 1,
    unitValue: toNumber(row.unit_value),
    totalValue: toNumber(row.total_value),
    condition: row.condition ?? "unknown",
    conditionLabel:
      conditionLabels[row.condition ?? ""] ?? (row.condition_display ?? DASH),
    acquiredDate: row.acquired_date ?? null,
  };
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

/** Age of a single vehicle line in years, or `null` when it is undated. */
export function vehicleAgeYears(
  vehicle: FleetVehicle,
  asOf: Date,
): number | null {
  if (!vehicle.acquiredDate) return null;

  const acquired = Date.parse(`${vehicle.acquiredDate.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(acquired)) return null;

  return Math.max(0, asOf.getTime() - acquired) / MS_PER_YEAR;
}

/** `2.4 yrs`, or a dash when the acquisition date is missing. */
export function formatYears(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return DASH;
  return `${value.toFixed(1)} yrs`;
}

/**
 * Count a record set.
 *
 * An empty set means the API does not report these records at all, so the
 * metric shows a dash. Printing `0` would claim the fleet had no incidents,
 * which is a different and stronger statement.
 */
export function countOrDash(rows: readonly unknown[]): string {
  return rows.length === 0 ? DASH : formatNumber(rows.length);
}

/** Mean age of the dated vehicles, in years. `null` when none is dated. */
export function averageFleetAgeYears(
  vehicles: FleetVehicle[],
  asOf: Date,
): number | null {
  const ages: number[] = [];

  for (const vehicle of vehicles) {
    if (!vehicle.acquiredDate) continue;

    const acquired = Date.parse(`${vehicle.acquiredDate.slice(0, 10)}T00:00:00Z`);
    if (Number.isNaN(acquired)) continue;

    ages.push(Math.max(0, asOf.getTime() - acquired));
  }

  if (ages.length === 0) return null;

  return ages.reduce((sum, age) => sum + age, 0) / ages.length / MS_PER_YEAR;
}

/** Totals for the metric cards. Built only from fields the API really sends. */
export function summariseFleet(
  vehicles: FleetVehicle[],
  asOf: Date,
  operationalRate?: number | null,
): FleetSummary {
  const units = vehicles.reduce((sum, vehicle) => sum + vehicle.units, 0);

  const values = vehicles
    .map((vehicle) => vehicle.totalValue)
    .filter((value): value is number => value !== null);

  return {
    units,
    lines: vehicles.length,
    totalValue: values.length === 0 ? null : values.reduce((a, b) => a + b, 0),
    operationalRate:
      operationalRate === undefined || operationalRate === null
        ? null
        : operationalRate,
    averageAgeYears: averageFleetAgeYears(vehicles, asOf),
  };
}

/* ------------------------------------------------------------------ *
 * OI-07 mileage
 * ------------------------------------------------------------------ */

/**
 * Totals daily and monthly mileage.
 *
 * A missing figure stays missing: the sum is `null` rather than `0`, so an
 * unreported day does not read as a fleet that never moved.
 */
export function sumMileage(rows: MileageRecord[]): MileageSummary {
  const days = rows
    .map((row) => row.dayKm)
    .filter((km): km is number => km !== null);

  const months = rows
    .map((row) => row.monthKm)
    .filter((km): km is number => km !== null);

  return {
    dayKm: days.length === 0 ? null : days.reduce((a, b) => a + b, 0),
    monthKm: months.length === 0 ? null : months.reduce((a, b) => a + b, 0),
    vehicleCount: rows.length,
  };
}

export const mileageKey = (row: MileageRecord): string =>
  `${row.vehicleId ?? "none"}|${row.dayKm ?? "no-day"}|${row.monthKm ?? "no-month"}`;

/* ------------------------------------------------------------------ *
 * Duplicate protection
 * ------------------------------------------------------------------ */

/** Keep the first occurrence of each key, so a repeated row is never counted twice. */
export function dedupeBy<T>(rows: T[], key: (row: T) => string): T[] {
  const seen = new Set<string>();
  const kept: T[] = [];

  for (const row of rows) {
    const identity = key(row);
    if (seen.has(identity)) continue;

    seen.add(identity);
    kept.push(row);
  }

  return kept;
}

export const disruptionKey = (row: DisruptionRecord): string =>
  `${row.kind}|${row.vehicleId ?? "none"}|${row.startedAt ?? "no-start"}`;

export const serviceKey = (row: ServiceRecord): string =>
  `${row.kind}|${row.vehicleId ?? "none"}|${row.performedOn ?? "no-date"}|${row.cost ?? "no-cost"}`;

export const costKey = (row: FleetCostRow): string =>
  `${row.category}|${row.vehicleLabel}|${row.campusLabel}|${row.period}|${row.amount ?? "no-amount"}`;

/* ------------------------------------------------------------------ *
 * Story 1 rules
 * ------------------------------------------------------------------ */

/** Servicing and repairs read oldest-first; undated rows sink to the bottom. */
export function sortServiceChronologically(rows: ServiceRecord[]): ServiceRecord[] {
  return [...rows].sort((a, b) => {
    const left = a.performedOn ? Date.parse(a.performedOn) : Number.NaN;
    const right = b.performedOn ? Date.parse(b.performedOn) : Number.NaN;

    const leftMissing = Number.isNaN(left);
    const rightMissing = Number.isNaN(right);

    if (leftMissing && rightMissing) return 0;
    if (leftMissing) return 1;
    if (rightMissing) return -1;

    return left - right;
  });
}

/**
 * Next-service date, shown only when a valid schedule supplied one. The story
 * is explicit that the field is omitted rather than estimated.
 */
export function nextServiceLabel(record: ServiceRecord): string {
  if (!record.nextServiceScheduled || !record.nextServiceOn) return DASH;
  return formatDate(record.nextServiceOn);
}

/** Why the next-service date is missing, or `null` when it is present. */
export function nextServiceReason(record: ServiceRecord): string | null {
  if (record.nextServiceScheduled && record.nextServiceOn) return null;
  return "No service schedule is recorded for this vehicle.";
}

/* ------------------------------------------------------------------ *
 * Story 2 rules
 * ------------------------------------------------------------------ */

/** Sum the amounts, or `null` when no row in the set carries one. */
function sumAmounts(rows: FleetCostRow[]): number | null {
  const amounts = rows
    .map((row) => row.amount)
    .filter((amount): amount is number => amount !== null);

  return amounts.length === 0 ? null : amounts.reduce((a, b) => a + b, 0);
}

/**
 * Cost per kilometre.
 *
 * The figure is only produced when a cost and a positive distance are both
 * present. Anything else withholds it and explains why.
 */
export function costPerKm(
  cost: number | null | undefined,
  distanceKm: number | null | undefined,
): CostPerKmResult {
  if (cost === null || cost === undefined || !Number.isFinite(cost)) {
    return { value: null, reason: "Cost is not reported for this period." };
  }

  if (distanceKm === null || distanceKm === undefined || !Number.isFinite(distanceKm) || distanceKm <= 0) {
    return {
      value: null,
      reason: "Distance travelled is not reported, so cost per kilometre cannot be calculated.",
    };
  }

  return { value: cost / distanceKm, reason: null };
}

/**
 * Aggregates costs by category and splits the unmatched records out.
 * Candidates must be de-duplicated first (`dedupeBy(rows, costKey)`).
 */
export function summariseCosts(
  rows: FleetCostRow[],
  distanceKm: number | null = null,
): CostSummary {
  const allocated = rows.filter((row) => !row.unallocated);
  const unallocated = rows.filter((row) => row.unallocated);

  const categories: CostCategory[] = ["fuel", "servicing", "repair"];

  const allocatedTotal = sumAmounts(allocated);

  return {
    byCategory: categories.map((category) => ({
      category,
      label: costCategoryLabels[category],
      total: sumAmounts(allocated.filter((row) => row.category === category)),
    })),
    allocatedTotal,
    // Unallocated costs are reported in their own line and never merged in.
    unallocatedTotal: sumAmounts(unallocated),
    allocatedCount: allocated.length,
    unallocatedCount: unallocated.length,
    distanceKm,
    costPerKm: costPerKm(allocatedTotal, distanceKm),
  };
}

/* ------------------------------------------------------------------ *
 * Live records
 *
 * The operations API exposes the asset register and nothing else, so these
 * collections are empty. They are the single place to wire records in once the
 * endpoints below exist; the views already render the right dashes.
 * ------------------------------------------------------------------ */

export const disruptions: DisruptionRecord[] = [];
export const serviceRecords: ServiceRecord[] = [];
export const costRecords: FleetCostRow[] = [];
export const mileageRecords: MileageRecord[] = [];

/** Kilometres per period — not reported by any current endpoint. */
export const distanceKmForPeriod: number | null = null;

/** The gap list shown in the "Awaiting backend" panel. */
export const reportedFieldGaps: ReportedFieldGap[] = [
  { field: "Availability per vehicle", story: "OI-07" },
  { field: "Daily and monthly mileage per vehicle", story: "OI-07" },
  { field: "Hired-transport register (school owned vs hired)", story: "OI-07" },
  { field: "Transport delays: start, end and duration", story: "OI-08" },
  { field: "Breakdowns as their own record type", story: "OI-08" },
  { field: "Primary incident reference per disruption", story: "OI-08" },
  { field: "Servicing and repair history with odometer readings", story: "OI-08" },
  { field: "Service schedule (next-service date)", story: "OI-08" },
  { field: "Fuel, servicing and repair costs by vehicle and campus", story: "OI-09" },
  { field: "Distance travelled per vehicle per period", story: "OI-09" },
];
