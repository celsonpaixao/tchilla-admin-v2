"use client";
import { forwardRef } from "react";

/* Chevron SVG idêntico ao DS C.02 */
const CHEVRON_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23827D75' stroke-width='2.2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

interface GlobalSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:    string;
  required?: boolean;
  optional?: boolean;
  hint?:     string;
  error?:    string;
  id?:       string;
}

export const GlobalSelect = forwardRef<HTMLSelectElement, GlobalSelectProps>(
  (
    {
      label,
      required,
      optional,
      hint,
      error,
      id,
      style,
      onFocus,
      onBlur,
      onMouseEnter,
      onMouseLeave,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyle: React.CSSProperties = {
      appearance:      "none",
      WebkitAppearance: "none",
      height:          "var(--control-h)",
      width:           "100%",
      padding:         "0 32px 0 var(--pad-x)",
      background:      disabled ? "var(--gray-50)" : "var(--surface)",
      border:          `1px solid ${error ? "var(--danger)" : "var(--border-strong)"}`,
      borderRadius:    "var(--r-md)",
      fontFamily:      "inherit",
      fontSize:        "var(--font-ui)",
      color:           disabled ? "var(--text-3)" : "var(--text)",
      cursor:          disabled ? "not-allowed" : "pointer",
      outline:         "none",
      transition:      "border-color .12s, box-shadow .12s",
      backgroundImage: CHEVRON_SVG,
      backgroundRepeat:   "no-repeat",
      backgroundPosition: "right 11px center",
      ...style,
    };

    function handleFocus(e: React.FocusEvent<HTMLSelectElement>) {
      if (!error && !disabled) {
        e.currentTarget.style.borderColor = "var(--blue)";
        e.currentTarget.style.boxShadow  = "0 0 0 3px var(--ring)";
      }
      onFocus?.(e);
    }

    function handleBlur(e: React.FocusEvent<HTMLSelectElement>) {
      e.currentTarget.style.borderColor = error ? "var(--danger)" : "var(--border-strong)";
      e.currentTarget.style.boxShadow  = "none";
      onBlur?.(e);
    }

    function handleMouseEnter(e: React.MouseEvent<HTMLSelectElement>) {
      if (!e.currentTarget.matches(":focus") && !error && !disabled) {
        e.currentTarget.style.borderColor = "var(--gray-400)";
      }
      onMouseEnter?.(e);
    }

    function handleMouseLeave(e: React.MouseEvent<HTMLSelectElement>) {
      if (!e.currentTarget.matches(":focus") && !disabled) {
        e.currentTarget.style.borderColor = error ? "var(--danger)" : "var(--border-strong)";
      }
      onMouseLeave?.(e);
    }

    const select = (
      <select
        ref={ref}
        id={id}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        style={baseStyle}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </select>
    );

    if (!label) return select;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label
          htmlFor={id}
          style={{
            fontSize:    "12.5px",
            fontWeight:  600,
            color:       "var(--text)",
            display:     "flex",
            gap:         6,
            alignItems:  "center",
          }}
        >
          {label}
          {required && (
            <span style={{ color: "var(--danger)", fontWeight: 600 }}>*</span>
          )}
          {optional && (
            <span style={{ fontWeight: 400, color: "var(--text-3)", fontSize: 11.5 }}>
              opcional
            </span>
          )}
        </label>

        {select}

        {error && (
          <p
            id={`${id}-error`}
            role="alert"
            style={{ fontSize: 11.5, color: "var(--danger-fg)" }}
          >
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${id}-hint`} style={{ fontSize: 11.5, color: "var(--text-3)" }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

GlobalSelect.displayName = "GlobalSelect";
