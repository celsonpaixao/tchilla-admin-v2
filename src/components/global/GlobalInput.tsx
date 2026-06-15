"use client";
import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface GlobalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:           string;
  required?:        boolean;
  optional?:        boolean;
  error?:           string;
  hint?:            string;
  leftIcon?:        React.ReactNode;
  rightIcon?:       React.ReactNode;
  wrapperClassName?: string;
}

export const GlobalInput = forwardRef<HTMLInputElement, GlobalInputProps>(
  (
    {
      label,
      required,
      optional,
      error,
      hint,
      leftIcon,
      rightIcon,
      type = "text",
      wrapperClassName,
      style,
      id,
      disabled,
      onFocus,
      onBlur,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType  = isPassword ? (showPassword ? "text" : "password") : type;

    const hasLeft  = !!leftIcon;
    const hasRight = !!rightIcon || isPassword;

    const baseStyle: React.CSSProperties = {
      height:       "var(--control-h)",
      width:        "100%",
      paddingLeft:  hasLeft  ? 33 : "var(--pad-x)",
      paddingRight: hasRight ? 33 : "var(--pad-x)",
      background:   disabled ? "var(--gray-50)" : "var(--surface)",
      border:       `1px solid ${error ? "var(--danger)" : "var(--border-strong)"}`,
      borderRadius: "var(--r-md)",
      fontFamily:   "inherit",
      fontSize:     "var(--font-ui)",
      color:        disabled ? "var(--text-3)" : "var(--text)",
      cursor:       disabled ? "not-allowed" : "text",
      outline:      "none",
      transition:   "border-color .12s, box-shadow .12s",
      ...style,
    };

    function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
      if (!error && !disabled) {
        e.currentTarget.style.borderColor = "var(--blue)";
        e.currentTarget.style.boxShadow  = "0 0 0 3px var(--ring)";
      }
      onFocus?.(e);
    }

    function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
      e.currentTarget.style.borderColor = error ? "var(--danger)" : "var(--border-strong)";
      e.currentTarget.style.boxShadow  = "none";
      onBlur?.(e);
    }

    function handleMouseEnter(e: React.MouseEvent<HTMLInputElement>) {
      if (!e.currentTarget.matches(":focus") && !error && !disabled) {
        e.currentTarget.style.borderColor = "var(--gray-400)";
      }
      onMouseEnter?.(e);
    }

    function handleMouseLeave(e: React.MouseEvent<HTMLInputElement>) {
      if (!e.currentTarget.matches(":focus") && !disabled) {
        e.currentTarget.style.borderColor = error ? "var(--danger)" : "var(--border-strong)";
      }
      onMouseLeave?.(e);
    }

    return (
      <div className={wrapperClassName} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {label && (
          <label
            htmlFor={id}
            style={{
              fontSize:   "12.5px",
              fontWeight: 600,
              color:      "var(--text)",
              display:    "flex",
              gap:        6,
              alignItems: "center",
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
        )}

        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          {leftIcon && (
            <span
              style={{
                position: "absolute", left: 11,
                color: "var(--text-3)",
                display: "grid", placeItems: "center",
                pointerEvents: "none",
              }}
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            type={inputType}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            style={baseStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute", right: 11,
                background: "none", border: "none",
                color: "var(--text-3)", cursor: "pointer",
                display: "grid", placeItems: "center",
                padding: 0,
              }}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          ) : rightIcon ? (
            <span
              style={{
                position: "absolute", right: 11,
                color: "var(--text-3)",
                display: "grid", placeItems: "center",
                pointerEvents: "none",
              }}
            >
              {rightIcon}
            </span>
          ) : null}
        </div>

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

GlobalInput.displayName = "GlobalInput";
