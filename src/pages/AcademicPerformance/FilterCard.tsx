import { ChevronDown } from "lucide-react";

import type { FilterControl } from "./academicPerformance.types";

interface FilterCardProps {
  control: FilterControl;
}

export function FilterCard({ control }: FilterCardProps) {
  return (
    <button type="button" className="ap-filter">
      <span className="ap-filter__label">{control.label}</span>

      <span className="ap-filter__value">
        {control.value}
        <ChevronDown size={16} aria-hidden="true" />
      </span>
    </button>
  );
}
