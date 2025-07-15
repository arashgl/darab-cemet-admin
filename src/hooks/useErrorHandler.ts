import { showToast } from '@/lib/toast';
import { useCallback } from 'react';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
}

export function useErrorHandler() {
  const handleError = useCallback(
    (
      error: unknown,
      message: string,
      options: ErrorHandlerOptions = { showToast: true, logError: true }
    ) => {
      if (options.showToast) {
        showToast.error(message);
      }

      // Only log in development
      if (options.logError && import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error(message, error);
      }
    },
    []
  );

  return { handleError };
}
