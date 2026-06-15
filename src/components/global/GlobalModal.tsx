"use client";
import * as Dialog from "@radix-ui/react-dialog";
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
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-40 animate-fade-in"
          style={{ background: "rgba(14,42,66,0.4)", backdropFilter: "blur(2px)" }}
        />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-[calc(100%-2rem)] rounded-xl animate-scale-in focus:outline-none",
            SIZE_CLASSES[size]
          )}
          style={{
            background: "var(--surface)",
            boxShadow: "var(--shadow-lg)",
          }}
          aria-describedby={description ? "modal-description" : undefined}
        >
          {/* Header */}
          {(title || description) && (
            <div
              className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="space-y-0.5">
                {title && (
                  <Dialog.Title className="text-base font-semibold" style={{ color: "var(--text)" }}>
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
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                  style={{ color: "var(--text-3)" }}
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Modal de confirmação de exclusão
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
              style={{
                background: "var(--gray-100)",
                color: "var(--text-2)",
              }}
            >
              Cancelar
            </button>
          </Dialog.Close>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors disabled:opacity-60"
            style={
              confirmVariant === "danger"
                ? { background: "var(--danger)", color: "white" }
                : { background: "var(--blue)", color: "white" }
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
