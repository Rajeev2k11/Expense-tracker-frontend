import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { loginApi } from './loginApi';
import type { LoginRequest, LoginResponse } from './loginApi';
import type { User } from '../../types';

export interface LoginState {
  loading: boolean;
  error: string | null;
  success: boolean;
  user: User | null;
  token: string | null;
}

const initialState: LoginState = {
  loading: false,
  error: null,
  success: false,
  user: null,
  token: null,
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
      })
      .addCase(performLogin.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        state.success = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(performLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to login';
        state.success = false;
      });
  },
});

export const { resetLogin, clearError } = loginSlice.actions;
export default loginSlice.reducer;
