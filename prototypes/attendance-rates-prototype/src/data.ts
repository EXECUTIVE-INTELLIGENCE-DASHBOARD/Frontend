import type {
  ClassComparisonEntry,
  GroupPoint,
  InterventionRow,
  StatItem,
  TrendPoint,
} from './types';

export const stats: StatItem[] = [
  {
    id: 'rate',
    label: 'Attendance Rate',
    value: '96.5%',
    caption: 'Tracking attendance rate',
    tone: 'green',
  },
  {
    id: 'followup',
    label: 'Learners to Follow Up',
    value: '24',
    caption: 'Learners requiring additional support',
    tone: 'amber',
  },
  {
    id: 'declining',
    label: 'Declining Classes',
    value: '3',
    caption: 'Classes with falling attendance',
    tone: 'red',
  },
];

export const trendData: TrendPoint[] = [
  { label: 'Week 1', seriesA: 62, seriesB: 48, seriesC: 71 },
  { label: 'Week 2', seriesA: 68, seriesB: 55, seriesC: 66 },
  { label: 'Week 3', seriesA: 58, seriesB: 61, seriesC: 74 },
  { label: 'Week 4', seriesA: 72, seriesB: 58, seriesC: 69 },
  { label: 'Week 5', seriesA: 66, seriesB: 64, seriesC: 80 },
  { label: 'Week 6', seriesA: 78, seriesB: 69, seriesC: 76 },
  { label: 'Week 7', seriesA: 71, seriesB: 74, seriesC: 84 },
  { label: 'Week 8', seriesA: 82, seriesB: 70, seriesC: 79 },
];

export const groupData: GroupPoint[] = [
  { label: 'Grade 7', seriesA: 96, seriesB: 91, seriesC: 88 },
  { label: 'Grade 8', seriesA: 94, seriesB: 89, seriesC: 92 },
  { label: 'Grade 9', seriesA: 97, seriesB: 93, seriesC: 90 },
  { label: 'Grade 10', seriesA: 92, seriesB: 95, seriesC: 87 },
  { label: 'Grade 11', seriesA: 95, seriesB: 90, seriesC: 93 },
];

export const classComparison: ClassComparisonEntry[] = [
  { kind: 'Class', name: '9A', term1: 95.4, term2: 96.1, term3: 96.7, change: 1.3, flag: 'Effective', tone: 'green' },
  { kind: 'Class', name: '9B', term1: 93.8, term2: 94.2, term3: 93.5, change: -0.7, flag: 'Decreasing', tone: 'red' },
  { kind: 'Grade', name: 'Grade 10', term1: 95.2, term2: 95.8, term3: 96.4, change: 1.2, flag: 'Effective', tone: 'green' },
  { kind: 'Class', name: '11A', term1: 92.1, term2: 92.8, term3: 91.6, change: -1.2, flag: 'Declining', tone: 'red' },
  { kind: 'Class', name: '11B', term1: 94.0, term2: 93.5, term3: 93.9, change: -0.1, flag: 'Stable', tone: 'slate' },
  { kind: 'Group', name: 'Boarders', term1: 97.1, term2: 96.8, term3: 97.4, change: 0.6, flag: 'Effective', tone: 'green' },
  { kind: 'Group', name: 'Day Scholars', term1: 95.6, term2: 96.2, term3: 96.9, change: 1.3, flag: 'Trending up', tone: 'blue' },
];

export const interventionQueue: InterventionRow[] = [
  {
    band: 'Class 11A',
    bandMeta: 'Grade 11',
    signal: '3 learners',
    signalMeta: '92.1% attendance',
    action: 'Increase attendance support for cohort',
    owner: 'Class Teacher',
    ownerMeta: 'S. Whitfield',
    due: '04 Sep 2026',
    status: 'In progress',
    tone: 'amber',
  },
  {
    band: 'Class 9B',
    bandMeta: 'Grade 9',
    signal: '2 learners',
    signalMeta: '93.5% attendance',
    action: 'Parent meeting scheduled',
    owner: 'Head of Year',
    ownerMeta: 'M. Hussain',
    due: '05 Sep 2026',
    status: 'Not started',
    tone: 'slate',
  },
  {
    band: 'Grade 10',
    bandMeta: 'Whole year',
    signal: '5 learners',
    signalMeta: 'Below 90% attendance',
    action: 'Review feedback and intervention plan',
    owner: 'Deputy Head',
    ownerMeta: 'A. Bennett',
    due: '06 Sep 2026',
    status: 'Overdue',
    tone: 'red',
  },
  {
    band: 'Class 11B',
    bandMeta: 'Grade 11',
    signal: '1 learner',
    signalMeta: '93.9% attendance',
    action: 'Weekly attendance review',
    owner: 'Class Teacher',
    ownerMeta: 'R. Okoro',
    due: '08 Sep 2026',
    status: 'In progress',
    tone: 'amber',
  },
];

export const campuses = ['All Campuses', 'Greenhill Main', 'Greenhill North'];
export const academicYears = ['AY 2025/2026', 'AY 2024/2025', 'AY 2023/2024'];
