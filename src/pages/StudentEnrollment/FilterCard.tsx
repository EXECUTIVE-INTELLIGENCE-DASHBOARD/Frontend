import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { FilterControl } from "./studentEnrollment.types";

interface FilterCardProps {
  control: FilterControl;
}

export function FilterCard({ control }: FilterCardProps) {
  const [value, setValue] = useState(control.value);

  return (
    <div className="se-filter">
      <span className="se-filter__label" aria-hidden="true">
        {control.label}
      </span>

      <span className="se-filter__value" aria-hidden="true">
        {value}
        <ChevronDown size={16} aria-hidden="true" />
      </span>

      <select
        className="se-filter__select"
        aria-label={control.label}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      >
        {control.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
