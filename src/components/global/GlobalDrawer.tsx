"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
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

const SPRING = { duration: 0.32, ease: [0.16, 1, 0.3, 1] } as const;
const LEAVE  = { duration: 0.22, ease: [0.4, 0, 1, 1]     } as const;

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
      <Dialog.Portal forceMount>
        <AnimatePresence>
          {open && (
            <>
              {/* ── Overlay ── */}
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  key="drawer-overlay"
                  className="fixed inset-0 z-40"
                  style={{ background: "rgba(14,42,66,0.35)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.22, ease: "easeOut" } }}
                  exit={{ opacity: 0, transition: { duration: 0.18, ease: "easeIn" } }}
                />
              </Dialog.Overlay>

              {/* ── Drawer panel ── */}
              <Dialog.Content asChild forceMount>
                <motion.div
                  key="drawer-content"
                  className={cn(
                    "fixed right-0 top-0 bottom-0 z-50",
                    "flex flex-col w-full focus:outline-none",
                    WIDTH_CLASSES[width]
                  )}
                  style={{
                    background: "var(--surface)",
                    boxShadow:  "-4px 0 32px rgba(14,42,66,0.14)",
                  }}
                  initial={{ x: "100%" }}
                  animate={{ x: 0, transition: SPRING }}
                  exit={{ x: "100%", transition: LEAVE }}
                  aria-describedby={description ? "drawer-description" : undefined}
                >
                  {/* Header */}
                  <div
                    className="flex items-center justify-between gap-4 px-5 py-4 border-b flex-shrink-0"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="space-y-0.5 min-w-0">
                      {title && (
                        <Dialog.Title
                          className="text-base font-semibold truncate"
                          style={{ color: "var(--text)" }}
                        >
                          {title}
                        </Dialog.Title>
                      )}
                      {description && (
                        <Dialog.Description
                          id="drawer-description"
                          className="text-xs truncate"
                          style={{ color: "var(--text-3)" }}
                        >
                          {description}
                        </Dialog.Description>
                      )}
                    </div>
                    <Dialog.Close asChild>
                      <button
                        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
                        style={{ color: "var(--text-3)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-100)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        aria-label="Fechar"
                      >
                        <X size={16} />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
                    {children}
                  </div>

                  {/* Footer */}
                  {footer && (
                    <div
                      className="flex items-center justify-end gap-2 px-5 py-4 border-t flex-shrink-0"
                      style={{ borderColor: "var(--border)" }}
                    >
                      {footer}
                    </div>
                  )}
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
