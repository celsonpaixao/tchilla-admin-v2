"use client";
import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlobalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

export const GlobalInput = forwardRef<HTMLInputElement, GlobalInputProps>(
  (
    {
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      type = "text",
      wrapperClassName,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className={cn("space-y-1.5", wrapperClassName)}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium"
            style={{ color: "var(--text-2)" }}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-3)" }}
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            type={inputType}
            className={cn(
              "w-full text-sm rounded-lg px-3.5 py-2.5 outline-none transition-all",
              "border placeholder-gray-400",
              leftIcon && "pl-9",
              (rightIcon || isPassword) && "pr-9",
              className
            )}
            style={{
              background: "var(--surface)",
              color: "var(--text)",
              borderColor: error ? "var(--danger)" : "var(--border)",
            }}
            onFocus={(e) => {
              if (!error) e.target.style.borderColor = "var(--blue)";
            }}
            onBlur={(e) => {
              if (!error) e.target.style.borderColor = "var(--border)";
            }}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              style={{ color: "var(--text-3)" }}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          ) : rightIcon ? (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-3)" }}
            >
              {rightIcon}
            </span>
          ) : null}
        </div>

        {error && (
          <p id={`${id}-error`} className="text-xs" style={{ color: "var(--danger-fg)" }} role="alert">
            {error}
          </p>
        )}
        {!error && helper && (
          <p id={`${id}-helper`} className="text-xs" style={{ color: "var(--text-3)" }}>
            {helper}
          </p>
        )}
      </div>
    );
  }
);

GlobalInput.displayName = "GlobalInput";
