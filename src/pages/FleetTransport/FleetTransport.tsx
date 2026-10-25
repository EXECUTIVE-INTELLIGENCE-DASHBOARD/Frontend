import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Bus,
  CalendarDays,
  ChevronDown,
  ShieldAlert,
  TriangleAlert,
  Wallet,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import "../../palette.css";
import "./FleetTransport.css";

import { Dash, FleetDataCard, FleetPill } from "./FleetDataCard";
import type { FleetColumn } from "./FleetDataCard";
import { useFleetRegister } from "./fleetTransport.api";
import {
  campusLabels,
  campusOptions,
  costKey,
  costRecords,
  countOrDash,
  DASH,
  dedupeBy,
  disruptionKey,
  disruptionKindLabels,
  disruptionStatusLabels,
  disruptions,
  distanceKmForPeriod,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDuration,
  formatKm,
  formatNumber,
  formatPercent,
  formatYears,
  mileageKey,
  mileageRecords,
  nextServiceLabel,
  nextServiceReason,
  ownershipLabels,
  reportedFieldGaps,
  reportingPeriod,
  serviceKey,
  serviceKindLabels,
  serviceRecords,
  sortServiceChronologically,
  sumMileage,
  summariseCosts,
  summariseFleet,
  textOrDash,
  vehicleAgeYears,
} from "./fleetTransport.data";
import type {
  CampusSelection,
  DisruptionRecord,
  FleetCostRow,
  FleetVehicle,
  MileageRecord,
  ServiceRecord,
} from "./fleetTransport.types";

/** Renders a dash in the muted tone instead of an empty cell. */
function Value({ text }: { text: string }) {
  return text === DASH ? <Dash /> : <>{text}</>;
}

interface FleetStatItem {
  label: string;
  value: string;
}

/** One compact figure inside a panel header. */
function FleetStat({ label, value }: FleetStatItem) {
  return (
    <article className="ft-stat">
      <span className="ft-stat__label">{label}</span>
      <span className={`ft-stat__value${value === DASH ? " ft-stat__value--dash" : ""}`}>
        {value}
      </span>
    </article>
  );
}

/** An executive panel: section title, its headline figures, then its tables. */
function FleetPanel({
  title,
  icon: Icon,
  stats,
  wide = false,
  split = false,
  children,
}: {
  title: string;
  icon: LucideIcon;
  stats: FleetStatItem[];
  /** Panels holding a wide multi-column table take the full width. */
  wide?: boolean;
  /** Lay the panel's tables side by side instead of stacking them. */
  split?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`ft-panel${wide ? " ft-panel--wide" : ""}`}>
      <header className="ft-panel__head">
        <h2 className="ft-panel__title">
          <span className="ft-panel__icon">
            <Icon size={13} aria-hidden="true" />
          </span>
          {title}
        </h2>

        <div className="ft-panel__stats">
          {stats.map((stat) => (
            <FleetStat key={stat.label} {...stat} />
          ))}
        </div>
      </header>

      <div className={`ft-panel__body${split ? " ft-panel__body--split" : ""}`}>{children}</div>
    </section>
  );
}

/** A repair with no completion date is still open; anything else is complete. */
function serviceStatus(row: ServiceRecord): { label: string; tone: "good" | "bad" | "muted" } {
  if (row.kind === "repair" && row.performedOn === null) return { label: "Open", tone: "bad" };
  if (row.performedOn === null) return { label: "Not recorded", tone: "muted" };
  return { label: "Complete", tone: "good" };
}

const vehicleColumns: FleetColumn<FleetVehicle>[] = [
  {
    header: "Vehicle",
    cell: (row) => <span className="ft-cell--name">{row.name}</span>,
    csv: (row) => row.name,
  },
  {
    header: "Depot & Campus",
    cell: (row) => <Value text={`${row.depot} · ${row.campusLabel}`} />,
    csv: (row) => `${row.depot} · ${row.campusLabel}`,
  },
];

