"use client";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "accent" | "secondary" | "outline" | "ghost" | "danger" | "dark";
type ButtonSize = "sm" | "md" | "lg";

interface GlobalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  iconOnly?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "var(--primary)",
    color: "var(--primary-fg)",
    boxShadow: "0 6px 16px -8px rgba(20,170,233,.6)",
  },
  accent: {
    background: "var(--accent)",
    color: "#fff",
    boxShadow: "var(--shadow-pink)",
  },
  secondary: {
    background: "var(--surface)",
    color: "var(--text)",
    border: "1px solid var(--border-strong)",
    boxShadow: "var(--shadow-xs)",
  },
  outline: {
    background: "transparent",
    color: "var(--text)",
    border: "1px solid var(--border-strong)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-2)",
  },
  danger: {
    background: "var(--danger)",
    color: "#fff",
  },
  dark: {
    background: "var(--navy)",
    color: "#fff",
  },
};

const HOVER_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary:   { background: "var(--primary-hover)" },
  accent:    { background: "var(--pink-600)" },
  secondary: { background: "var(--gray-50)" },
  outline:   { background: "var(--gray-50)" },
  ghost:     { background: "var(--gray-100)" },
  danger:    { background: "#a83125" },
  dark:      { background: "var(--navy-700)" },
};

const SIZE_STYLES: Record<ButtonSize, { height: string; padding: string; fontSize: string; gap: string; borderRadius: string }> = {
  sm: { height: "var(--control-h-sm)", padding: "0 var(--pad-x)",      fontSize: "var(--font-sm)", gap: "6px", borderRadius: "var(--r-md)" },
  md: { height: "var(--control-h)",    padding: "0 calc(var(--pad-x) + 3px)", fontSize: "var(--font-ui)", gap: "7px", borderRadius: "var(--r-md)" },
  lg: { height: "var(--control-h-lg)", padding: "0 calc(var(--pad-x) + 7px)", fontSize: "var(--font-ui)", gap: "8px", borderRadius: "var(--r-md)" },
};

export const GlobalButton = forwardRef<HTMLButtonElement, GlobalButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth,
      iconOnly,
      children,
      disabled,
      className,
      style,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const sz = SIZE_STYLES[size];

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none border border-transparent",
          "disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none",
          fullWidth && "w-full",
          className
        )}
        style={{
          height: iconOnly ? sz.height : sz.height,
          width: iconOnly ? sz.height : undefined,
          padding: iconOnly ? "0" : sz.padding,
          fontSize: sz.fontSize,
          gap: sz.gap,
          borderRadius: sz.borderRadius,
          ...VARIANT_STYLES[variant],
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) Object.assign((e.currentTarget as HTMLElement).style, HOVER_STYLES[variant]);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) Object.assign((e.currentTarget as HTMLElement).style, VARIANT_STYLES[variant]);
          onMouseLeave?.(e);
        }}
        {...props}
      >
        {loading ? (
          <Loader2 size={size === "sm" ? 12 : 14} className="animate-spin" />
        ) : leftIcon ? (
          leftIcon
        ) : null}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

GlobalButton.displayName = "GlobalButton";
