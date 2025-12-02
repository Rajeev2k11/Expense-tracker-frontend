import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { User, Role, ProfileFormData } from '../../types';
import type { ApiError, RequestStatus } from '../types';

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
      const users = getStoredUsers();
      const existingUser = users.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase()
      );

      if (existingUser) {
        return rejectWithValue({
          message: 'Email already exists',
          code: 'EMAIL_EXISTS',
        });
      }

      const id = crypto.randomUUID();
      const newUser: User = {
        id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        token: `token-${id}`,
        phone: '',
        location: '',
        department: '',
        bio: 'Welcome to ExpensePro!',
      };

      users.push(newUser);
      setStoredUsers(users);

      localStorage.setItem(TOKEN_KEY, newUser.token);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));

      return newUser;
    } catch (error) {
      const err = error as Error;
      return rejectWithValue({
        message: err.message || 'Signup failed',
        code: 'SIGNUP_ERROR',
      });
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
  },
});

export const { logout, clearError, setRoles } = authSlice.actions;
export default authSlice.reducer;
