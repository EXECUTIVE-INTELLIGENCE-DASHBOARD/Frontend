import { ChevronDown } from "lucide-react";

import type { FilterControl } from "./studentEnrollment.types";

interface FilterCardProps {
  control: FilterControl;
}

export function FilterCard({ control }: FilterCardProps) {
  return (
    <button type="button" className="se-filter">
      <span className="se-filter__label">{control.label}</span>

      <span className="se-filter__value">
        {control.value}
        <ChevronDown size={16} aria-hidden="true" />
      </span>
    </button>
  );
}
