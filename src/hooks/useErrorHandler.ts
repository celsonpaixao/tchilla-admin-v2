"use client";
import { useCallback } from "react";
import { toast } from "sonner";
import { ApiException, ApiErrorType, ERROR_MESSAGES } from "@/types/common.types";

export function useErrorHandler() {
  const handleError = useCallback((error: unknown) => {
    if (error instanceof ApiException) {
      const message = ERROR_MESSAGES[error.type] ?? error.message;

      if (error.type === ApiErrorType.UNAUTHORIZED) {
        toast.error(message);
        window.location.href = "/login";
        return;
      }

      toast.error(message);
      return;
    }

    if (error instanceof Error) {
      toast.error(error.message);
      return;
    }

    toast.error("Ocorreu um erro inesperado.");
  }, []);

  return { handleError };
}
