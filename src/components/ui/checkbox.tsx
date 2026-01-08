"use client";

import { forwardRef, InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", label, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={`h-4 w-4 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          {...props}
        />
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-sm font-medium leading-none cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
