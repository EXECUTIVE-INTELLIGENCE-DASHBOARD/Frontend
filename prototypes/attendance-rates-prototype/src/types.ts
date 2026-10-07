export type FlagTone = 'green' | 'amber' | 'red' | 'slate' | 'blue';

export interface ClassComparisonRow {
  kind: string;
  name: string;
  term1: number;
  term2: number;
  term3: number;
  change: number;
}

export interface ClassComparisonEntry extends ClassComparisonRow {
  flag: string;
  tone: FlagTone;
}

export interface InterventionRow {
  band: string;
  bandMeta?: string;
  signal: string;
  signalMeta?: string;
  action: string;
  owner: string;
  ownerMeta?: string;
  due: string;
  status: string;
  tone: FlagTone;
}

export interface TrendPoint {
  label: string;
  seriesA: number;
  seriesB: number;
  seriesC: number;
}

export interface GroupPoint {
  label: string;
  seriesA: number;
  seriesB: number;
  seriesC: number;
}

export interface StatItem {
  id: string;
  label: string;
  value: string;
  caption: string;
  tone: FlagTone;
}
