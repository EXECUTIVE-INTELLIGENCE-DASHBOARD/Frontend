import type {
  AgeBandId,
  Aggregate,
  AtRiskRecord,
  ClassAggregate,
  ClassDefinition,
  CohortRow,
  Filters,
  Figure,
  FunnelStage,
  LevelId,
  NationalityId,
  ReasonFigure,
  ReasonId,
  ReligionId,
  SchoolAggregate,
  SchoolId,
  SchoolSelection,
  TermId,
  TransitionFigure,
  TrendPoint,
  WithdrawalRecord,
  YearId,
} from "./admissionsEnrollment.types";

/* ------------------------------------------------------------------ Labels */

export interface SchoolProfile {
  id: SchoolId;
  name: string;
  short: string;
  /** Relative size used to derive the deterministic sample figures. */
  scale: number;
  /** Boarding uptake multiplier; nursery campuses have no boarders. */
  boardingFactor: number;
  /** Percentage-point adjustment applied to the transition figures. */
  transitionOffset: number;
}

export const schools: readonly SchoolProfile[] = [
  {
    id: "kibuli-nursery",
    name: "Greenhill Academy Nursery – Kibuli",
    short: "Kibuli Nursery",
    scale: 0.82,
    boardingFactor: 1,
    transitionOffset: 1.4,
  },
  {
    id: "kibuli-primary",
    name: "Greenhill Academy Primary – Kibuli",
    short: "Kibuli Primary",
    scale: 1.18,
    boardingFactor: 1.15,
    transitionOffset: 1.4,
  },
  {
    id: "kibuli-secondary",
    name: "Greenhill Academy Secondary – Kibuli",
    short: "Kibuli Secondary",
    scale: 1.12,
    boardingFactor: 1.15,
    transitionOffset: 1.4,
  },
  {
    id: "buwaate-nursery",
    name: "Greenhill Academy Nursery – Buwaate",
    short: "Buwaate Nursery",
    scale: 0.7,
    boardingFactor: 1,
    transitionOffset: -1.2,
  },
  {
    id: "buwaate-primary",
    name: "Greenhill Academy Primary – Buwaate",
    short: "Buwaate Primary",
    scale: 0.95,
    boardingFactor: 0.85,
    transitionOffset: -1.2,
  },
  {
    id: "kansanga-gis",
    name: "Greenhill International School (GIS) – Kansanga",
    short: "GIS Kansanga",
    scale: 0.78,
    boardingFactor: 1,
    transitionOffset: 0.6,
  },
];

/** Number of campuses in the group — the divisor for the board average. */
export const schoolCount = schools.length;

const allSchools: SchoolId[] = schools.map((school) => school.id);
const nurserySchools: SchoolId[] = [
  "kibuli-nursery",
  "buwaate-nursery",
  "kansanga-gis",
];
const primarySchools: SchoolId[] = [
  "kibuli-primary",
  "buwaate-primary",
  "kansanga-gis",
];
const secondarySchools: SchoolId[] = ["kibuli-secondary", "kansanga-gis"];

export const levelLabels: Record<LevelId, string> = {
  nursery: "Nursery",
  primary: "Primary",
  olevel: "O-Level",
  alevel: "A-Level",
};

export const classDefinitions: ClassDefinition[] = [
  { id: "baby", label: "Baby Class", level: "nursery", schools: nurserySchools, base: 26, withdrawal: 0.09, boarding: 0 },
  { id: "middle", label: "Middle Class", level: "nursery", schools: nurserySchools, base: 28, withdrawal: 0.09, boarding: 0 },
  { id: "top", label: "Top Class", level: "nursery", schools: nurserySchools, base: 30, withdrawal: 0.09, boarding: 0 },

  { id: "p1", label: "P.1", level: "primary", schools: primarySchools, base: 36, withdrawal: 0.08, boarding: 0.12 },
  { id: "p2", label: "P.2", level: "primary", schools: primarySchools, base: 34, withdrawal: 0.08, boarding: 0.12 },
  { id: "p3", label: "P.3", level: "primary", schools: primarySchools, base: 33, withdrawal: 0.08, boarding: 0.12 },
  { id: "p4", label: "P.4", level: "primary", schools: primarySchools, base: 32, withdrawal: 0.08, boarding: 0.12 },
  { id: "p5", label: "P.5", level: "primary", schools: primarySchools, base: 31, withdrawal: 0.08, boarding: 0.12 },
  { id: "p6", label: "P.6", level: "primary", schools: primarySchools, base: 30, withdrawal: 0.08, boarding: 0.12 },
  { id: "p7", label: "P.7", level: "primary", schools: primarySchools, base: 29, withdrawal: 0.08, boarding: 0.12 },

  { id: "s1", label: "S.1", level: "olevel", schools: secondarySchools, base: 36, withdrawal: 0.11, boarding: 0.48 },
  { id: "s2", label: "S.2", level: "olevel", schools: secondarySchools, base: 34, withdrawal: 0.11, boarding: 0.48 },
  { id: "s3", label: "S.3", level: "olevel", schools: secondarySchools, base: 33, withdrawal: 0.11, boarding: 0.48 },
  { id: "s4", label: "S.4", level: "olevel", schools: secondarySchools, base: 31, withdrawal: 0.11, boarding: 0.48 },

  { id: "s5", label: "S.5", level: "alevel", schools: secondarySchools, base: 30, withdrawal: 0.09, boarding: 0.72 },
  { id: "s6", label: "S.6", level: "alevel", schools: secondarySchools, base: 28, withdrawal: 0.09, boarding: 0.72 },
];

