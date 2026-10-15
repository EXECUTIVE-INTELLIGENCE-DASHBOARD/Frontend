import type {
  CampusKey,
  CampusRow,
  EnrollmentSummary,
  TierId,
  TierRow,
} from "./studentEnrollment.types";

export const allCampusesLabel = "All Campuses";

export const campuses: Array<{
  key: CampusKey;
  label: string;
  chartLabel: string;
}> = [
  { key: "kibuli", label: "Kibuli Main Campus", chartLabel: "Kibuli Main" },
  { key: "buwaate", label: "Buwaate Campus", chartLabel: "Buwaate" },
  {
    key: "annex",
    label: "Annex / Preschool Branch",
    chartLabel: "Annex Preschool",
  },
];

/* Boys and girls per campus come from the design reference. */
const genderByCampus: Record<CampusKey, { boys: number; girls: number }> = {
  kibuli: { boys: 640, girls: 610 },
  buwaate: { boys: 430, girls: 420 },
  annex: { boys: 360, girls: 340 },
};

export const tiers: Array<{ id: TierId; label: string }> = [
  { id: "nursery", label: "Nursery" },
  { id: "primary", label: "Primary" },
  { id: "olevel", label: "O-Level" },
  { id: "alevel", label: "A-Level" },
];

/*
 * Sample enrolment per tier and campus. The three campuses add up to the
 * tier totals in the reference (450, 1,450, 650 and 250) and each campus adds
 * up to its own total (1,250, 850 and 700).
 */
const tiersByCampus: Record<CampusKey, Record<TierId, number>> = {
  kibuli: { nursery: 120, primary: 580, olevel: 400, alevel: 150 },
  buwaate: { nursery: 80, primary: 420, olevel: 250, alevel: 100 },
  annex: { nursery: 250, primary: 450, olevel: 0, alevel: 0 },
};

/* Admissions conversion and capacity use, in percent (sample per campus). */
const headlineByCampus: Record<
  CampusKey | "all",
  { conversion: number; capacity: number }
> = {
  kibuli: { conversion: 86.0, capacity: 93.5 },
  buwaate: { conversion: 83.2, capacity: 89.4 },
  annex: { conversion: 82.0, capacity: 88.0 },
  all: { conversion: 84.5, capacity: 91.2 },
};

export const formatNumber = (value: number) => value.toLocaleString("en-US");

const selectedCampuses = (label: string) => {
  const match = campuses.find((campus) => campus.label === label);

  return match ? [match] : campuses;
};

/** The bars for the campus chart: one campus, or all three. */
export function campusRowsFor(label: string): CampusRow[] {
  return selectedCampuses(label).map((campus) => {
    const { boys, girls } = genderByCampus[campus.key];

    return {
      key: campus.key,
      label: campus.chartLabel,
      boys,
      girls,
      total: boys + girls,
    };
  });
}

/** The bars for the tier chart, with each tier's share of the selection. */
export function tierRowsFor(label: string): TierRow[] {
  const keys = selectedCampuses(label).map((campus) => campus.key);

  const values = tiers.map((tier) => ({
    ...tier,
    value: keys.reduce((sum, key) => sum + tiersByCampus[key][tier.id], 0),
  }));

  const total = values.reduce((sum, tier) => sum + tier.value, 0);

  return values.map((tier) => ({
    ...tier,
    share: total === 0 ? 0 : (tier.value / total) * 100,
  }));
}

/** The three headline cards and the gender ratio for a campus. */
export function summaryFor(label: string): EnrollmentSummary {
  const rows = campusRowsFor(label);
  const campus = campuses.find((item) => item.label === label);
  const headline = headlineByCampus[campus ? campus.key : "all"];

  const boys = rows.reduce((sum, row) => sum + row.boys, 0);
  const girls = rows.reduce((sum, row) => sum + row.girls, 0);

  return {
    total: boys + girls,
    boys,
    girls,
    conversion: headline.conversion,
    capacity: headline.capacity,
  };
}

/** A chart scale with four steps, e.g. 0 to 800 in steps of 200. */
export function niceScale(max: number): { step: number; top: number } {
  const steps = [50, 100, 200, 250, 400, 500, 1000, 2000];
  const step = steps.find((candidate) => candidate * 4 >= max) ?? 2000;

  return { step, top: step * 4 };
}
