import { configureStore } from '@reduxjs/toolkit';
import mfaSetupReducer from './features/mfaSetup/mfaSetupSlice';
import inviteReducer from './features/invite/inviteSlice';
import loginReducer from './features/auth/loginSlice';
import categoryReducer from './features/categories/categorySlice';

export const store = configureStore({
  reducer: {
    mfaSetup: mfaSetupReducer,
    invite: inviteReducer,
    auth: loginReducer,
    categories: categoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

