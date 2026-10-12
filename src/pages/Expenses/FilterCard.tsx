import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { FilterControl } from "./Expenses.types";

interface FilterCardProps {
  control: FilterControl;
}

export function FilterCard({ control }: FilterCardProps) {
  const [value, setValue] = useState(control.value);

  return (
    <div className="exp-filter">
      <span className="exp-filter__label" aria-hidden="true">
        {control.label}
      </span>

      <span className="exp-filter__value" aria-hidden="true">
        {value}
        <ChevronDown size={16} aria-hidden="true" />
      </span>

      <select
        className="exp-filter__select"
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