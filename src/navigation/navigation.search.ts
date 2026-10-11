import { navigationItems } from "./navigation.config";

export interface NavigationSearchResult {
  id: string;
  label: string;
  group: string;
}

/** Every navigable destination, flattened to one searchable list. */
const searchIndex: NavigationSearchResult[] = navigationItems.flatMap((item) =>
  item.children.length > 0
    ? item.children.map((child) => ({
        id: child.id,
        label: child.label,
        group: item.label,
      }))
    : [{ id: item.id, label: item.label, group: "Dashboards" }],
);

/**
 * Case-insensitive page search. Label matches that start with the term rank
 * above matches found elsewhere in the label or its parent section.
 */
export function searchNavigation(
  query: string,
  limit = 6,
): NavigationSearchResult[] {
  const term = query.trim().toLowerCase();

  if (term.length === 0) {
    return [];
  }

  const prefixMatches: NavigationSearchResult[] = [];
  const otherMatches: NavigationSearchResult[] = [];

  for (const entry of searchIndex) {
    const label = entry.label.toLowerCase();

    if (label.startsWith(term)) {
      prefixMatches.push(entry);
    } else if (`${label} ${entry.group.toLowerCase()}`.includes(term)) {
      otherMatches.push(entry);
    }
  }

  return [...prefixMatches, ...otherMatches].slice(0, limit);
}
