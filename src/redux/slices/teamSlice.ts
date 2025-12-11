import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Team } from '../../types';
import type { ApiError, RequestStatus } from '../types';
import api from '../../services/api';

interface TeamState {
  teams: Team[];
  selectedTeam: Team | null;
  status: RequestStatus;
  error: ApiError | null;
}

const initialState: TeamState = {
  teams: [],
  selectedTeam: null,
  status: 'idle',
  error: null,
};

export const fetchTeams = createAsyncThunk(
  'team/fetchTeams',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/teams');
      return response.data as Team[];
    } catch (error) {
      const err = error as Record<string, unknown>;
      const errorData = (err?.response as Record<string, unknown>)?.data as Record<string, unknown>;
      return rejectWithValue({
        message: (errorData?.message as string) || 'Failed to fetch teams',
        code: (err?.response as Record<string, unknown>)?.status || 'FETCH_ERROR',
      });
    }
  }
);

export const createTeam = createAsyncThunk(
  'team/createTeam',
  async (teamData: Omit<Team, 'id'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/teams', teamData);
      return response.data as Team;
    } catch (error) {
      const err = error as Record<string, unknown>;
      const errorData = (err?.response as Record<string, unknown>)?.data as Record<string, unknown>;
      return rejectWithValue({
        message: (errorData?.message as string) || 'Failed to create team',
        code: (err?.response as Record<string, unknown>)?.status || 'CREATE_ERROR',
      });
    }
  }
);

export const updateTeam = createAsyncThunk(
  'team/updateTeam',
  async (
    { id, data }: { id: string; data: Partial<Team> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/teams/${id}`, data);
      return response.data as Team;
    } catch (error) {
      const err = error as Record<string, unknown>;
      const errorData = (err?.response as Record<string, unknown>)?.data as Record<string, unknown>;
      return rejectWithValue({
        message: (errorData?.message as string) || 'Failed to update team',
        code: (err?.response as Record<string, unknown>)?.status || 'UPDATE_ERROR',
      });
    }
  }
);

export const deleteTeam = createAsyncThunk(
  'team/deleteTeam',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/teams/${id}`);
      return id;
    } catch (error) {
      const err = error as Record<string, unknown>;
      const errorData = (err?.response as Record<string, unknown>)?.data as Record<string, unknown>;
      return rejectWithValue({
        message: (errorData?.message as string) || 'Failed to delete team',
        code: (err?.response as Record<string, unknown>)?.status || 'DELETE_ERROR',
      });
    }
  }
);

export const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    selectTeam: (state, action) => {
      state.selectedTeam = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.status = 'success';
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as ApiError;
      })
      .addCase(createTeam.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.status = 'success';
        state.teams.push(action.payload);
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as ApiError;
      })
      .addCase(updateTeam.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.status = 'success';
        const index = state.teams.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.teams[index] = action.payload;
        }
        if (state.selectedTeam?.id === action.payload.id) {
          state.selectedTeam = action.payload;
        }
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as ApiError;
      })
      .addCase(deleteTeam.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.status = 'success';
        state.teams = state.teams.filter((t) => t.id !== action.payload);
        if (state.selectedTeam?.id === action.payload) {
          state.selectedTeam = null;
        }
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as ApiError;
      });
  },
});

export const { selectTeam, clearError } = teamSlice.actions;
export default teamSlice.reducer;
