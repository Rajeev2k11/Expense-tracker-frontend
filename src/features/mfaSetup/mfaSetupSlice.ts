import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { setupPasswordApi } from './mfaSetupApi';
import type { 
  SetupPasswordRequest, 
  SetupPasswordResponse,
  SelectMfaMethodRequest,
  SelectMfaMethodResponse,
  VerifyMfaSetupRequest,
  VerifyMfaSetupResponse
} from './mfaSetupApi';
interface MfaSetupState {
  challengeId: string | null;
  options: Record<string, unknown>;
  loading: boolean;
  error: string | null;
  success: boolean;
  token: string | null;
  user: unknown | null;
  message: string | null;
  secret: string | null;
  qrCode: string | null;
  otpAuthUrl: string | null;
  mfaMethodSelected: boolean;
  successPasskey: boolean;
}

const initialState: MfaSetupState = {
  challengeId: null,
  options: {},
  loading: false,
  error: null,
  success: false,
  token: null,
  user: null,
  message: null,
  secret: null,
  qrCode: null,
  otpAuthUrl: null,
  mfaMethodSelected: false,
  successPasskey: false,
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

// Async thunk for verify MFA setup
export const verifyMfaSetup = createAsyncThunk<
  VerifyMfaSetupResponse,
  VerifyMfaSetupRequest,
  { rejectValue: string }
>(
  'mfaSetup/verifyMfaSetup',
  async (data, { rejectWithValue }) => {
    try {
      const response = await setupPasswordApi.verifyMfaSetup(data);
      return response;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to verify MFA setup'
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
        state.secret = action.payload.secret ?? null;
        state.qrCode = action.payload.qrCode ?? null;
        state.otpAuthUrl = action.payload.otpAuthUrl ?? null;
        state.options = action.payload.options ?? {};
        state.error = null;
      })
      .addCase(selectMfaMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to select MFA method';
        state.mfaMethodSelected = false;
      })
      // Verify MFA Setup
      .addCase(verifyMfaSetup.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(verifyMfaSetup.fulfilled, (state, action: PayloadAction<VerifyMfaSetupResponse>) => {
        state.loading = false;
        state.success = true;
        state.successPasskey = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(verifyMfaSetup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to verify MFA setup';
        state.success = false;
      });
  },
});

export const { setChallengeId, resetMfaSetup, clearError, setMessagefromSetPassword } = mfaSetupSlice.actions;
export default mfaSetupSlice.reducer;