const mileageColumns: FleetColumn<MileageRecord>[] = [
  {
    header: "Vehicle",
    cell: (row) => <span className="ft-cell--name">{row.vehicleLabel}</span>,
    csv: (row) => row.vehicleLabel,
  },
  { header: "Campus", cell: (row) => <Value text={row.campusLabel} />, csv: (row) => row.campusLabel },
  {
    header: "Daily",
    cell: (row) => <Value text={formatKm(row.dayKm)} />,
    csv: (row) => formatKm(row.dayKm),
    align: "right",
  },
  {
    header: "Monthly",
    cell: (row) => <Value text={formatKm(row.monthKm)} />,
    csv: (row) => formatKm(row.monthKm),
    align: "right",
  },
];

const disruptionLogColumns: FleetColumn<DisruptionRecord>[] = [
  {
    header: "Reference",
    cell: (row) => <span className="ft-cell--name">{row.id}</span>,
    csv: (row) => row.id,
  },
  {
    header: "Type",
    cell: (row) => (
      <FleetPill tone={row.kind === "breakdown" ? "bad" : "warn"}>
        {disruptionKindLabels[row.kind]}
      </FleetPill>
    ),
    csv: (row) => disruptionKindLabels[row.kind],
    align: "center",
  },
  { header: "Vehicle", cell: (row) => <Value text={row.vehicleLabel} />, csv: (row) => row.vehicleLabel },
  { header: "Route", cell: (row) => <Value text={row.route ?? DASH} />, csv: (row) => row.route ?? DASH },
  { header: "Started", cell: (row) => <Value text={formatDateTime(row.startedAt)} />, csv: (row) => formatDateTime(row.startedAt) },
  { header: "Ended", cell: (row) => <Value text={formatDateTime(row.endedAt)} />, csv: (row) => formatDateTime(row.endedAt) },
  {
    // A missing end time yields a dash, never "0 min".
    header: "Duration Gap",
    cell: (row) => <Value text={formatDuration(row.durationMinutes)} />,
    csv: (row) => formatDuration(row.durationMinutes),
    align: "right",
  },
  {
    header: "Status",
    cell: (row) => (
      <FleetPill tone={row.status === "resolved" ? "good" : row.status === "open" ? "bad" : "warn"}>
        {disruptionStatusLabels[row.status]}
      </FleetPill>
    ),
    csv: (row) => disruptionStatusLabels[row.status],
    align: "center",
  },
  {
    header: "Primary Incident",
    cell: (row) => <Value text={row.incidentRef ?? DASH} />,
    csv: (row) => row.incidentRef ?? DASH,
  },
];

const serviceColumns: FleetColumn<ServiceRecord>[] = [
  {
    header: "Work Order",
    cell: (row) => <span className="ft-cell--name">{row.id}</span>,
    csv: (row) => row.id,
  },
  {
    header: "Type",
    cell: (row) => (
      <FleetPill tone={row.kind === "repair" ? "warn" : "muted"}>
        {serviceKindLabels[row.kind]}
      </FleetPill>
    ),
    csv: (row) => serviceKindLabels[row.kind],
    align: "center",
  },
  {
    header: "Status",
    cell: (row) => <FleetPill tone={serviceStatus(row).tone}>{serviceStatus(row).label}</FleetPill>,
    csv: (row) => serviceStatus(row).label,
    align: "center",
  },
  { header: "Vehicle", cell: (row) => <Value text={row.vehicleLabel} />, csv: (row) => row.vehicleLabel },
  { header: "Performed", cell: (row) => <Value text={formatDate(row.performedOn)} />, csv: (row) => formatDate(row.performedOn) },
  {
    header: "Odometer",
    cell: (row) => <Value text={row.odometerKm === null ? DASH : `${formatNumber(row.odometerKm)} km`} />,
    csv: (row) => (row.odometerKm === null ? DASH : row.odometerKm),
    align: "right",
  },
  {
    header: "Cost",
    cell: (row) => <Value text={formatCurrency(row.cost)} />,
    csv: (row) => formatCurrency(row.cost),
    align: "right",
  },
  {
    // Omitted entirely unless a valid schedule supplied the date.
    header: "Next Service",
    cell: (row) => <Value text={nextServiceLabel(row)} />,
    csv: (row) => nextServiceLabel(row),
  },
];