export const streams = ["A", "B"];

export const years: YearId[] = ["2026/27", "2025/26", "2024/25"];

export const termOptions: Array<{ id: TermId; label: string }> = [
  { id: "t1", label: "Term 1" },
  { id: "t2", label: "Term 2" },
  { id: "t3", label: "Term 3" },
  { id: "full", label: "Full year" },
];

export const ageBandLabels: Record<AgeBandId, string> = {
  "3-5": "3–5 yrs",
  "6-9": "6–9 yrs",
  "10-13": "10–13 yrs",
  "14-16": "14–16 yrs",
  "17-19": "17–19 yrs",
};

export const nationalityLabels: Record<NationalityId, string> = {
  ugandan: "Ugandan",
  kenyan: "Kenyan",
  rwandese: "Rwandese",
  "south-sudanese": "South Sudanese",
  other: "Other international",
};

export const religionLabels: Record<ReligionId, string> = {
  catholic: "Catholic",
  anglican: "Anglican",
  muslim: "Muslim",
  pentecostal: "Pentecostal",
  other: "Other",
  "not-stated": "Not stated",
};

export const reasonLabels: Record<ReasonId, string> = {
  fees: "Fee arrears",
  relocation: "Family relocation",
  "academic-transfer": "Academic transfer",
  "family-health": "Family / health",
  discipline: "Discipline",
  completed: "Completed programme",
  unknown: "Not recorded",
};

export const defaultFilters: Filters = {
  year: "2026/27",
  term: "t2",
  school: "all",
  classId: "all",
  stream: "all",
  student: "",
};

/**
 * Freshness metadata.
 *
 * The API does not report a sync time or a count of incomplete records, so
 * these are `null` and the UI renders a dash rather than inventing a date.
 */
export const dataFreshness = {
  source: null as string | null,
  lastSync: null as string | null,
  missingAgeRecords: null as number | null,
  missingStageRecords: null as number | null,
  scopeNote:
    "Aggregates use authorised enrolment data. Learner names are only shown in the withdrawals and risk-review tables.",
};

/* ------------------------------------------------------------------ Helpers */

const ageBandKeys: AgeBandId[] = ["3-5", "6-9", "10-13", "14-16", "17-19"];
const nationalityKeys: NationalityId[] = [
  "ugandan",
  "kenyan",
  "rwandese",
  "south-sudanese",
  "other",
];
const religionKeys: ReligionId[] = [
  "catholic",
  "anglican",
  "muslim",
  "pentecostal",
  "other",
  "not-stated",
];

const shareOf = (value: number, total: number) =>
  total === 0 ? 0 : (value / total) * 100;

export const formatNumber = (value: number) => value.toLocaleString("en-US");

export const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export const classLabelFor = (classId: string) =>
  classDefinitions.find((definition) => definition.id === classId)?.label ??
  classId;

export const schoolNameFor = (schoolId: SchoolId) =>
  schools.find((school) => school.id === schoolId)?.name ?? schoolId;

export const schoolShortNameFor = (schoolId: SchoolId) =>
  schools.find((school) => school.id === schoolId)?.short ?? schoolId;

/** Deterministic pseudo-random helpers keep sample figures stable. */
function hash(text: string): number {
  let value = 0;

  for (let index = 0; index < text.length; index += 1) {
    value = (value * 31 + text.charCodeAt(index)) % 100_003;
  }

  return value;
}

const variation = (seed: string, spread: number) =>
  (hash(seed) % (spread * 2 + 1)) - spread;

function distribute<T extends string>(
  keys: T[],
  weights: Array<[T, number]>,
  total: number,
): Record<T, number> {
  const result = {} as Record<T, number>;

  for (const key of keys) {
    result[key] = 0;
  }

  let remaining = total;

  weights.forEach(([key, weight], index) => {
    if (index === weights.length - 1) {
      result[key] += remaining;
      return;
    }

    const value = Math.round(total * weight);

    result[key] += value;
    remaining -= value;
  });

  return result;
}

function ageBandsFor(definition: ClassDefinition, learners: number) {
  if (definition.level === "nursery") {
    return distribute<AgeBandId>(
      ageBandKeys,
      [
        ["3-5", 0.95],
        ["6-9", 0.05],
      ],
      learners,
    );
  }

  if (definition.level === "primary") {
    const upperPrimary = ["p5", "p6", "p7"].includes(definition.id);

    return distribute<AgeBandId>(
      ageBandKeys,
      upperPrimary
        ? [
            ["6-9", 0.06],
            ["10-13", 0.8],
            ["14-16", 0.14],
          ]
        : [
            ["6-9", 0.82],
            ["10-13", 0.18],
          ],
      learners,
    );
  }

  if (definition.level === "olevel") {
    return distribute<AgeBandId>(
      ageBandKeys,
      [
        ["14-16", 0.87],
        ["17-19", 0.1],
        ["10-13", 0.03],
      ],
      learners,
    );
  }

  return distribute<AgeBandId>(
    ageBandKeys,
    [
      ["17-19", 0.88],
      ["14-16", 0.12],
    ],
    learners,
  );
}

