import type { ReactNode } from "react";

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  id?: string;
  error?: string;
  description?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Stable field wrapper: reserves space for validation messages so adjacent
 * labels never overlap when errors appear.
 */
export function FormField({
  label,
  htmlFor,
  id,
  error,
  description,
  required,
  children,
  className = "",
}: FormFieldProps) {
  const baseId = htmlFor ?? id;
  const errorId = baseId ? `${baseId}-error` : undefined;
  const descriptionId = baseId ? `${baseId}-description` : undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-body-bold font-bold text-slate-800"
        >
          {label}
          {required ? (
            <span className="ml-0.5 text-red-600" aria-hidden>
              *
            </span>
          ) : null}
        </label>
      ) : null}

      {children}

      {description && !error ? (
        <p
          id={descriptionId}
          className="text-xs leading-snug text-slate-500"
        >
          {description}
        </p>
      ) : null}

      <p
        id={errorId}
        role={error ? "alert" : undefined}
        aria-live={error ? "polite" : undefined}
        className={`min-h-[1.125rem] text-xs leading-snug ${
          error ? "text-red-600" : "text-transparent"
        }`}
      >
        {error ?? "\u00a0"}
      </p>
    </div>
  );
}
