import type { RootState } from '../store';

export const defaultThunkConfig = {
  serializeError: (error: unknown) => ({
    message: error instanceof Error ? error.message : 'An error occurred',
    code: 'UNKNOWN',
  }),
};

export const createErrorPayload = (error: unknown) => ({
  message: error instanceof Error ? error.message : 'An error occurred',
  code: 'UNKNOWN_ERROR',
  timestamp: new Date().toISOString(),
});

export const isLoading = (status: string): boolean => status === 'loading';
export const isSuccess = (status: string): boolean => status === 'success';
export const isError = (status: string): boolean => status === 'error';

export type SelectorType<T> = (state: RootState) => T;