const nationalityWeights: Array<[NationalityId, number]> = [
  ["ugandan", 0.78],
  ["kenyan", 0.06],
  ["rwandese", 0.05],
  ["south-sudanese", 0.04],
  ["other", 0.07],
];

const religionWeights: Array<[ReligionId, number]> = [
  ["catholic", 0.35],
  ["anglican", 0.22],
  ["muslim", 0.18],
  ["pentecostal", 0.15],
  ["other", 0.06],
  ["not-stated", 0.04],
];

const reasonWeights: Array<[ReasonId, number]> = [
  ["fees", 0.32],
  ["relocation", 0.18],
  ["academic-transfer", 0.14],
  ["family-health", 0.12],
  ["discipline", 0.06],
  ["completed", 0.05],
  ["unknown", 0.13],
];

/* ---------------------------------------------------------------- Build rows */

function buildRow(
  school: (typeof schools)[number],
  definition: ClassDefinition,
  stream: string,
): CohortRow {
  const seed = `${school.id}-${definition.id}-${stream}`;
  const learners = Math.max(
    10,
    Math.round(definition.base * school.scale + variation(seed, 5)),
  );

  const boysShare = 0.47 + (hash(`${seed}-g`) % 8) / 100;
  const boys = Math.round(learners * boysShare);
  const girls = learners - boys;

  const newShare = 0.09 + (hash(`${seed}-n`) % 5) / 100;
  const newLearners = Math.round(learners * newShare);
  const continuing = learners - newLearners;

  const withdrawalRate = Math.min(
    0.16,
    Math.max(
      0.05,
      definition.withdrawal + ((hash(`${seed}-w`) % 5) - 2) / 100,
    ),
  );
  const withdrawn = Math.round(continuing * withdrawalRate);

  const boardingShare = definition.boarding * school.boardingFactor;
  const boarding = Math.min(learners, Math.round(learners * boardingShare));
  const day = learners - boarding;

  const accepted = Math.ceil(newLearners / 0.88);
  const offered = Math.ceil(accepted / 0.85);
  const interviewed = Math.ceil(offered / 0.86);
  const shortlisted = Math.ceil(interviewed / 0.82);
  const applicants = Math.ceil(shortlisted / 0.72);

  return {
    id: seed,
    schoolId: school.id,
    classId: definition.id,
    classLabel: definition.label,
    level: definition.level,
    stream,

    learners,
    boys,
    girls,
    day,
    boarding,
    capacity: Math.round(learners / 0.9),

    opening: continuing + withdrawn,
    newLearners,
    continuing,
    withdrawn,

    applicants,
    shortlisted,
    interviewed,
    offered,
    accepted,
    reported: newLearners,

    ageBands: ageBandsFor(definition, learners),
    nationalities: distribute(nationalityKeys, nationalityWeights, learners),
    religions: distribute(religionKeys, religionWeights, learners),
  };
}

const baseRows: CohortRow[] = schools.flatMap((school) =>
  classDefinitions
    .filter((definition) => definition.schools.includes(school.id))
    .flatMap((definition) =>
      streams.map((stream) => buildRow(school, definition, stream)),
    ),
);

/* --------------------------------------------------------------- Period data */

const periodFactors: Record<YearId, Record<TermId, number>> = {
  "2026/27": { t1: 0.972, t2: 1, t3: 1.011, full: 1 },
  "2025/26": { t1: 0.94, t2: 0.951, t3: 0.958, full: 0.95 },
  "2024/25": { t1: 0.908, t2: 0.917, t3: 0.924, full: 0.916 },
};

const periodFactor = (year: YearId, term: TermId) =>
  periodFactors[year][term];

function scaleRecord<T extends string>(
  source: Record<T, number>,
  keys: T[],
  factor: number,
  target: number,
): Record<T, number> {
  const result = {} as Record<T, number>;
  let allocated = 0;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      result[key] = Math.max(0, target - allocated);
      return;
    }

    const value = Math.round(source[key] * factor);

    result[key] = value;
    allocated += value;
  });

  return result;
}

function scaleRow(row: CohortRow, factor: number): CohortRow {
  const scale = (value: number) => Math.round(value * factor);

  const learners = Math.max(0, scale(row.learners));
  const boys = Math.min(learners, scale(row.boys));
  const girls = learners - boys;
  const boarding = Math.min(learners, scale(row.boarding));
  const day = learners - boarding;

  const newLearners = Math.min(learners, scale(row.newLearners));
  const continuing = learners - newLearners;
  const withdrawn = scale(row.withdrawn);

  const reported = newLearners;
  const accepted = Math.max(reported, scale(row.accepted));
  const offered = Math.max(accepted, scale(row.offered));
  const interviewed = Math.max(offered, scale(row.interviewed));
  const shortlisted = Math.max(interviewed, scale(row.shortlisted));
  const applicants = Math.max(shortlisted, scale(row.applicants));

  return {
    ...row,
    learners,
    boys,
    girls,
    day,
    boarding,

    opening: continuing + withdrawn,
    newLearners,
    continuing,
    withdrawn,

    applicants,
    shortlisted,
    interviewed,
    offered,
    accepted,
    reported,

    ageBands: scaleRecord(row.ageBands, ageBandKeys, factor, learners),
    nationalities: scaleRecord(
      row.nationalities,
      nationalityKeys,
      factor,
      learners,
    ),
    religions: scaleRecord(row.religions, religionKeys, factor, learners),
  };
}

