import { ChevronDown } from "lucide-react";

import type { FilterControl } from "./myChildProgress.types";

interface FilterCardProps {
  control: FilterControl;
}

export function FilterCard({ control }: FilterCardProps) {
  return (
    <button type="button" className="mc-filter">
      <span className="mc-filter__label">{control.label}</span>

      <span className="mc-filter__value">
        {control.value}
        <ChevronDown size={16} aria-hidden="true" />
      </span>
    </button>
  );
}
