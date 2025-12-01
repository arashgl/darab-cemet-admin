import { ApiError } from '@/types/dashboard';
import { AxiosError } from 'axios';

/**
 * Extract error message from API response
 * Handles the standard NestJS error format
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage = 'خطایی رخ داده است'
): string {
  if (!error) return defaultMessage;

  // Check if it's an Axios error
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<ApiError>;

    if (axiosError.response?.data) {
      const { message } = axiosError.response.data;

      // Handle array of messages
      if (Array.isArray(message)) {
        return message.join(', ');
      }

      // Handle string message
      if (typeof message === 'string') {
        return message;
      }
    }

    // Fallback to axios error message
    return axiosError.message || defaultMessage;
  }

  // Handle regular Error objects
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  return defaultMessage;
}

/**
 * Extract all error messages as array
 */
export function getErrorMessages(error: unknown): string[] {
  if (!error) return [];

  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<ApiError>;

    if (axiosError.response?.data?.message) {
      const { message } = axiosError.response.data;

      if (Array.isArray(message)) {
        return message;
      }

      if (typeof message === 'string') {
        return [message];
      }
    }
  }

  if (error instanceof Error) {
    return [error.message];
  }

  return [];
}

/**
 * Get error details including statusCode and error type
 */
export function getErrorDetails(error: unknown): {
  message: string;
  statusCode?: number;
  errorType?: string;
  timestamp?: string;
} {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<ApiError>;

    if (axiosError.response?.data) {
      const data = axiosError.response.data;

      return {
        message: Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message,
        statusCode: data.statusCode,
        errorType: data.error,
        timestamp: data.timestamp,
      };
    }

    return {
      message: axiosError.message,
      statusCode: axiosError.response?.status,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'خطایی رخ داده است',
  };
}