function matchesFilters(row: CohortRow, filters: Filters) {
  return (
    (filters.school === "all" || row.schoolId === filters.school) &&
    (filters.classId === "all" || row.classId === filters.classId) &&
    (filters.stream === "all" || row.stream === filters.stream)
  );
}

/** Period-scaled rows for the selected school, class and stream. */
export function filteredRows(filters: Filters): CohortRow[] {
  const factor = periodFactor(filters.year, filters.term);

  return baseRows
    .filter((row) => matchesFilters(row, filters))
    .map((row) => scaleRow(row, factor));
}

/* ---------------------------------------------------------------- Aggregation */

const total = (rows: CohortRow[], pick: (row: CohortRow) => number) =>
  rows.reduce((sum, row) => sum + pick(row), 0);

export function aggregate(rows: CohortRow[]): Aggregate {
  const learners = total(rows, (row) => row.learners);
  const boys = total(rows, (row) => row.boys);
  const girls = total(rows, (row) => row.girls);
  const day = total(rows, (row) => row.day);
  const boarding = total(rows, (row) => row.boarding);
  const capacity = total(rows, (row) => row.capacity);
  const opening = total(rows, (row) => row.opening);
  const newLearners = total(rows, (row) => row.newLearners);
  const continuing = total(rows, (row) => row.continuing);
  const withdrawn = total(rows, (row) => row.withdrawn);

  const applicants = total(rows, (row) => row.applicants);
  const shortlisted = total(rows, (row) => row.shortlisted);
  const interviewed = total(rows, (row) => row.interviewed);
  const offered = total(rows, (row) => row.offered);
  const accepted = total(rows, (row) => row.accepted);
  const reported = total(rows, (row) => row.reported);

  const byAge: Array<Figure<AgeBandId>> = ageBandKeys.map((id) => {
    const value = total(rows, (row) => row.ageBands[id]);

    return { id, label: ageBandLabels[id], value, share: shareOf(value, learners) };
  });

  const byNationality: Array<Figure<NationalityId>> = nationalityKeys.map(
    (id) => {
      const value = total(rows, (row) => row.nationalities[id]);

      return {
        id,
        label: nationalityLabels[id],
        value,
        share: shareOf(value, learners),
      };
    },
  );

  const byReligion: Array<Figure<ReligionId>> = religionKeys.map((id) => {
    const value = total(rows, (row) => row.religions[id]);

    return {
      id,
      label: religionLabels[id],
      value,
      share: shareOf(value, learners),
    };
  });

  return {
    learners,
    boys,
    girls,
    day,
    boarding,
    capacity,
    opening,
    newLearners,
    continuing,
    withdrawn,

    applicants,
    shortlisted,
    interviewed,
    offered,
    accepted,
    reported,

    retentionRate: shareOf(continuing, continuing + withdrawn),
    withdrawalRate: shareOf(withdrawn, opening),
    utilization: shareOf(learners, capacity),
    conversionRate: shareOf(reported, applicants),
    noShowRate: shareOf(accepted - reported, accepted),
    byAge,
    byNationality,
    byReligion,
  };
}

export function aggregateFor(filters: Filters): Aggregate {
  return aggregate(filteredRows(filters));
}

/**
 * Board view: the mean of the six campuses instead of the group total.
 *
 * Counts are rounded means so a figure like "412" reads as "per school", and
 * rates are the mean of each campus's own rate — averaging the rates keeps a
 * small nursery from being drowned out by Kibuli Secondary.
 */
export function averageAcrossSchools(filters: Filters): Aggregate {
  const perSchool = schools
    .map((school) => aggregate(filteredRows({ ...filters, school: school.id })))
    .filter((entry) => entry.learners > 0 || entry.capacity > 0);

  if (perSchool.length === 0) {
    return aggregate([]);
  }

  const mean = (pick: (entry: Aggregate) => number) =>
    perSchool.reduce((sum, entry) => sum + pick(entry), 0) / perSchool.length;
  const whole = (pick: (entry: Aggregate) => number) => Math.round(mean(pick));

  const learners = whole((entry) => entry.learners);

  const figures = <T extends string>(
    keys: T[],
    labels: Record<T, string>,
    pick: (entry: Aggregate) => Array<Figure<T>>,
  ): Array<Figure<T>> =>
    keys.map((id) => {
      const value = whole(
        (entry) => pick(entry).find((figure) => figure.id === id)?.value ?? 0,
      );

      return { id, label: labels[id], value, share: shareOf(value, learners) };
    });

  return {
    learners,
    boys: whole((entry) => entry.boys),
    girls: whole((entry) => entry.girls),
    day: whole((entry) => entry.day),
    boarding: whole((entry) => entry.boarding),
    capacity: whole((entry) => entry.capacity),
    opening: whole((entry) => entry.opening),
    newLearners: whole((entry) => entry.newLearners),
    continuing: whole((entry) => entry.continuing),
    withdrawn: whole((entry) => entry.withdrawn),

    applicants: whole((entry) => entry.applicants),
    shortlisted: whole((entry) => entry.shortlisted),
    interviewed: whole((entry) => entry.interviewed),
    offered: whole((entry) => entry.offered),
    accepted: whole((entry) => entry.accepted),
    reported: whole((entry) => entry.reported),

    retentionRate: mean((entry) => entry.retentionRate),
    withdrawalRate: mean((entry) => entry.withdrawalRate),
    utilization: mean((entry) => entry.utilization),
    conversionRate: mean((entry) => entry.conversionRate),
    noShowRate: mean((entry) => entry.noShowRate),

    byAge: figures(ageBandKeys, ageBandLabels, (entry) => entry.byAge),
    byNationality: figures(
      nationalityKeys,
      nationalityLabels,
      (entry) => entry.byNationality,
    ),
    byReligion: figures(
      religionKeys,
      religionLabels,
      (entry) => entry.byReligion,
    ),
  };
}

