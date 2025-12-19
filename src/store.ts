import { configureStore } from '@reduxjs/toolkit';
import mfaSetupReducer from './features/mfaSetup/mfaSetupSlice';
import inviteReducer from './features/invite/inviteSlice';
import loginReducer from './features/auth/loginSlice';

export const store = configureStore({
  reducer: {
    mfaSetup: mfaSetupReducer,
    invite: inviteReducer,
    auth: loginReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

