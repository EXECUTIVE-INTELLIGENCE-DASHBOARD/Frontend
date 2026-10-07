import { ChevronDown } from "lucide-react";

import type { FilterControl } from "./libraryResourceUsage.types";

interface FilterCardProps {
  control: FilterControl;
}

export function FilterCard({ control }: FilterCardProps) {
  return (
    <button type="button" className="lr-filter">
      <span className="lr-filter__label">{control.label}</span>

      <span className="lr-filter__value">
        {control.value}
        <ChevronDown size={16} aria-hidden="true" />
      </span>
    </button>
  );
}
