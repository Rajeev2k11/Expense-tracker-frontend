import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { loginApi } from './loginApi';
import type {
  LoginRequest,
  LoginResponse,
  VerifyLoginMfaRequest,
  VerifyLoginMfaResponse,
} from './loginApi';
import type { User } from '../../types';

export interface LoginState {
  loading: boolean;
  error: string | null;
  success: boolean;
  user: User | null;
  token: string | null;
  challengeId: string | null;
  mfaMethod: 'TOTP' | 'PASSKEY' | null;
  mfaRequired: boolean;
}

const initialState: LoginState = {
  loading: false,
  error: null,
  success: false,
  user: null,
  token: null,
  challengeId: null,
  mfaMethod: null,
  mfaRequired: false,
};

export const performLogin = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  { rejectValue: string }
>(
  'auth/performLogin',
  async (data, { rejectWithValue }) => {
    try {
      const response = await loginApi.login(data);
      return response;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to login'
      );
    }
  }
);

export const verifyLoginMfa = createAsyncThunk<
  VerifyLoginMfaResponse,
  VerifyLoginMfaRequest,
  { rejectValue: string }
>(
  'auth/verifyLoginMfa',
  async (data, { rejectWithValue }) => {
    try {
      const response = await loginApi.verifyLoginMfa(data);
      return response;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to verify login MFA'
      );
    }
  }
);

const loginSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetLogin: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.user = null;
      state.token = null;
      state.challengeId = null;
      state.mfaMethod = null;
      state.mfaRequired = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(performLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.challengeId = null;
        state.mfaMethod = null;
        state.mfaRequired = false;
      })
      .addCase(performLogin.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        state.error = null;

        const { token, user, challengeId, mfaMethod, mfaRequired } = action.payload;
        const needsMfa = Boolean((mfaRequired ?? false) || (challengeId && !token));

        state.challengeId = challengeId ?? null;
        state.mfaMethod = mfaMethod ?? null;
        state.mfaRequired = needsMfa;

        if (token && user) {
          state.success = true;
          state.user = user;
          state.token = token;
        } else {
          state.success = false;
          state.user = null;
          state.token = null;
        }
      })
      .addCase(performLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to login';
        state.success = false;
        state.challengeId = null;
        state.mfaMethod = null;
        state.mfaRequired = false;
      })
      .addCase(verifyLoginMfa.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(verifyLoginMfa.fulfilled, (state, action: PayloadAction<VerifyLoginMfaResponse>) => {
        state.loading = false;
        state.success = true;
        state.user = action.payload.user as User;
        state.token = action.payload.token;
        state.challengeId = null;
        state.mfaMethod = null;
        state.mfaRequired = false;
        state.error = null;
      })
      .addCase(verifyLoginMfa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to verify login MFA';
        state.success = false;
      });
  },
});

export const { resetLogin, clearError } = loginSlice.actions;
export default loginSlice.reducer;
