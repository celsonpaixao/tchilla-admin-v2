"use client";
import { create } from "zustand";
import { toast } from "sonner";

interface SnackbarStore {
  showSuccess: (message: string, description?: string) => void;
  showError: (message: string, description?: string) => void;
  showWarning: (message: string, description?: string) => void;
  showInfo: (message: string, description?: string) => void;
  showLoading: (message: string) => string | number;
  dismissLoading: (id: string | number) => void;
}

export const useSnackbar = create<SnackbarStore>(() => ({
  showSuccess: (message, description) =>
    toast.success(message, { description }),

  showError: (message, description) =>
    toast.error(message, { description }),

  showWarning: (message, description) =>
    toast.warning(message, { description }),

  showInfo: (message, description) =>
    toast.info(message, { description }),

  showLoading: (message) => toast.loading(message),

  dismissLoading: (id) => toast.dismiss(id),
}));
