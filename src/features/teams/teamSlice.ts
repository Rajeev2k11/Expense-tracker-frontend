import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { teamApi, type CreateTeamRequest, type UpdateTeamRequest } from './teamApi';
import type { TeamWithDetails } from '../../types';

export interface TeamState {
  teams: TeamWithDetails[];
  currentTeam: TeamWithDetails | null;
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
}

const initialState: TeamState = {
  teams: [],
  currentTeam: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
};

// Async Thunks
export const fetchTeams = createAsyncThunk<
  TeamWithDetails[],
  void,
  { rejectValue: string }
>(
  'teams/fetchTeams',
  async (_, { rejectWithValue }) => {
    try {
      const teams = await teamApi.getAllTeams();
      return teams;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch teams');
    }
  }
);

export const fetchTeamById = createAsyncThunk<
  TeamWithDetails,
  string,
  { rejectValue: string }
>(
  'teams/fetchTeamById',
  async (id, { rejectWithValue }) => {
    try {
      const team = await teamApi.getTeamById(id);
      return team;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch team');
    }
  }
);

export const createTeam = createAsyncThunk<
  TeamWithDetails,
  CreateTeamRequest,
  { rejectValue: string }
>(
  'teams/createTeam',
  async (data, { rejectWithValue }) => {
    try {
      const team = await teamApi.createTeam(data);
      return team;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create team');
    }
  }
);

export const updateTeam = createAsyncThunk<
  TeamWithDetails,
  { id: string; data: UpdateTeamRequest },
  { rejectValue: string }
>(
  'teams/updateTeam',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const team = await teamApi.updateTeam(id, data);
      return team;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update team');
    }
  }
);

export const deleteTeam = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'teams/deleteTeam',
  async (id, { rejectWithValue }) => {
    try {
      await teamApi.deleteTeam(id);
      return id;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to delete team');
    }
  }
);

const teamSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTeam: (state) => {
      state.currentTeam = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Teams
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action: PayloadAction<TeamWithDetails[]>) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch teams';
      })
      // Fetch Team By ID
      .addCase(fetchTeamById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamById.fulfilled, (state, action: PayloadAction<TeamWithDetails>) => {
        state.loading = false;
        state.currentTeam = action.payload;
      })
      .addCase(fetchTeamById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch team';
      })
      // Create Team
      .addCase(createTeam.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state, action: PayloadAction<TeamWithDetails>) => {
        state.creating = false;
        state.teams.push(action.payload);
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || 'Failed to create team';
      })
      // Update Team
      .addCase(updateTeam.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateTeam.fulfilled, (state, action: PayloadAction<TeamWithDetails>) => {
        state.updating = false;
        const index = state.teams.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.teams[index] = action.payload;
        }
        if (state.currentTeam?.id === action.payload.id) {
          state.currentTeam = action.payload;
        }
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || 'Failed to update team';
      })
      // Delete Team
      .addCase(deleteTeam.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteTeam.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleting = false;
        state.teams = state.teams.filter((t) => t.id !== action.payload);
        if (state.currentTeam?.id === action.payload) {
          state.currentTeam = null;
        }
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload || 'Failed to delete team';
      });
  },
});

export const { clearError, clearCurrentTeam } = teamSlice.actions;
export default teamSlice.reducer;
