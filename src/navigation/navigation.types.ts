import type { LucideIcon } from "lucide-react";

export interface NavigationChild {
  id: string;
  label: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  children: NavigationChild[];
  expandable?: boolean;
}