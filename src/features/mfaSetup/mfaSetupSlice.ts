import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { setupPasswordApi } from './mfaSetupApi';
import type { 
  SetupPasswordRequest, 
  SetupPasswordResponse,
  SelectMfaMethodRequest,
  SelectMfaMethodResponse 
} from './mfaSetupApi';

export interface MfaSetupState {
  loading: boolean;
  error: string | null;
  challengeId: string | null;
  message: string | null;
  success: boolean;
  // MFA method selection state
  secret: string | null;
  qrCode: string | null;
  otpAuthUrl: string | null;
  mfaMethodSelected: boolean;
}

const initialState: MfaSetupState = {
  loading: false,
  error: null,
  challengeId: null,
  message: null,
  success: false,
  secret: null,
  qrCode: null,
  otpAuthUrl: null,
  mfaMethodSelected: false,
};

// Async thunk for setup password
export const setupPassword = createAsyncThunk<
  SetupPasswordResponse,
  SetupPasswordRequest,
  { rejectValue: string }
>(
  'mfaSetup/setupPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await setupPasswordApi.setupPassword(data);
      return response;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to setup password'
      );
    }
  }
);

// Async thunk for select MFA method
export const selectMfaMethod = createAsyncThunk<
  SelectMfaMethodResponse,
  SelectMfaMethodRequest,
  { rejectValue: string }
>(
  'mfaSetup/selectMfaMethod',
  async (data, { rejectWithValue }) => {
    try {
      const response = await setupPasswordApi.selectMfaMethod(data);
      return response;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to select MFA method'
      );
    }
  }
);

const mfaSetupSlice = createSlice({
  name: 'mfaSetup',
  initialState,
  reducers: {
    setChallengeId: (state, action: PayloadAction<string>) => {
      state.challengeId = action.payload;
    },
    setMessagefromSetPassword: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
    resetMfaSetup: (state) => {
      state.loading = false;
      state.error = null;
      state.challengeId = null;
      state.message = null;
      state.success = false;
      state.secret = null;
      state.qrCode = null;
      state.otpAuthUrl = null;
      state.mfaMethodSelected = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Setup Password
      .addCase(setupPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(setupPassword.fulfilled, (state, action: PayloadAction<SetupPasswordResponse>) => {
        state.loading = false;
        state.success = true;
        state.challengeId = action.payload.challengeId;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(setupPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
        state.success = false;
      })
      // Select MFA Method
      .addCase(selectMfaMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.mfaMethodSelected = false;
      })
      .addCase(selectMfaMethod.fulfilled, (state, action: PayloadAction<SelectMfaMethodResponse>) => {
        state.loading = false;
        state.mfaMethodSelected = true;
        state.challengeId = action.payload.challengeId;
        state.message = action.payload.message;
        state.secret = action.payload.secret;
        state.qrCode = action.payload.qrCode;
        state.otpAuthUrl = action.payload.otpAuthUrl;
        state.error = null;
      })
      .addCase(selectMfaMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to select MFA method';
        state.mfaMethodSelected = false;
      });
  },
});

export const { setChallengeId, resetMfaSetup, clearError, setMessagefromSetPassword } = mfaSetupSlice.actions;
export default mfaSetupSlice.reducer;

