import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";

interface GlobalAvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  square?: boolean;
}

/* Tamanhos conforme Design System: xs=24 sm=30 md=38 lg=48 xl=56 */
const SIZE_CLASSES = {
  xs: "text-[10px]",
  sm: "text-[11px]",
  md: "text-[13px]",
  lg: "text-[16px]",
  xl: "text-lg",
};

const SIZE_PX = { xs: 24, sm: 30, md: 38, lg: 48, xl: 56 };

export function GlobalAvatar({ src, name, size = "md", className, square }: GlobalAvatarProps) {
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center font-semibold flex-shrink-0",
        square ? "rounded-lg" : "rounded-full",
        SIZE_CLASSES[size],
        className
      )}
      style={{
        width: SIZE_PX[size],
        height: SIZE_PX[size],
        background: "var(--blue)",
        color: "white",
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={SIZE_PX[size]}
          height={SIZE_PX[size]}
          className={cn("object-cover", square ? "rounded-lg" : "rounded-full")}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

interface GlobalUserAvatarNameProps {
  name: string;
  photo?: string | null;
  subtitle?: string;
  size?: GlobalAvatarProps["size"];
}

export function GlobalUserAvatarName({ name, photo, subtitle, size = "sm" }: GlobalUserAvatarNameProps) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <GlobalAvatar src={photo} name={name} size={size} />
      <div className="min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{name}</p>
        {subtitle && (
          <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}
