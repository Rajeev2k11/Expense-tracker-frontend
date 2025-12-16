import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { User, Role, ProfileFormData } from '../../types';
import type { ApiError, RequestStatus } from '../types';
import { registerUser, setupPassword as setupPasswordApi, selectMfaMethod as selectMfaApi, verifyMfa as verifyMfaApi, passkeyAuthOptions as passkeyOptionsApi, passkeyAuthVerify as passkeyVerifyApi, loginUser as loginUserApi } from '../../services/api';
import { fetchUsers as fetchUsersApi, inviteUser as inviteUserApi } from '../../services/api';

const USERS_KEY = 'mock_users';
const USER_KEY = 'user';
const TOKEN_KEY = 'token';

const getStoredUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as User[]) : [];
  } catch {
    return [];
  }
};

const setStoredUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const login = createAsyncThunk(
  'auth/login',
  async (
    { email }: { email: string },
    { rejectWithValue }
  ) => {
    try {
      const users = getStoredUsers();
      let user = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        const id = crypto.randomUUID();
        user = {
          id,
          fullName: email.split('@')[0] || 'User',
          email,
          role: 'Employee' as Role,
          token: `token-${id}`,
          phone: '',
          location: '',
          department: '',
          bio: 'Welcome to ExpensePro!',
        };
        users.push(user);
        setStoredUsers(users);
      }

      localStorage.setItem(TOKEN_KEY, user.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      return user;
    } catch (error) {
      const err = error as Error;
      return rejectWithValue({
        message: err.message || 'Login failed',
        code: 'LOGIN_ERROR',
      });
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (
    data: {
      fullName: string;
      email: string;
      password: string;
      role: Role;
    },
    { rejectWithValue }
  ) => {
    try {
      const resp = await registerUser(data);
      const respData = resp?.data ?? resp;

      // Normalize user & token from common API response shapes
      let user: User | undefined = respData?.user ?? respData?.data ?? respData;
      let token: string | undefined = respData?.token ?? respData?.data?.token ?? user?.token;

      if (!user && respData?.data) {
        user = respData.data.user ?? respData.data;
      }

      if (!token && user?.token) token = user.token;

      if (token) localStorage.setItem(TOKEN_KEY, token);
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));

      return user as User;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err: any = error;
      const message = err?.response?.data?.message || err?.message || 'Signup failed';
      const code = err?.response?.data?.code || 'SIGNUP_ERROR';
      return rejectWithValue({ message, code });
    }
  }
);

export const setupPassword = createAsyncThunk(
  'auth/setupPassword',
  async (
    data: { userId?: string; token?: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const resp = await setupPasswordApi(data);
      // Update local mock users store if present
      const users = getStoredUsers();
      if (data.userId) {
        const idx = users.findIndex((u) => u.id === data.userId);
        if (idx !== -1) {
          (users[idx] as any).password = data.password;
          (users[idx] as any).passwordSet = true;
          setStoredUsers(users);
        }
      }
      return resp.data;
    } catch (error) {
      const err = error as any;
      return rejectWithValue({ message: err?.response?.data?.message || err.message || 'Setup failed' });
    }
  }
);

export const selectMfaMethod = createAsyncThunk(
  'auth/selectMfaMethod',
  async (
    data: { userId: string; method: 'authenticator' | 'passkey' },
    { rejectWithValue }
  ) => {
    try {
      const resp = await selectMfaApi(data);
      // update local store
      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.id === data.userId);
      if (idx !== -1) {
        (users[idx] as any).mfaMethod = data.method;
        if (resp.data?.secret) (users[idx] as any).totpSecret = resp.data.secret;
        setStoredUsers(users);
      }
      return resp.data;
    } catch (error) {
      const err = error as any;
      return rejectWithValue({ message: err?.response?.data?.message || err.message || 'Select MFA failed' });
    }
  }
);

export const verifyMfa = createAsyncThunk(
  'auth/verifyMfa',
  async (
    data: { userId: string; method: string; code?: string },
    { rejectWithValue }
  ) => {
    try {
      const resp = await verifyMfaApi(data);
      if (resp.data?.verified) {
        const users = getStoredUsers();
        const idx = users.findIndex((u) => u.id === data.userId);
        if (idx !== -1) {
          (users[idx] as any).mfaVerified = true;
          setStoredUsers(users);
        }
      }
      return resp.data;
    } catch (error) {
      const err = error as any;
      return rejectWithValue({ message: err?.response?.data?.message || err.message || 'Verify MFA failed' });
    }
  }
);

export const passkeyAuthOptions = createAsyncThunk(
  'auth/passkeyOptions',
  async (
    data: { userId: string; action: 'register' | 'authenticate' },
    { rejectWithValue }
  ) => {
    try {
      const resp = await passkeyOptionsApi(data);
      return resp.data;
    } catch (error) {
      const err = error as any;
      return rejectWithValue({ message: err?.response?.data?.message || err.message || 'Passkey options failed' });
    }
  }
);

export const passkeyAuthVerify = createAsyncThunk(
  'auth/passkeyVerify',
  async (
    data: { userId: string; action: string; credential: unknown },
    { rejectWithValue }
  ) => {
    try {
      const resp = await passkeyVerifyApi(data);
      if (resp.data?.verified) {
        const users = getStoredUsers();
        const idx = users.findIndex((u) => u.id === data.userId);
        if (idx !== -1 && data.action === 'register') {
          (users[idx] as any).mfaVerified = true;
          (users[idx] as any).passkeys = (users[idx] as any).passkeys || [];
          // attempt to store credential id if present
          try {
            const cred: any = data.credential as any;
            if (cred?.id) (users[idx] as any).passkeys.push({ id: cred.id });
          } catch {}
          setStoredUsers(users);
        }
      }
      return resp.data;
    } catch (error) {
      const err = error as any;
      return rejectWithValue({ message: err?.response?.data?.message || err.message || 'Passkey verify failed' });
    }
  }
);

