/**
 * A single filter in the compact row above the KPI cards.
 *
 * The visible "control" is a styled `<div>`; the real, accessible control is a
 * native `<select>` stretched invisibly over it (`.exp-filter__select` in
 * `ExpenseManagement.css`). The two `aria-hidden` spans mirror what the select
 * currently shows.
 *
 * Why not just style the `<select>` directly? A native select renders its
 * chosen value using OS/font rules that cannot be matched to the design, and
 * it cannot show a separate small caption above the value. Stacking a real
 * select on top keeps full keyboard and screen-reader support while letting
 * the visual layer be pure markup.
 *
 * The selected value is local `useState`, so picking an option changes the
 * caption but does not yet filter any data — these controls are presentational
 * placeholders for a future API-driven filter.
 */
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { FilterControl } from "./expenseManagement.types";

interface FilterCardProps {
  control: FilterControl;
}

export function FilterCard({ control }: FilterCardProps) {
  // Seeded from the data module's default (always the "All ..." option).
  const [value, setValue] = useState(control.value);

  return (
    <div className="exp-filter">
      {/* Visual layer only — never read by assistive tech. */}
      <span className="exp-filter__label" aria-hidden="true">
        {control.label}
      </span>

      <span className="exp-filter__value" aria-hidden="true">
        {value}
        <ChevronDown size={16} aria-hidden="true" />
      </span>

      {/* Keyboard/screen-reader layer, positioned over the visual layer. */}
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