import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SelectFieldProps {
  label: string;
  icon: LucideIcon;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export function SelectField({
  label,
  icon: Icon,
  value,
  options,
  onChange,
}: SelectFieldProps) {
  const id = `select-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="select-field">
      <label className="select-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="select-field__control">
        <Icon size={15} aria-hidden />
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="select-field__caret" size={15} aria-hidden />
      </div>
    </div>
  );
}