const costColumns: FleetColumn<FleetCostRow>[] = [
  {
    header: "Vehicle / Line",
    cell: (row) => <span className="ft-cell--name">{row.vehicleLabel}</span>,
    csv: (row) => row.vehicleLabel,
  },
  { header: "Campus", cell: (row) => <Value text={row.campusLabel} />, csv: (row) => row.campusLabel },
  {
    header: "Period",
    cell: (row) => <Value text={row.period} />,
    csv: (row) => row.period,
    align: "center",
  },
  {
    header: "Amount",
    cell: (row) => <Value text={formatCurrency(row.amount)} />,
    csv: (row) => formatCurrency(row.amount),
    align: "right",
  },
];

export function FleetTransport() {
  const [campus, setCampus] = useState<CampusSelection>("all");

  const register = useFleetRegister();
  const hasRegister = register.data !== null;

  // Fixed for the render so every age is measured against the same instant.
  const asOf = useMemo(() => new Date(), []);

  const vehicles = useMemo(() => {
    const all = register.data?.vehicles ?? [];
    return campus === "all" ? all : all.filter((vehicle) => vehicle.campus === campus);
  }, [campus, register.data]);

  const summary = useMemo(
    () =>
      summariseFleet(
        vehicles,
        asOf,
        campus === "all" ? register.data?.operationalRate ?? null : null,
      ),
    [asOf, campus, register.data, vehicles],
  );

  const scopedLabel = campus === "all" ? "All Campuses" : campusLabels[campus];
  const vehicleIds = useMemo(() => new Set(vehicles.map((vehicle) => vehicle.id)), [vehicles]);

  /* OI-07 — availability, mileage and the school-owned / hired split. */
  const availableVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.availability !== null),
    [vehicles],
  );

  const hiredVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.ownership === "hired"),
    [vehicles],
  );

  const mileage = useMemo(
    () =>
      dedupeBy(mileageRecords, mileageKey).filter(
        (row) => row.vehicleId === null || vehicleIds.has(row.vehicleId),
      ),
    [vehicleIds],
  );

  const mileageSummary = useMemo(() => sumMileage(mileage), [mileage]);

  /* Story 1 — disruptions and service history. */
  const visibleDisruptions = useMemo(
    () =>
      dedupeBy(disruptions, disruptionKey).filter(
        (row) => row.vehicleId === null || vehicleIds.has(row.vehicleId),
      ),
    [vehicleIds],
  );

  const delayLog = useMemo(
    () => visibleDisruptions.filter((row) => row.kind === "delay"),
    [visibleDisruptions],
  );

  const breakdownLog = useMemo(
    () => visibleDisruptions.filter((row) => row.kind === "breakdown"),
    [visibleDisruptions],
  );

  const openDisruptions = useMemo(
    () => visibleDisruptions.filter((row) => row.status !== "resolved"),
    [visibleDisruptions],
  );

  const meanDelay = useMemo(() => {
    const gaps = delayLog
      .map((row) => row.durationMinutes)
      .filter((minutes): minutes is number => minutes !== null);

    return gaps.length === 0 ? null : gaps.reduce((a, b) => a + b, 0) / gaps.length;
  }, [delayLog]);

  const history = useMemo(
    () =>
      sortServiceChronologically(
        dedupeBy(serviceRecords, serviceKey).filter(
          (row) => row.vehicleId === null || vehicleIds.has(row.vehicleId),
        ),
      ),
    [vehicleIds],
  );

  const openRepairs = useMemo(
    () => history.filter((row) => row.kind === "repair" && row.performedOn === null),
    [history],
  );

  /** Only vehicles that carry a valid service schedule qualify. */
  const scheduleByVehicle = useMemo(() => {
    const scheduled = new Map<number, ServiceRecord>();

    for (const row of dedupeBy(serviceRecords, serviceKey)) {
      if (row.vehicleId === null || !row.nextServiceScheduled || !row.nextServiceOn) continue;
      scheduled.set(row.vehicleId, row);
    }

    return scheduled;
  }, []);

  /* Story 2 — costs. */
  const costs = useMemo(
    () =>
      dedupeBy(costRecords, costKey).filter(
        (row) => campus === "all" || row.campusLabel === campusLabels[campus],
      ),
    [campus],
  );

  const costSummary = useMemo(() => summariseCosts(costs, distanceKmForPeriod), [costs]);
  const allocatedRows = useMemo(() => costs.filter((row) => !row.unallocated), [costs]);
  const unallocatedRows = useMemo(() => costs.filter((row) => row.unallocated), [costs]);

  const fleetSize = hasRegister
    ? `${formatNumber(summary.units)} ${summary.units === 1 ? "vehicle" : "vehicles"}`
    : DASH;

  const repairAndServiceTotal = useMemo(() => {
    const totals = costSummary.byCategory
      .filter((entry) => entry.category !== "fuel")
      .map((entry) => entry.total)
      .filter((total): total is number => total !== null);

    return totals.length === 0 ? null : totals.reduce((a, b) => a + b, 0);
  }, [costSummary]);

  /* Headline figures for each panel, in the order the stories run. */
  const registerStats: FleetStatItem[] = [
    { label: "Fleet Size", value: fleetSize },
    { label: "Asset Value", value: formatCurrency(summary.totalValue) },
    { label: "Operational Rate", value: formatPercent(summary.operationalRate) },
    { label: "Average Age", value: formatYears(summary.averageAgeYears) },
    { label: "Available Now", value: countOrDash(availableVehicles) },
    { label: "Hired Transport", value: countOrDash(hiredVehicles) },
    { label: "Daily Mileage", value: formatKm(mileageSummary.dayKm) },
    { label: "Monthly Mileage", value: formatKm(mileageSummary.monthKm) },
  ];

  const disruptionStats: FleetStatItem[] = [
    { label: "Delays Logged", value: countOrDash(delayLog) },
    { label: "Breakdowns", value: countOrDash(breakdownLog) },
    { label: "Open Disruptions", value: countOrDash(openDisruptions) },
    { label: "Mean Delay Gap", value: formatDuration(meanDelay) },
  ];

  const servicingStats: FleetStatItem[] = [
    { label: "Services Logged", value: countOrDash(history.filter((row) => row.kind === "service")) },
    { label: "Repairs Logged", value: countOrDash(history.filter((row) => row.kind === "repair")) },
    { label: "Open Repairs", value: countOrDash(openRepairs) },
    { label: "Scheduled Vehicles", value: countOrDash([...scheduleByVehicle.keys()]) },
  ];

  const costStats: FleetStatItem[] = [
    { label: "Allocated Cost", value: formatCurrency(costSummary.allocatedTotal) },
    {
      label: "Fuel",
      value: formatCurrency(
        costSummary.byCategory.find((entry) => entry.category === "fuel")?.total ?? null,
      ),
    },
    { label: "Servicing & Repairs", value: formatCurrency(repairAndServiceTotal) },
    { label: "Cost per Kilometre", value: formatCurrency(costSummary.costPerKm.value) },
  ];

  return (
    <div className="ft-page">
      <div className="ft-toolbar">
        <span className="ft-period">
          <CalendarDays size={14} aria-hidden="true" />
          {reportingPeriod}
        </span>

        <label className="ft-select">
          <select
            aria-label="Campus"
            className="ft-select__field"
            value={campus}
            onChange={(event) => setCampus(event.target.value as CampusSelection)}
          >
            {campusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} aria-hidden="true" />
        </label>
      </div>

      {register.error ? (
        <p className="ft-alert" role="alert">
          Live fleet register unavailable — {register.error}
        </p>
      ) : null}

      <div className="ft-grid">
        <FleetPanel title="Fleet Register" icon={Bus} stats={registerStats} wide>
          <FleetDataCard
            title="Fleet Register"
            columns={[
              {
                header: "Fleet Line",
                cell: (row: FleetVehicle) => <span className="ft-cell--name">{row.name}</span>,
                csv: (row) => row.name,
              },
              { header: "Registration", cell: () => <Dash />, csv: () => DASH, align: "center" },
              {
                header: "Depot & Campus",
                cell: (row) => `${row.depot} · ${row.campusLabel}`,
                csv: (row) => `${row.depot} · ${row.campusLabel}`,
              },
              {
                header: "Units",
                cell: (row) => <span className="ft-cell--num">{formatNumber(row.units)}</span>,
                csv: (row) => row.units,
                align: "right",
              },
              {
                header: "Value / Unit",
                cell: (row) => <span className="ft-cell--num">{formatCurrency(row.unitValue)}</span>,
                csv: (row) => formatCurrency(row.unitValue),
                align: "right",
              },
              {
                header: "Total Value",
                cell: (row) => <span className="ft-cell--num">{formatCurrency(row.totalValue)}</span>,
                csv: (row) => formatCurrency(row.totalValue),
                align: "right",
              },
              {
                header: "Condition",
                cell: (row) => (
                  <FleetPill tone={row.condition === "operational" ? "good" : "warn"}>
                    {row.conditionLabel}
                  </FleetPill>
                ),
                csv: (row) => row.conditionLabel,
                align: "center",
              },
              {
                header: "Availability",
                cell: (row) => <Value text={textOrDash(row.availability)} />,
                csv: (row) => textOrDash(row.availability),
                align: "center",
              },
              {
                header: "Ownership",
                cell: (row) =>
                  row.ownership === null ? (
                    <Dash />
                  ) : (
                    <FleetPill tone={row.ownership === "hired" ? "warn" : "good"}>
                      {ownershipLabels[row.ownership]}
                    </FleetPill>
                  ),
                csv: (row) =>
                  row.ownership === null ? DASH : ownershipLabels[row.ownership],
                align: "center",
              },
              {
                header: "Acquired",
                cell: (row) => <Value text={formatDate(row.acquiredDate)} />,
                csv: (row) => formatDate(row.acquiredDate),
              },
              {
                header: "Age",
                cell: (row) => <Value text={formatYears(vehicleAgeYears(row, asOf))} />,
                csv: (row) => formatYears(vehicleAgeYears(row, asOf)),
                align: "right",
              },
            ]}
            rows={vehicles}
            rowKey={(row) => String(row.id)}
            fileName="fleet-register"
            scopeLabel={scopedLabel}
            emptyMessage={
              register.isPending
                ? "Loading the fleet register…"
                : "No transport assets are registered for this campus."
            }
          />

          <FleetDataCard
            title="Daily & Monthly Mileage"
            columns={mileageColumns}
            rows={mileage}
            rowKey={(row) => row.id}
            fileName="fleet-mileage"
            scopeLabel={scopedLabel}
            emptyMessage="No mileage reported."
          />
        </FleetPanel>

        <FleetPanel title="Disruptions" icon={TriangleAlert} stats={disruptionStats} wide>
          <FleetDataCard
            title="Disruption Log"
            columns={disruptionLogColumns}
            rows={visibleDisruptions}
            rowKey={(row) => row.id}
            fileName="fleet-disruptions"
            scopeLabel={scopedLabel}
            emptyMessage="No delays or breakdowns reported."
          />

          <FleetDataCard
            title="By Vehicle"
            columns={[
              ...vehicleColumns,
              { header: "Delays", cell: () => <Dash />, csv: () => DASH, align: "right" },
              { header: "Breakdowns", cell: () => <Dash />, csv: () => DASH, align: "right" },
              { header: "Longest Gap", cell: () => <Dash />, csv: () => DASH, align: "right" },
              { header: "Last Disruption", cell: () => <Dash />, csv: () => DASH },
              { header: "Linked Incident", cell: () => <Dash />, csv: () => DASH },
            ]}
            rows={vehicles}
            rowKey={(row) => String(row.id)}
            fileName="fleet-disruption-by-vehicle"
            scopeLabel={scopedLabel}
            emptyMessage="No vehicles registered."
          />
        </FleetPanel>

        <FleetPanel title="Servicing & Repairs" icon={Wrench} stats={servicingStats}>
          <FleetDataCard
            title="Service Schedule"
            columns={[
              ...vehicleColumns,
              {
                header: "Next Service",
                cell: (row: FleetVehicle) => {
                  const scheduled = scheduleByVehicle.get(row.id);
                  return scheduled ? <Value text={nextServiceLabel(scheduled)} /> : <Dash />;
                },
                csv: (row) => {
                  const scheduled = scheduleByVehicle.get(row.id);
                  return scheduled ? nextServiceLabel(scheduled) : DASH;
                },
                align: "center",
              },
              {
                header: "Schedule",
                cell: (row: FleetVehicle) =>
                  scheduleByVehicle.has(row.id) ? (
                    <FleetPill tone="good">Scheduled</FleetPill>
                  ) : (
                    <FleetPill tone="muted">Not recorded</FleetPill>
                  ),
                csv: (row) => (scheduleByVehicle.has(row.id) ? "Scheduled" : "Not recorded"),
                align: "center",
              },
              {
                header: "Note",
                cell: (row: FleetVehicle) => {
                  const scheduled = scheduleByVehicle.get(row.id);
                  const reason = scheduled
                    ? nextServiceReason(scheduled)
                    : "No service schedule is recorded for this vehicle.";
                  return <Value text={reason ?? DASH} />;
                },
                csv: (row) => {
                  const scheduled = scheduleByVehicle.get(row.id);
                  return (scheduled ? nextServiceReason(scheduled) : null) ?? DASH;
                },
              },
            ]}
            rows={vehicles}
            rowKey={(row) => String(row.id)}
            fileName="fleet-service-schedule"
            scopeLabel={scopedLabel}
            emptyMessage="No transport vehicles are registered for this campus."
          />

          <FleetDataCard
            title="Service & Repair History"
            columns={serviceColumns}
            rows={history}
            rowKey={(row) => row.id}
            fileName="fleet-service-history"
            scopeLabel={scopedLabel}
            emptyMessage="No servicing or repairs reported."
          />
        </FleetPanel>

        <FleetPanel title="Running Costs" icon={Wallet} stats={costStats}>
          <FleetDataCard
            title="Cost by Vehicle"
            columns={[
              ...vehicleColumns,
              { header: "Fuel", cell: () => <Dash />, csv: () => DASH, align: "right" },
              { header: "Servicing", cell: () => <Dash />, csv: () => DASH, align: "right" },
              { header: "Repairs", cell: () => <Dash />, csv: () => DASH, align: "right" },
              { header: "Total", cell: () => <Dash />, csv: () => DASH, align: "right" },
              { header: "Distance", cell: () => <Dash />, csv: () => DASH, align: "right" },
              { header: "Cost / km", cell: () => <Dash />, csv: () => DASH, align: "right" },
            ]}
            rows={vehicles}
            rowKey={(row) => String(row.id)}
            fileName="fleet-cost-by-vehicle"
            scopeLabel={scopedLabel}
            emptyMessage="No vehicles registered."
          />

          <FleetDataCard
            title="By Category & Period"
            columns={costColumns}
            rows={allocatedRows}
            rowKey={(row) => row.id}
            fileName="fleet-cost-by-category"
            scopeLabel={scopedLabel}
            emptyMessage="No allocated costs reported."
          />

          <FleetDataCard
            title="Unallocated"
            columns={costColumns}
            rows={unallocatedRows}
            rowKey={(row) => `unallocated-${row.id}`}
            fileName="fleet-cost-unallocated"
            scopeLabel={scopedLabel}
            emptyMessage="No unallocated costs reported."
          />
        </FleetPanel>
      </div>

      <details className="ft-gaps">
        <summary className="ft-gaps__summary">
          <ShieldAlert size={13} aria-hidden="true" />
          {DASH} not reported by the API · {reportedFieldGaps.length} records still awaited from the backend
        </summary>

        <ul className="ft-gaps__list">
          {reportedFieldGaps.map((gap) => (
            <li key={gap.field}>
              <span className="ft-gaps__story">{gap.story}</span>
              <span>{gap.field}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

export default FleetTransport;
