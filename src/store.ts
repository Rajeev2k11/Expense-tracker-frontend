import { configureStore } from '@reduxjs/toolkit';
import mfaSetupReducer from './features/mfaSetup/mfaSetupSlice';

export const store = configureStore({
  reducer: {
    mfaSetup: mfaSetupReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

