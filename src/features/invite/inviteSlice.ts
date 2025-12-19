import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { inviteApi } from './inviteApi';
import type { InviteRequest, InviteResponse } from './inviteApi';

export interface InviteState {
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
  inviteData: InviteResponse | null;
}

const initialState: InviteState = {
  loading: false,
  error: null,
  success: false,
  message: null,
  inviteData: null,
};

export const sendInvite = createAsyncThunk<
  InviteResponse,
  InviteRequest,
  { rejectValue: string }
>(
  'invite/sendInvite',
  async (data, { rejectWithValue }) => {
    try {
      const response = await inviteApi.sendInvite(data);
      return response;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to send invite'
      );
    }
  }
);

const inviteSlice = createSlice({
  name: 'invite',
  initialState,
  reducers: {
    resetInvite: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = null;
      state.inviteData = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendInvite.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendInvite.fulfilled, (state, action: PayloadAction<InviteResponse>) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.inviteData = action.payload;
        state.error = null;
      })
      .addCase(sendInvite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to send invite';
        state.success = false;
      });
  },
});

export const { resetInvite, clearError } = inviteSlice.actions;
export default inviteSlice.reducer;