export function classBreakdown(rows: CohortRow[]): ClassAggregate[] {
  const order = new Map(
    classDefinitions.map((definition, index) => [definition.id, index]),
  );

  return [...rows]
    .sort((left, right) => {
      const leftOrder = order.get(left.classId) ?? 0;
      const rightOrder = order.get(right.classId) ?? 0;

      return (
        leftOrder - rightOrder ||
        left.stream.localeCompare(right.stream) ||
        left.schoolId.localeCompare(right.schoolId)
      );
    })
    .map((row) => ({
      id: row.id,
      schoolId: row.schoolId,
      classId: row.classId,
      classLabel: row.classLabel,
      level: row.level,
      stream: row.stream,

      learners: row.learners,
      boys: row.boys,
      girls: row.girls,
      day: row.day,
      boarding: row.boarding,
      capacity: row.capacity,

      newLearners: row.newLearners,
      continuing: row.continuing,
      withdrawn: row.withdrawn,

      applicants: row.applicants,
      offered: row.offered,
      accepted: row.accepted,
      reported: row.reported,

      retentionRate: shareOf(row.continuing, row.continuing + row.withdrawn),
      withdrawalRate: shareOf(row.withdrawn, row.opening),
      utilization: shareOf(row.learners, row.capacity),
      conversionRate: shareOf(row.reported, row.applicants),
    }));
}

export function schoolBreakdown(rows: CohortRow[]): SchoolAggregate[] {
  return schools
    .map((school) => {
      const schoolRows = rows.filter((row) => row.schoolId === school.id);
      const learners = total(schoolRows, (row) => row.learners);
      const continuing = total(schoolRows, (row) => row.continuing);
      const withdrawn = total(schoolRows, (row) => row.withdrawn);

      return {
        id: school.id,
        name: school.name,
        learners,
        newLearners: total(schoolRows, (row) => row.newLearners),
        continuing,
        withdrawn,
        capacity: total(schoolRows, (row) => row.capacity),
        retentionRate: shareOf(continuing, continuing + withdrawn),
        utilization: shareOf(
          learners,
          total(schoolRows, (row) => row.capacity),
        ),
      };
    })
    .filter((school) => school.learners > 0);
}

export function funnelStages(summary: Aggregate): FunnelStage[] {
  const definitions = [
    { id: "applicants", label: "Applications", value: summary.applicants },
    { id: "shortlisted", label: "Shortlisted", value: summary.shortlisted },
    { id: "interviewed", label: "Interviewed", value: summary.interviewed },
    { id: "offered", label: "Offers made", value: summary.offered },
    { id: "accepted", label: "Offers accepted", value: summary.accepted },
    { id: "reported", label: "Reported / joined", value: summary.reported },
  ];

  return definitions.map((stage, index) => {
    const previous = index === 0 ? stage.value : definitions[index - 1].value;

    return {
      ...stage,
      share: shareOf(stage.value, summary.applicants),
      conversion: index === 0 ? 100 : shareOf(stage.value, previous),
    };
  });
}

export function withdrawalReasons(rows: CohortRow[]): ReasonFigure[] {
  const withdrawn = total(rows, (row) => row.withdrawn);
  let allocated = 0;

  return reasonWeights.map(([id, weight], index) => {
    const value =
      index === reasonWeights.length - 1
        ? Math.max(0, withdrawn - allocated)
        : Math.round(withdrawn * weight);

    allocated += value;

    return {
      id,
      label: reasonLabels[id],
      value,
      share: shareOf(value, withdrawn),
    };
  });
}

/* ------------------------------------------------------------- Trend / transitions */

const trendPeriods: Array<{ year: YearId; term: TermId; label: string }> = [
  { year: "2024/25", term: "t1", label: "24/25 T1" },
  { year: "2024/25", term: "t2", label: "24/25 T2" },
  { year: "2024/25", term: "t3", label: "24/25 T3" },
  { year: "2025/26", term: "t1", label: "25/26 T1" },
  { year: "2025/26", term: "t2", label: "25/26 T2" },
  { year: "2025/26", term: "t3", label: "25/26 T3" },
  { year: "2026/27", term: "t1", label: "26/27 T1" },
  { year: "2026/27", term: "t2", label: "26/27 T2" },
];

export function retentionTrend(filters: Filters): TrendPoint[] {
  return trendPeriods.map(({ year, term, label }) => {
    const rows = filteredRows({ ...filters, year, term });
    const continuing = total(rows, (row) => row.continuing);
    const withdrawn = total(rows, (row) => row.withdrawn);

    return {
      id: `${year}-${term}`,
      label,
      learners: total(rows, (row) => row.learners),
      newLearners: total(rows, (row) => row.newLearners),
      continuing,
      withdrawn,
      retentionRate: shareOf(continuing, continuing + withdrawn),
    };
  });
}

