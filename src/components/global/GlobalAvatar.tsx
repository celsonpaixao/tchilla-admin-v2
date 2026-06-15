"use client";
import { cn, getInitials } from "@/lib/utils";

/* Paleta DS — cor determinística pelo nome */
const AV_COLORS = [
  "#0A6F9E", // blue-700
  "#1F8A5B", // success
  "#C81E5E", // pink-700
  "#0E2A42", // navy
  "#C07C12", // warning
  "#075066", // info-fg
];

function nameColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AV_COLORS[h % AV_COLORS.length];
}

/* Tamanhos DS: xs=24 sm=30 md=38 lg=48 xl=56 */
const SIZE_PX  = { xs: 24, sm: 30, md: 38, lg: 48, xl: 56 };
const FONT_PX  = { xs: 10, sm: 11, md: 13, lg: 16, xl: 19 };

export type AvatarSize     = "xs" | "sm" | "md" | "lg" | "xl";
export type PresenceStatus = "online" | "offline" | "busy";

/* ── GlobalAvatar ─────────────────────────────────────────── */
interface GlobalAvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  square?: boolean;
  presence?: PresenceStatus;
  className?: string;
}

export function GlobalAvatar({
  src, name, size = "md", square, presence, className,
}: GlobalAvatarProps) {
  const initials = getInitials(name);
  const px       = SIZE_PX[size];
  const fs       = FONT_PX[size];
  const dotPx    = size === "xs" ? 8 : 11;

  const presColor =
    presence === "online"  ? "var(--success)"   :
    presence === "offline" ? "var(--gray-400)"  :
    presence === "busy"    ? "var(--warning)"   : null;

  return (
    <div
      className={cn(className)}
      style={{
        position:     "relative",
        width:        px,
        height:       px,
        borderRadius: square ? "var(--r-md)" : "50%",
        display:      "grid",
        placeItems:   "center",
        fontFamily:   "var(--display)",
        fontWeight:   600,
        fontSize:     fs,
        color:        "#fff",
        flexShrink:   0,
        overflow:     "visible",
        background:   src ? "transparent" : nameColor(name),
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          style={{
            width:        px,
            height:       px,
            borderRadius: square ? "var(--r-md)" : "50%",
            objectFit:    "cover",
          }}
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            el.style.display = "none";
            if (el.parentElement) el.parentElement.style.background = nameColor(name);
          }}
        />
      ) : (
        <span style={{ lineHeight: 1 }}>{initials}</span>
      )}

      {/* Presence dot — DS: right/bottom -1px, 11×11, border 2px surface */}
      {presence && presColor && (
        <span
          aria-label={presence}
          style={{
            position:     "absolute",
            right:        -1,
            bottom:       -1,
            width:        dotPx,
            height:       dotPx,
            borderRadius: "50%",
            border:       "2px solid var(--surface)",
            background:   presColor,
          }}
        />
      )}
    </div>
  );
}

/* ── AvatarStack ──────────────────────────────────────────── */
interface AvatarStackProps {
  users: { name: string; src?: string | null }[];
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarStack({ users, max = 4, size = "md", className }: AvatarStackProps) {
  const visible  = users.slice(0, max);
  const overflow = users.length - max;
  const px       = SIZE_PX[size];
  const fs       = FONT_PX[size];

  return (
    <div className={cn(className)} style={{ display: "flex" }}>
      {visible.map((u, i) => (
        <div
          key={`${u.name}-${i}`}
          style={{
            marginLeft: i === 0 ? 0 : -9,
            boxShadow:  "0 0 0 2px var(--surface)",
            borderRadius: "50%",
            flexShrink: 0,
          }}
        >
          <GlobalAvatar src={u.src} name={u.name} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div style={{
          marginLeft:   -9,
          width:        px,
          height:       px,
          borderRadius: "50%",
          background:   "var(--gray-300)",
          color:        "var(--text-2)",
          display:      "grid",
          placeItems:   "center",
          fontFamily:   "var(--display)",
          fontWeight:   600,
          fontSize:     fs,
          boxShadow:    "0 0 0 2px var(--surface)",
          flexShrink:   0,
        }}>
          +{overflow}
        </div>
      )}
    </div>
  );
}

/* ── Actor / GlobalUserAvatarName ─────────────────────────── */
interface GlobalUserAvatarNameProps {
  name: string;
  photo?: string | null;
  subtitle?: string;
  size?: AvatarSize;
  presence?: PresenceStatus;
  square?: boolean;
}

export function GlobalUserAvatarName({
  name, photo, subtitle, size = "sm", presence, square,
}: GlobalUserAvatarNameProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
      <GlobalAvatar src={photo} name={name} size={size} presence={presence} square={square} />
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span style={{
          fontWeight:    600,
          fontSize:      13,
          color:         "var(--text)",
          lineHeight:    1.25,
          whiteSpace:    "nowrap",
          overflow:      "hidden",
          textOverflow:  "ellipsis",
        }}>
          {name}
        </span>
        {subtitle && (
          <span style={{
            fontSize:   11.5,
            color:      "var(--text-3)",
            lineHeight: 1.2,
          }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
