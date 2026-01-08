"use client";

import { forwardRef, SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", options, placeholder, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`flex h-9 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = "Select";

export { Select };