const transitionSpecs = [
  {
    id: "nursery-primary",
    label: "Nursery → Primary",
    from: "Top Class",
    to: "P.1",
    classId: "top",
    baseRate: 94.2,
  },
  {
    id: "p7-s1",
    label: "P.7 → Senior One",
    from: "P.7",
    to: "S.1",
    classId: "p7",
    baseRate: 88.6,
  },
  {
    id: "s4-s5",
    label: "Senior Four → Senior Five",
    from: "S.4",
    to: "S.5",
    classId: "s4",
    baseRate: 82.4,
  },
];

export function transitionFigures(filters: Filters): TransitionFigure[] {
  // Transitions compare whole cohorts, so class and stream filters are ignored.
  const rows = filteredRows({ ...filters, classId: "all", stream: "all" });
  const offset =
    schools.find((school) => school.id === filters.school)?.transitionOffset ??
    0;

  return transitionSpecs.map((spec) => {
    const learners = total(
      rows.filter((row) => row.classId === spec.classId),
      (row) => row.learners,
    );
    const rate =
      learners === 0
        ? 0
        : Math.min(99, Math.max(0, spec.baseRate + offset));

    return {
      id: spec.id,
      label: spec.label,
      from: spec.from,
      to: spec.to,
      learners,
      retained: Math.round((learners * rate) / 100),
      rate,
    };
  });
}

/* ------------------------------------------------------------- Learner records */

const withdrawalRecords: WithdrawalRecord[] = [
  { id: "GH-2026-0417", name: "Nakimuli Joan", schoolId: "kibuli-primary", classId: "p4", stream: "A", gender: "girls", reasonId: "fees", recordedOn: "12 Sep 2026", period: "Term 2, 2026/27" },
  { id: "GH-2026-0388", name: "Waiswa Moses", schoolId: "kibuli-secondary", classId: "s3", stream: "B", gender: "boys", reasonId: "relocation", recordedOn: "03 Sep 2026", period: "Term 2, 2026/27" },
  { id: "GH-2026-0451", name: "Akello Patience", schoolId: "buwaate-primary", classId: "p6", stream: "A", gender: "girls", reasonId: "family-health", recordedOn: "21 Sep 2026", period: "Term 2, 2026/27" },
  { id: "GH-2026-0329", name: "Kamya Ronald", schoolId: "kansanga-gis", classId: "s4", stream: "A", gender: "boys", reasonId: "academic-transfer", recordedOn: "15 Aug 2026", period: "Term 2, 2026/27" },
  { id: "GH-2026-0502", name: "Nassuna Vivian", schoolId: "kibuli-nursery", classId: "middle", stream: "A", gender: "girls", reasonId: "relocation", recordedOn: "28 Sep 2026", period: "Term 2, 2026/27" },
  { id: "GH-2026-0364", name: "Lubega Ivan", schoolId: "kibuli-secondary", classId: "s1", stream: "A", gender: "boys", reasonId: "fees", recordedOn: "09 Aug 2026", period: "Term 2, 2026/27" },
  { id: "GH-2026-0448", name: "Amongi Sarah", schoolId: "buwaate-primary", classId: "p3", stream: "B", gender: "girls", reasonId: "family-health", recordedOn: "02 Sep 2026", period: "Term 2, 2026/27" },
  { id: "GH-2026-0291", name: "Ssekandi Paul", schoolId: "kibuli-primary", classId: "p7", stream: "A", gender: "boys", reasonId: "completed", recordedOn: "30 Sep 2026", period: "Term 2, 2026/27" },
  { id: "GH-2026-0518", name: "Nalubega Maria", schoolId: "buwaate-nursery", classId: "top", stream: "B", gender: "girls", reasonId: "academic-transfer", recordedOn: "18 Sep 2026", period: "Term 2, 2026/27" },
  { id: "GH-2026-0356", name: "Ochieng Denis", schoolId: "kibuli-secondary", classId: "s2", stream: "B", gender: "boys", reasonId: "discipline", recordedOn: "11 Sep 2026", period: "Term 2, 2026/27" },
];

