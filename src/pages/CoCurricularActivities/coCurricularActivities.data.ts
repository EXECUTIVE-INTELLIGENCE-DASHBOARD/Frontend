import type {
  Activity,
  ActivityFigures,
  ActivityRow,
  CampusKey,
  EngagementSummary,
} from "./coCurricularActivities.types";

export const prototypeNote =
  "Prototype view: figures are sample data until the co-curricular API is connected.";

export const allCampusesLabel = "All Campuses";

export const campuses: Array<{ key: CampusKey; label: string }> = [
  { key: "kibuli", label: "Kibuli Main Campus" },
  { key: "buwaate", label: "Buwaate Campus" },
  { key: "annex", label: "Annex / Preschool Branch" },
];

export const campusOptions = [
  allCampusesLabel,
  ...campuses.map((campus) => campus.label),
];

export const allDomainsLabel = "All domains";

export const activities: Activity[] = [
  {
    id: "mun",
    name: "Model United Nations & Debate",
    domain: "Humanities & Diplomacy",
    icon: "globe",
  },
  {
    id: "robotics",
    name: "Robotics & STEM Innovation",
    domain: "Science & Tech Academy",
    icon: "cpu",
  },
  {
    id: "track",
    name: "Track & Field Athletics",
    domain: "Sports Federation",
    icon: "medal",
  },
  {
    id: "orchestra",
    name: "Symphony Orchestra & Choral Society",
    domain: "Performing Arts",
    icon: "music",
  },
  {
    id: "eco",
    name: "Green Earth & Eco Conservation",
    domain: "Community & Environment",
    icon: "leaf",
  },
];

export const domainOptions = [
  allDomainsLabel,
  ...Array.from(new Set(activities.map((activity) => activity.domain))),
];

/*
 * Sample figures per campus. The three campuses add up to the
 * "All Campuses" figures in the design reference, so the filter changes
 * the numbers without breaking the totals.
 */
const figuresByCampus: Record<CampusKey, Record<string, ActivityFigures>> = {
  kibuli: {
    mun: { events: 7, girls: 90, boys: 60, nonParticipatory: 12 },
    robotics: { events: 9, girls: 72, boys: 58, nonParticipatory: 20 },
    track: { events: 11, girls: 65, boys: 75, nonParticipatory: 18 },
    orchestra: { events: 6, girls: 62, boys: 38, nonParticipatory: 25 },
    eco: { events: 5, girls: 50, boys: 30, nonParticipatory: 10 },
  },
  buwaate: {
    mun: { events: 5, girls: 63, boys: 42, nonParticipatory: 9 },
    robotics: { events: 6, girls: 51, boys: 40, nonParticipatory: 14 },
    track: { events: 8, girls: 46, boys: 53, nonParticipatory: 12 },
    orchestra: { events: 4, girls: 44, boys: 26, nonParticipatory: 18 },
    eco: { events: 4, girls: 35, boys: 21, nonParticipatory: 7 },
  },
  annex: {
    mun: { events: 2, girls: 27, boys: 18, nonParticipatory: 4 },
    robotics: { events: 3, girls: 22, boys: 17, nonParticipatory: 6 },
    track: { events: 3, girls: 19, boys: 22, nonParticipatory: 5 },
    orchestra: { events: 2, girls: 19, boys: 11, nonParticipatory: 7 },
    eco: { events: 1, girls: 15, boys: 9, nonParticipatory: 3 },
  },
};

/** Events and competitions held per campus, and the coverage rate. */
const headlineByCampus: Record<
  CampusKey | "all",
  { coverageRate: number; events: number }
> = {
  kibuli: { coverageRate: 95.1, events: 28 },
  buwaate: { coverageRate: 93.6, events: 20 },
  annex: { coverageRate: 92.4, events: 9 },
  all: { coverageRate: 94.2, events: 57 },
};

const campusKeyFor = (campusLabel: string): CampusKey | "all" =>
  campuses.find((campus) => campus.label === campusLabel)?.key ?? "all";

const toRow = (activity: Activity, figures: ActivityFigures): ActivityRow => ({
  ...activity,
  events: figures.events,
  girls: figures.girls,
  boys: figures.boys,
  attended: figures.girls + figures.boys,
  nonParticipatory: figures.nonParticipatory,
});

/** The table rows for a campus. "All Campuses" adds the three campuses up. */
export function rowsForCampus(campusLabel: string): ActivityRow[] {
  const key = campusKeyFor(campusLabel);

  return activities.map((activity) => {
    if (key !== "all") {
      return toRow(activity, figuresByCampus[key][activity.id]);
    }

    const total = campuses.reduce<ActivityFigures>(
      (sum, campus) => {
        const figures = figuresByCampus[campus.key][activity.id];

        return {
          events: sum.events + figures.events,
          girls: sum.girls + figures.girls,
          boys: sum.boys + figures.boys,
          nonParticipatory: sum.nonParticipatory + figures.nonParticipatory,
        };
      },
      { events: 0, girls: 0, boys: 0, nonParticipatory: 0 },
    );

    return toRow(activity, total);
  });
}

/** The three headline cards for a campus. */
export function summaryForCampus(campusLabel: string): EngagementSummary {
  const key = campusKeyFor(campusLabel);
  const rows = rowsForCampus(campusLabel);
  const headline = headlineByCampus[key];

  const nonParticipating = rows.reduce(
    (sum, row) => sum + row.nonParticipatory,
    0,
  );
  const attended = rows.reduce((sum, row) => sum + row.attended, 0);
  const clubEvents = rows.reduce((sum, row) => sum + row.events, 0);

  const percent = (part: number, whole: number) =>
    whole === 0 ? 0 : Math.round((part / whole) * 100);

  return {
    coverageRate: headline.coverageRate,
    events: headline.events,
    nonParticipating,
    progress: {
      coverage: headline.coverageRate,
      events: percent(headline.events, clubEvents),
      nonParticipating: percent(nonParticipating, attended + nonParticipating),
    },
  };
}

/** Rows for a campus, narrowed to one domain when one is chosen. */
export function filterRowsByDomain(
  rows: ActivityRow[],
  domain: string,
): ActivityRow[] {
  return domain === allDomainsLabel
    ? rows
    : rows.filter((row) => row.domain === domain);
}
