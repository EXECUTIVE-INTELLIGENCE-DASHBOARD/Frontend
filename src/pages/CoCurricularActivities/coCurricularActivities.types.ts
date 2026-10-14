export type CampusKey = "kibuli" | "buwaate" | "annex";

export type ActivityIcon = "globe" | "cpu" | "medal" | "music" | "leaf";

export interface Activity {
  id: string;
  name: string;
  /** The society / domain the club belongs to. */
  domain: string;
  icon: ActivityIcon;
}

/** Raw figures for one club on one campus. */
export interface ActivityFigures {
  events: number;
  girls: number;
  boys: number;
  nonParticipatory: number;
}

/** One table row: a club with its figures for the selected campus. */
export interface ActivityRow extends Activity {
  events: number;
  attended: number;
  girls: number;
  boys: number;
  nonParticipatory: number;
}

export interface EngagementSummary {
  /** Share of learners taking part in at least one club, in percent. */
  coverageRate: number;
  /** Events and competitions held. */
  events: number;
  /** Learners not taking part in any club. */
  nonParticipating: number;
  /** Bar fill for each card, 0 to 100. */
  progress: {
    coverage: number;
    events: number;
    nonParticipating: number;
  };
}