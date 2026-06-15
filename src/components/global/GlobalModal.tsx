"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlobalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: React.ReactNode;
}

const SIZE_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

/* Easing idêntico ao iOS spring — entra rápido, desacelera suave */
const SPRING = { duration: 0.26, ease: [0.16, 1, 0.3, 1] } as const;
const LEAVE  = { duration: 0.18, ease: [0.4, 0, 1, 1]     } as const;

export function GlobalModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md",
  footer,
}: GlobalModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {/* forceMount → Radix mantém o portal no DOM, AnimatePresence controla a animação de saída */}
      <Dialog.Portal forceMount>
        <AnimatePresence>
          {open && (
            <>
              {/* ── Overlay ── */}
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  key="modal-overlay"
                  className="fixed inset-0 z-40"
                  style={{ background: "rgba(14,42,66,0.45)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.18, ease: "easeOut" } }}
                  exit={{ opacity: 0, transition: { duration: 0.16, ease: "easeIn" } }}
                />
              </Dialog.Overlay>

              {/* ── Content ── */}
              <Dialog.Content asChild forceMount>
                <motion.div
                  key="modal-content"
                  className={cn(
                    "fixed left-1/2 top-1/2 z-50",
                    "w-[calc(100%-2rem)] rounded-xl focus:outline-none",
                    SIZE_CLASSES[size]
                  )}
                  style={{
                    background:  "var(--surface)",
                    boxShadow:   "var(--shadow-lg)",
                    translateX:  "-50%",
                    translateY:  "-50%",
                  }}
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0, transition: SPRING }}
                  exit={{ opacity: 0, scale: 0.97, y: 6, transition: LEAVE }}
                  aria-describedby={description ? "modal-description" : undefined}
                >
                  {/* Header */}
                  {(title || description) && (
                    <div
                      className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div className="space-y-0.5 min-w-0">
                        {title && (
                          <Dialog.Title
                            className="text-base font-semibold"
                            style={{ color: "var(--text)" }}
                          >
                            {title}
                          </Dialog.Title>
                        )}
                        {description && (
                          <Dialog.Description
                            id="modal-description"
                            className="text-sm"
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
                  )}

                  {/* Body */}
                  <div className="px-5 py-4">{children}</div>

                  {/* Footer */}
                  {footer && (
                    <div
                      className="flex items-center justify-end gap-2 px-5 py-4 border-t"
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

/* ── Modal de confirmação ────────────────────────────────────── */
interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  loading?: boolean;
  confirmLabel?: string;
  confirmVariant?: "danger" | "primary";
}

export function ConfirmModal({
  open,
  onOpenChange,
  title = "Tem certeza?",
  description = "Esta ação não pode ser desfeita.",
  onConfirm,
  loading,
  confirmLabel = "Confirmar",
  confirmVariant = "danger",
}: ConfirmModalProps) {
  return (
    <GlobalModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Dialog.Close asChild>
            <button
              className="px-3.5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
              style={{ background: "var(--gray-100)", color: "var(--text-2)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-150)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--gray-100)")}
            >
              Cancelar
            </button>
          </Dialog.Close>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-60"
            style={
              confirmVariant === "danger"
                ? { background: "var(--danger)", color: "white" }
                : { background: "var(--blue)",   color: "white" }
            }
          >
            {loading ? "Aguarde…" : confirmLabel}
          </button>
        </>
      }
    >
      <div />
    </GlobalModal>
  );
}
