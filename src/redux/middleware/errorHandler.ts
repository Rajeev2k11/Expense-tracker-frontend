import type { Middleware } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export const errorHandlingMiddleware: Middleware<object, RootState> =
  () => (next) => (action) => {
    try {
      return next(action);
    } catch (error) {
      console.error('Redux Middleware Error:', error);
      throw error;
    }
  };

export const analyticsMiddleware: Middleware<object, RootState> =
  () => (next) => (action) => {
    if (typeof action === 'object' && action !== null && 'type' in action) {
      console.log('Action dispatched:', action.type);
    }
    return next(action);
  };
