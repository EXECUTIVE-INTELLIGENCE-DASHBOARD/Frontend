import { ChevronDown } from "lucide-react";

import type { FilterControl } from "./attendanceRates.types";

interface FilterCardProps {
  control: FilterControl;
  value: string;
  onChange: (value: string) => void;
}

export function FilterCard({ control, value, onChange }: FilterCardProps) {
  const selectId = `ar-filter-${control.id}`;

  return (
    <div className="ar-filter">
      <label className="ar-filter__label" htmlFor={selectId}>
        {control.label}
      </label>

      <div className="ar-filter__control">
        <select
          id={selectId}
          className="ar-filter__select"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {control.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          className="ar-filter__caret"
          size={16}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
