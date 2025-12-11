import type { ApiError } from '../types';

export const handleError = (error: unknown): ApiError => {
  if (error instanceof Error && 'response' in error) {
    const response = (error as Record<string, unknown>).response as Record<string, unknown>;
    return {
      message: (response?.data as Record<string, unknown>)?.message as string || 'An error occurred',
      code: response?.status as string,
      timestamp: new Date().toISOString(),
    };
  }
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN',
      timestamp: new Date().toISOString(),
    };
  }
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString(),
  };
};

export const isErrorResponse = (response: unknown): boolean => {
  if (typeof response === 'object' && response !== null && 'status' in response) {
    const status = (response as Record<string, unknown>).status;
    return typeof status === 'number' && status >= 400;
  }
  return false;
};
