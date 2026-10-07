import { Activity, TrendingDown, Users } from 'lucide-react';
import type { StatItem } from '../types';

const ICONS = {
  rate: Activity,
  followup: Users,
  declining: TrendingDown,
} as const;

interface StatCardProps {
  stat: StatItem;
}

export function StatCard({ stat }: StatCardProps) {
  const Icon = ICONS[stat.id as keyof typeof ICONS] ?? Activity;

  return (
    <article className="stat-card">
      <div className={`stat-card__icon tone-${stat.tone}`}>
        <Icon size={20} strokeWidth={2} aria-hidden />
      </div>
      <div>
        <p className="stat-card__label">{stat.label}</p>
        <p className="stat-card__value">{stat.value}</p>
        <p className="stat-card__caption">{stat.caption}</p>
      </div>
    </article>
  );
}
