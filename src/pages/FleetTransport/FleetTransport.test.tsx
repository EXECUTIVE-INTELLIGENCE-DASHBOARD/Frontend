import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

vi.mock("../../api/axios", () => ({
  default: { get: vi.fn() },
}));

import api from "../../api/axios";
import { FleetTransport } from "./FleetTransport";
import {
  costPerKm,
  countOrDash,
  DASH,
  dedupeBy,
  disruptionKey,
  formatDuration,
  formatKm,
  nextServiceLabel,
  sumMileage,
  summariseCosts,
  summariseFleet,
  textOrDash,
  toVehicle,
} from "./fleetTransport.data";
import type { DisruptionRecord, FleetCostRow } from "./fleetTransport.types";

const mockedGet = api.get as unknown as Mock;

/* The single fleet line the operations API really returns today. */
const vehicleDashboard = {
  summary: { total_assets: 6, total_value: "979999998.00", operational_rate: 100 },
  assets: [
    {
      id: 5,
      name: "67-Seater Student Transport Buses",
      category: "vehicle",
      campus: "kibuli",
      campus_display: "Kibuli",
      facility_name: "Transport Depot",
      quantity: 6,
      unit_value: "163333333.00",
      total_value: "979999998.00",
      condition: "operational",
      condition_display: "Operational (Good)",
      acquired_date: "2023-08-01",
    },
  ],
};

beforeEach(() => {
  mockedGet.mockReset();
  mockedGet.mockResolvedValue({ data: vehicleDashboard });
});

afterEach(() => {
  cleanup();
});

