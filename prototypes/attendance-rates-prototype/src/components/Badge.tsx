import type { ReactNode } from 'react';
import type { FlagTone } from '../types';

interface BadgeProps {
  tone?: FlagTone;
  children: ReactNode;
}

export function Badge({ tone = 'slate', children }: BadgeProps) {
  return <span className={`badge tone-${tone}`}>{children}</span>;
}
