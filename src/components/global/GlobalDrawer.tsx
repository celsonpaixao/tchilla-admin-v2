"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlobalDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  width?: "sm" | "md" | "lg";
  footer?: React.ReactNode;
}

const WIDTH_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function GlobalDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  width = "md",
  footer,
}: GlobalDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-40 animate-fade-in"
          style={{ background: "rgba(14,42,66,0.35)", backdropFilter: "blur(1px)" }}
        />
        <Dialog.Content
          className={cn(
            "fixed right-0 top-0 bottom-0 z-50 flex flex-col w-full animate-slide-in-right focus:outline-none",
            WIDTH_CLASSES[width]
          )}
          style={{
            background: "var(--surface)",
            boxShadow: "var(--shadow-lg)",
          }}
          aria-describedby={description ? "drawer-description" : undefined}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between gap-4 px-5 py-4 border-b flex-shrink-0"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="space-y-0.5 min-w-0">
              {title && (
                <Dialog.Title className="text-base font-semibold" style={{ color: "var(--text)" }}>
                  {title}
                </Dialog.Title>
              )}
              {description && (
                <Dialog.Description
                  id="drawer-description"
                  className="text-xs"
                  style={{ color: "var(--text-3)" }}
                >
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                style={{ color: "var(--text-3)" }}
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">{children}</div>

          {/* Footer */}
          {footer && (
            <div
              className="flex items-center justify-end gap-2 px-5 py-4 border-t flex-shrink-0"
              style={{ borderColor: "var(--border)" }}
            >
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