export const loginWithApi = createAsyncThunk(
  'auth/loginWithApi',
  async (
    data: { email: string; password?: string },
    { rejectWithValue }
  ) => {
    try {
      const resp = await loginUserApi(data);
      const d = resp.data;
      if (d.mfaRequired) {
        return d; // allow caller to handle MFA
      }
      const user = d.user;
      const token = d.token;
      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));
      // Notify other parts of the app (AuthContext) that auth state changed
      try {
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:changed'));
      } catch {}
      return { user, token };
    } catch (error) {
      const err = error as any;
      return rejectWithValue({ message: err?.response?.data?.message || err.message || 'Login failed' });
    }
  }
);

export const fetchUsersList = createAsyncThunk('auth/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const resp = await fetchUsersApi();
    return resp.data;
  } catch (error) {
    const err = error as any;
    return rejectWithValue({ message: err?.response?.data?.message || err.message || 'Fetch users failed' });
  }
});

export const inviteUser = createAsyncThunk(
  'auth/inviteUser',
  async (
    payload: { team: string; email: string; role: string; name: string },
    { rejectWithValue }
  ) => {
    try {
      const resp = await inviteUserApi(payload);
      return resp.data;
    } catch (error) {
      const err = error as any;
      return rejectWithValue({ message: err?.response?.data?.message || err.message || 'Invite failed' });
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    { profileData, userId }: { profileData: ProfileFormData; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const users = getStoredUsers();
      const userIndex = users.findIndex((u) => u.id === userId);

      if (userIndex === -1) {
        return rejectWithValue({
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        });
      }

      const updatedUser: User = {
        ...users[userIndex],
        fullName: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        department: profileData.department,
        bio: profileData.bio,
        avatar: profileData.avatar,
      };

      users[userIndex] = updatedUser;
      setStoredUsers(users);

      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

      await new Promise((resolve) => setTimeout(resolve, 500));

      return updatedUser;
    } catch (error) {
      const err = error as Error;
      return rejectWithValue({
        message: err.message || 'Profile update failed',
        code: 'UPDATE_ERROR',
      });
    }
  }
);

interface AuthState {
  user: User | null;
  token: string | null;
  status: RequestStatus;
  error: ApiError | null;
  isAdmin: boolean;
  isTeamMember: boolean;
}

const initialState: AuthState = {
  user: getStoredUser(),
  token: localStorage.getItem(TOKEN_KEY),
  status: 'idle',
  error: null,
  isAdmin: false,
  isTeamMember: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAdmin = false;
      state.isTeamMember = false;
      state.error = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
    clearError: (state) => {
      state.error = null;
    },
    setRoles: (state, action: PayloadAction<{ isAdmin: boolean; isTeamMember: boolean }>) => {
      state.isAdmin = action.payload.isAdmin;
      state.isTeamMember = action.payload.isTeamMember;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'success';
        state.user = action.payload;
        state.token = action.payload.token;
        const adminRoles = ['CEO', 'CTO', 'CFO', 'Founder', 'Manager', 'Team Leader'];
        state.isAdmin = adminRoles.includes(action.payload.role);
        state.isTeamMember = !state.isAdmin;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as ApiError;
      })
      .addCase(signup.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = 'success';
        state.user = action.payload;
        state.token = action.payload.token;
        const adminRoles = ['CEO', 'CTO', 'CFO', 'Founder', 'Manager', 'Team Leader'];
        state.isAdmin = adminRoles.includes(action.payload.role);
        state.isTeamMember = !state.isAdmin;
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as ApiError;
      })
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = 'success';
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as ApiError;
      });

    builder
      .addCase(loginWithApi.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginWithApi.fulfilled, (state, action) => {
        state.status = 'success';
        const payload: any = action.payload;
        if (payload?.user) {
          state.user = payload.user;
          state.token = payload.token ?? payload.user?.token;
          // Determine admin/team roles based on returned user role (case-insensitive)
          const adminRoles = ['CEO', 'CTO', 'CFO', 'Founder', 'Manager', 'Team Leader', 'Admin', 'Administrator', 'Owner'];
          const role = (payload.user?.role || '').toString();
          state.isAdmin = adminRoles.map((r) => r.toLowerCase()).includes(role.toLowerCase());
          state.isTeamMember = !state.isAdmin;
        }
      })
      .addCase(loginWithApi.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as ApiError;
      })
      .addCase(verifyMfa.fulfilled, (state, _action) => {
        state.status = 'success';
      })
      .addCase(verifyMfa.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as ApiError;
      });

    builder
      .addCase(fetchUsersList.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsersList.fulfilled, (state) => {
        state.status = 'success';
      })
      .addCase(fetchUsersList.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as ApiError;
      })
      .addCase(inviteUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(inviteUser.fulfilled, (state) => {
        state.status = 'success';
      })
      .addCase(inviteUser.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as ApiError;
      });
  },
});

export const { logout, clearError, setRoles } = authSlice.actions;
export default authSlice.reducer;