const atRiskRecords: AtRiskRecord[] = [
  { id: "GH-2026-0142", name: "Achieng Mercy", schoolId: "kibuli-secondary", classId: "s2", stream: "A", gender: "girls", attendance: 68, academic: 41, arrearsDays: 62, risk: "high", period: "Term 2, 2026/27" },
  { id: "GH-2026-0119", name: "Okello Brian", schoolId: "kibuli-secondary", classId: "s4", stream: "B", gender: "boys", attendance: 71, academic: 45, arrearsDays: 48, risk: "high", period: "Term 2, 2026/27" },
  { id: "GH-2026-0234", name: "Nakato Grace", schoolId: "buwaate-primary", classId: "p5", stream: "A", gender: "girls", attendance: 74, academic: 52, arrearsDays: 31, risk: "medium", period: "Term 2, 2026/27" },
  { id: "GH-2026-0207", name: "Mugisha Daniel", schoolId: "kansanga-gis", classId: "s3", stream: "B", gender: "boys", attendance: 62, academic: 38, arrearsDays: 74, risk: "high", period: "Term 2, 2026/27" },
  { id: "GH-2026-0176", name: "Namutebi Sarah", schoolId: "kibuli-primary", classId: "p6", stream: "A", gender: "girls", attendance: 81, academic: 58, arrearsDays: 12, risk: "low", period: "Term 2, 2026/27" },
  { id: "GH-2026-0134", name: "Byaruhanga Peter", schoolId: "kibuli-secondary", classId: "s1", stream: "B", gender: "boys", attendance: 77, academic: 49, arrearsDays: 27, risk: "medium", period: "Term 2, 2026/27" },
  { id: "GH-2026-0261", name: "Atim Faith", schoolId: "buwaate-primary", classId: "p2", stream: "A", gender: "girls", attendance: 69, academic: 44, arrearsDays: 55, risk: "high", period: "Term 2, 2026/27" },
  { id: "GH-2026-0158", name: "Ssemakula Joel", schoolId: "kibuli-primary", classId: "p3", stream: "B", gender: "boys", attendance: 83, academic: 61, arrearsDays: 8, risk: "low", period: "Term 2, 2026/27" },
  { id: "GH-2026-0482", name: "Kirabo Esther", schoolId: "kibuli-nursery", classId: "top", stream: "A", gender: "girls", attendance: 72, academic: 47, arrearsDays: 36, risk: "medium", period: "Term 2, 2026/27" },
  { id: "GH-2026-0225", name: "Tumusiime Mark", schoolId: "buwaate-primary", classId: "p5", stream: "B", gender: "boys", attendance: 66, academic: 40, arrearsDays: 68, risk: "high", period: "Term 2, 2026/27" },
  { id: "GH-2026-0163", name: "Nankya Diana", schoolId: "kansanga-gis", classId: "s2", stream: "B", gender: "girls", attendance: 79, academic: 55, arrearsDays: 19, risk: "medium", period: "Term 2, 2026/27" },
  { id: "GH-2026-0496", name: "Opio Samuel", schoolId: "kansanga-gis", classId: "p1", stream: "A", gender: "boys", attendance: 85, academic: 63, arrearsDays: 5, risk: "low", period: "Term 2, 2026/27" },
];

function learnerInScope(filters: Filters) {
  return (record: { schoolId: SchoolId; classId: string; stream: string }) =>
    (filters.school === "all" || record.schoolId === filters.school) &&
    (filters.classId === "all" || record.classId === filters.classId) &&
    (filters.stream === "all" || record.stream === filters.stream);
}

function learnerMatchesQuery(filters: Filters) {
  const query = filters.student.trim().toLowerCase();

  return (record: { name: string; id: string }) =>
    query === "" ||
    record.name.toLowerCase().includes(query) ||
    record.id.toLowerCase().includes(query);
}

export interface LearnerMatches {
  withdrawals: WithdrawalRecord[];
  atRisk: AtRiskRecord[];
  count: number;
}

export function learnerMatches(filters: Filters): LearnerMatches {
  const inScope = learnerInScope(filters);
  const matchesQuery = learnerMatchesQuery(filters);
  const withdrawals = withdrawalRecords.filter(
    (record) => inScope(record) && matchesQuery(record),
  );
  const atRisk = atRiskRecords
    .filter((record) => inScope(record) && matchesQuery(record))
    .sort((left, right) => riskOrder[right.risk] - riskOrder[left.risk]);

  return { withdrawals, atRisk, count: withdrawals.length + atRisk.length };
}

const riskOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };

export const riskLabels = { high: "High", medium: "Medium", low: "Low" } as const;

export const riskReasons = {
  high: "Multiple indicators breached",
  medium: "One or two indicators breached",
  low: "Monitor only",
} as const;

/** Classes that exist in the selected school (or all schools). */
export function classOptionsFor(school: SchoolSelection): ClassDefinition[] {
  return classDefinitions.filter(
    (definition) =>
      school === "all" || definition.schools.includes(school),
  );
}

/* ------------------------------------------------------------------- Grouping */

export type DrillDimension = "school" | "class" | "stream";

export interface EnrolmentGroup {
  key: string;
  label: string;
  learners: number;
  boys: number;
  girls: number;
  newLearners: number;
  continuing: number;
  withdrawn: number;
  capacity: number;
  retentionRate: number;
  utilization: number;
}

const groupKeyFor = (row: CohortRow, dimension: DrillDimension) =>
  dimension === "school"
    ? row.schoolId
    : dimension === "class"
      ? row.classId
      : row.stream;

const groupLabelFor = (row: CohortRow, dimension: DrillDimension) =>
  dimension === "school"
    ? schoolNameFor(row.schoolId)
    : dimension === "class"
      ? row.classLabel
      : `Stream ${row.stream}`;

const classOrder = new Map(
  classDefinitions.map((definition, index) => [definition.id, index]),
);

/** Rolls the rows up into the dimension the learner is drilling into. */
export function groupRows(
  rows: CohortRow[],
  dimension: DrillDimension,
): EnrolmentGroup[] {
  const groups = new Map<string, EnrolmentGroup>();

  rows.forEach((row) => {
    const key = groupKeyFor(row, dimension);
    const group = groups.get(key) ?? {
      key,
      label: groupLabelFor(row, dimension),
      learners: 0,
      boys: 0,
      girls: 0,
      newLearners: 0,
      continuing: 0,
      withdrawn: 0,
      capacity: 0,
      retentionRate: 0,
      utilization: 0,
    };

    group.learners += row.learners;
    group.boys += row.boys;
    group.girls += row.girls;
    group.newLearners += row.newLearners;
    group.continuing += row.continuing;
    group.withdrawn += row.withdrawn;
    group.capacity += row.capacity;

    groups.set(key, group);
  });

  return [...groups.values()]
    .map((group) => ({
      ...group,
      retentionRate: shareOf(group.continuing, group.continuing + group.withdrawn),
      utilization: shareOf(group.learners, group.capacity),
    }))
    .sort((left, right) => {
      if (dimension === "school") {
        return (
          allSchools.indexOf(left.key as SchoolId) -
          allSchools.indexOf(right.key as SchoolId)
        );
      }

      if (dimension === "class") {
        return (
          (classOrder.get(left.key) ?? 0) - (classOrder.get(right.key) ?? 0)
        );
      }

      return left.key.localeCompare(right.key);
    });
}

