import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { DashboardStats } from '../../types';
import type { ApiError, RequestStatus } from '../types';
import api from '../../services/api';

interface DashboardResponse {
  stats: DashboardStats;
  spending: unknown[];
  categories: unknown[];
}

interface DashboardState {
  stats: DashboardStats | null;
  spending: unknown[];
  categories: unknown[];
  status: RequestStatus;
  error: ApiError | null;
  lastUpdated: string | null;
}

const initialState: DashboardState = {
  stats: null,
  spending: [],
  categories: [],
  status: 'idle',
  error: null,
  lastUpdated: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const [statsRes, spendingRes, categoriesRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/spending'),
        api.get('/dashboard/categories'),
      ]);

      return {
        stats: statsRes.data as DashboardStats,
        spending: spendingRes.data as unknown[],
        categories: categoriesRes.data as unknown[],
      } as DashboardResponse;
    } catch (error) {
      const err = error as Record<string, unknown>;
      const errorData = (err?.response as Record<string, unknown>)?.data as Record<string, unknown>;
      return rejectWithValue({
        message: (errorData?.message as string) || 'Failed to fetch dashboard data',
        code: (err?.response as Record<string, unknown>)?.status || 'FETCH_ERROR',
      });
    }
  }
);

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.status = 'success';
        state.stats = action.payload.stats;
        state.spending = action.payload.spending;
        state.categories = action.payload.categories;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as ApiError;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