describe("Fleet & Transport page", () => {
  it("reads the vehicle category of the asset dashboard", () => {
    render(<FleetTransport />);

    expect(mockedGet).toHaveBeenCalledWith(
      "/operations/assets/dashboard/",
      expect.objectContaining({ params: { category: "vehicle" } }),
    );
  });

  it("renders the live fleet register", async () => {
    render(<FleetTransport />);

    // The same vehicle now appears in the register, disruption, servicing and
    // cost panels, so each figure is matched across all of them.
    expect((await screen.findAllByText("67-Seater Student Transport Buses")).length).toBeGreaterThan(
      1,
    );
    expect(screen.getByText("6 vehicles")).toBeInTheDocument();
    expect(
      screen.getAllByText("Transport Depot · Kibuli Main Campus").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("01 Aug 2023")).toBeInTheDocument();
  });

  it("shows a dash instead of a zero for records the API does not report", async () => {
    render(<FleetTransport />);
    await screen.findAllByText("67-Seater Student Transport Buses");

    // A zero would claim the fleet had no incidents, which is a stronger
    // statement than "this is not reported".
    const delays = screen.getByText("Delays Logged").closest("article");
    expect(delays?.textContent).toContain(DASH);
    expect(delays?.textContent).not.toContain("0");
  });

  it("omits the next-service date when no valid schedule exists", async () => {
    render(<FleetTransport />);
    await screen.findAllByText("67-Seater Student Transport Buses");

    expect(screen.getAllByText("Not recorded").length).toBeGreaterThan(0);
  });

  it("keeps every section on one screen with no tab strip", async () => {
    render(<FleetTransport />);
    await screen.findAllByText("67-Seater Student Transport Buses");

    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();

    for (const name of [
      "Fleet Register",
      "Disruptions",
      "Servicing & Repairs",
      "Running Costs",
    ]) {
      // "Fleet Register" names both the panel and one of its tables.
      expect(screen.getAllByRole("heading", { name }).length).toBeGreaterThan(0);
    }
  });

  it("covers OI-07 with availability, ownership and mileage, all dashed", async () => {
    render(<FleetTransport />);
    await screen.findAllByText("67-Seater Student Transport Buses");

    for (const label of ["Available Now", "Hired Transport", "Daily Mileage", "Monthly Mileage"]) {
      const metric = screen.getByText(label).closest("article");
      expect(metric?.textContent).toContain(DASH);
      expect(metric?.textContent).not.toContain("0");
    }

    expect(screen.getByRole("columnheader", { name: "Availability" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Ownership" })).toBeInTheDocument();

    // Hired transport is stated as absent rather than counted as zero.
    const hired = screen.getByText("Hired Transport").closest("article");
    expect(hired?.textContent).toContain(DASH);
  });

  it("always lists what the backend still owes the screen", () => {
    render(<FleetTransport />);

    expect(screen.getByText(/records still awaited from the backend/i)).toBeInTheDocument();
    expect(screen.getByText(/Distance travelled per vehicle per period/i)).toBeInTheDocument();
  });
});

describe("fleet record rules", () => {
  it("gives a missing duration a dash, never zero minutes", () => {
    expect(formatDuration(null)).toBe(DASH);
    expect(formatDuration(undefined)).toBe(DASH);
    expect(formatDuration(0)).toBe("0 min");
    expect(formatDuration(90)).toBe("1 h 30 min");
  });

  it("does not count a duplicated record twice", () => {
    const record: DisruptionRecord = {
      id: "DLY-001",
      kind: "delay",
      vehicleId: 5,
      vehicleLabel: "67-Seater Student Transport Buses",
      startedAt: "2026-03-02T07:10:00+03:00",
      endedAt: null,
      durationMinutes: null,
      status: "open",
      incidentRef: "INC-014",
      route: "Kibuli → Buwaate",
    };

    const deduped = dedupeBy([record, { ...record }, { ...record, id: "DLY-002" }], disruptionKey);
    expect(deduped).toHaveLength(1);
  });

  it("counts an empty record set as a dash", () => {
    expect(countOrDash([])).toBe(DASH);
    expect(countOrDash([{}, {}])).toBe("2");
  });

  it("formats mileage and dashes a blank status", () => {
    expect(formatKm(null)).toBe(DASH);
    expect(formatKm(1_200)).toBe("1,200 km");
    expect(textOrDash("  ")).toBe(DASH);
    expect(textOrDash("Available")).toBe("Available");
  });

  it("sums mileage only from records that carry a figure", () => {
    expect(sumMileage([])).toEqual({ dayKm: null, monthKm: null, vehicleCount: 0 });

    const totals = sumMileage([
      { id: "m1", vehicleId: 5, vehicleLabel: "Bus A", campusLabel: "Kibuli Main Campus", dayKm: 120, monthKm: 2_400 },
      { id: "m2", vehicleId: 6, vehicleLabel: "Bus B", campusLabel: "Kibuli Main Campus", dayKm: null, monthKm: 1_800 },
    ]);

    // The unreported day is left out, not treated as zero.
    expect(totals.dayKm).toBe(120);
    expect(totals.monthKm).toBe(4_200);
  });

  it("withholds cost per kilometre when the distance is missing", () => {
    const missing = costPerKm(1_200_000, null);
    expect(missing.value).toBeNull();
    expect(missing.reason).toMatch(/distance/i);

    const present = costPerKm(1_200_000, 4_000);
    expect(present.value).toBe(300);
    expect(present.reason).toBeNull();
  });

  it("reports unallocated costs separately from vehicle totals", () => {
    const rows: FleetCostRow[] = [
      { id: "c1", category: "fuel", vehicleLabel: "Bus A", campusLabel: "Kibuli Main Campus", amount: 500, period: "Term 1 2026", unallocated: false },
      { id: "c2", category: "repair", vehicleLabel: "Bus A", campusLabel: "Kibuli Main Campus", amount: 250, period: "Term 1 2026", unallocated: false },
      { id: "c3", category: "fuel", vehicleLabel: "Unallocated", campusLabel: DASH, amount: 100, period: "Term 1 2026", unallocated: true },
    ];

    const summary = summariseCosts(rows, 1_000);

    expect(summary.allocatedTotal).toBe(750);
    expect(summary.unallocatedTotal).toBe(100);
    expect(summary.byCategory.find((entry) => entry.category === "fuel")?.total).toBe(500);
    expect(summary.byCategory.find((entry) => entry.category === "servicing")?.total).toBeNull();
    expect(summary.costPerKm.value).toBe(0.75);
  });

  it("returns no totals at all when nothing is reported", () => {
    const summary = summariseCosts([]);

    expect(summary.allocatedTotal).toBeNull();
    expect(summary.unallocatedTotal).toBeNull();
    expect(summary.byCategory.every((entry) => entry.total === null)).toBe(true);
    expect(summary.costPerKm.value).toBeNull();
  });

  it("drops the next-service date unless a schedule supplied it", () => {
    const base = {
      id: "WO-1",
      kind: "service" as const,
      vehicleId: 5,
      vehicleLabel: "Bus",
      performedOn: "2026-02-01",
      odometerKm: 48_000,
      cost: 900_000,
      nextServiceOn: "2026-05-01",
      notes: null,
    };

    expect(nextServiceLabel({ ...base, nextServiceScheduled: false })).toBe(DASH);
    expect(nextServiceLabel({ ...base, nextServiceScheduled: true })).toBe("01 May 2026");
  });
});

describe("fleet summary", () => {
  it("maps the asset register into a fleet vehicle", () => {
    const vehicle = toVehicle(vehicleDashboard.assets[0]);

    expect(vehicle.units).toBe(6);
    expect(vehicle.totalValue).toBe(979_999_998);
    expect(vehicle.depot).toBe("Transport Depot");
    expect(vehicle.campusLabel).toBe("Kibuli Main Campus");
    expect(vehicle.conditionLabel).toBe("Operational");
    // The register stores no plate number, ownership or availability.
    expect(vehicle.registration).toBeNull();
    expect(vehicle.ownership).toBeNull();
    expect(vehicle.availability).toBeNull();
  });

  it("totals units and value from the dated register lines", () => {
    const vehicles = [toVehicle(vehicleDashboard.assets[0])];
    const summary = summariseFleet(vehicles, new Date("2026-10-17T00:00:00Z"), 100);

    expect(summary.units).toBe(6);
    expect(summary.lines).toBe(1);
    expect(summary.totalValue).toBe(979_999_998);
    expect(summary.operationalRate).toBe(100);
    expect(summary.averageAgeYears).toBeCloseTo(3.2, 1);
  });
});