/* ------------------------------------------------------------ Learner roster */

const givenNames = [
  "Amina", "Brian", "Cynthia", "David", "Esther", "Frank", "Grace", "Hassan",
  "Irene", "Joel", "Kevin", "Lydia", "Moses", "Naomi", "Peter", "Ruth",
  "Sarah", "Timothy", "Vivian", "Wilson", "Yasmin", "Zainab", "Allan",
  "Betty", "Charles", "Diana", "Emmanuel", "Faith", "Gloria", "Herbert",
  "Isaac", "Janet", "Kenneth", "Lillian", "Martin", "Nancy", "Patrick",
  "Rebecca", "Samuel", "Teddy", "Umar", "Victoria",
];

const familyNames = [
  "Nakato", "Okello", "Mugisha", "Namuli", "Ssemakula", "Atim", "Kiiza",
  "Achieng", "Byaruhanga", "Nankya", "Kamya", "Nassuna", "Lubega", "Amongi",
  "Opio", "Namutebi", "Tumusiime", "Kirabo", "Waiswa", "Akello", "Ochieng",
  "Ssekandi", "Nalubega", "Mukasa", "Nabirye", "Kabuye",
];

const classAgeBase: Record<string, number> = {
  baby: 3,
  middle: 4,
  top: 5,
  p1: 6,
  p2: 7,
  p3: 8,
  p4: 9,
  p5: 10,
  p6: 11,
  p7: 12,
  s1: 13,
  s2: 14,
  s3: 15,
  s4: 16,
  s5: 17,
  s6: 18,
};

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export interface RosterLearner {
  id: string;
  name: string;
  gender: "Girl" | "Boy";
  age: number;
  mode: "Day" | "Boarding";
  status: "New" | "Continuing";
  schoolId: SchoolId;
  schoolName: string;
  classId: string;
  classLabel: string;
  stream: string;
  enrolled: string;
  applied: string | null;
  admitted: string | null;
}

/** Deterministic ordering so the same cohort always renders the same learners. */
function stableOrder(count: number, seed: string): number[] {
  return Array.from({ length: count }, (_, index) => index).sort(
    (left, right) =>
      hash(`${seed}-o-${left}`) - hash(`${seed}-o-${right}`) ||
      left - right,
  );
}

/**
 * Expands cohorts into individual learners so the drill-down can end on a
 * named learner instead of a number. Figures stay consistent with the row.
 */
export function learnerRoster(
  rows: CohortRow[],
  year: YearId,
): RosterLearner[] {
  const startYear = Number(year.slice(0, 4));
  const learners: RosterLearner[] = [];
  const usedNames = new Set<string>();

  rows.forEach((row) => {
    const order = stableOrder(row.learners, row.id);
    const ageBase = classAgeBase[row.classId] ?? 8;

    order.forEach((index, position) => {
      const seed = `${row.id}-${index}`;
      const h = hash(seed);

      let attempt = 0;
      let name = "";

      do {
        const nameHash = hash(`${seed}-${attempt}`);
        name = `${givenNames[nameHash % givenNames.length]} ${
          familyNames[Math.floor(nameHash / givenNames.length + attempt) %
            familyNames.length]
        }`;
        attempt += 1;
      } while (usedNames.has(name) && attempt < 14);

      usedNames.add(name);

      const isNew = position < row.newLearners;
      const appliedMonth = 8 + (h % 3);
      const reportMonth = h % 2;

      learners.push({
        id: `GH-${startYear}-${1000 + (h % 9000)}`,
        name,
        gender: position < row.boys ? "Boy" : "Girl",
        age: ageBase + (h % 2),
        mode: position < row.boarding ? "Boarding" : "Day",
        status: isNew ? "New" : "Continuing",
        schoolId: row.schoolId,
        schoolName: schoolNameFor(row.schoolId),
        classId: row.classId,
        classLabel: row.classLabel,
        stream: row.stream,
        enrolled: isNew
          ? `${monthNames[reportMonth]} ${startYear}`
          : `${monthNames[h % 6]} ${startYear - 1 - (h % 3)}`,
        applied: isNew
          ? `${1 + (h % 27)} ${monthNames[appliedMonth]} ${startYear - 1}`
          : null,
        admitted: isNew
          ? `${1 + ((h >> 3) % 27)} Nov ${startYear - 1}`
          : null,
      });
    });
  });

  return learners.sort((left, right) => left.name.localeCompare(right.name));
}

/** The academic year immediately before `year`, or null when there is none. */
export function previousYearFor(year: YearId): YearId | null {
  const index = years.indexOf(year);

  return index >= 0 && index + 1 < years.length ? years[index + 1] : null;
}
