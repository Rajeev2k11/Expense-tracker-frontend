import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import authReducer from '../slices/authSlice';
import expensesReducer from '../slices/expensesSlice';
import dashboardReducer from '../slices/dashboardSlice';
import teamReducer from '../slices/teamSlice';
import uiReducer from '../slices/uiSlice';

const logger = createLogger({
  collapsed: true,
  duration: true,
  timestamp: true,
  colors: {
    title: () => '#139BFE',
    prevState: () => '#1C5FAA',
    action: () => '#149945',
    nextState: () => '#A47A6A',
    error: () => '#d33',
  },
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    expenses: expensesReducer,
    dashboard: dashboardReducer,
    team: teamReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) => {
    const defaultMiddleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/login/fulfilled', 'auth/signup/fulfilled'],
        ignoredPaths: ['auth.user'],
      },
    });

    if (import.meta.env.DEV) {
      return defaultMiddleware.concat(logger);
    }
    return defaultMiddleware;
  },
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
