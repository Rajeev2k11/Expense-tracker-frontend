import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uid } from 'uuid';
import type { User, Role, ProfileFormData } from '../types';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { performLogin, verifyLoginMfa as verifyLoginMfaThunk, verifyLoginMfaPasskey as verifyLoginMfaPasskeyThunk } from '../features/auth/loginSlice';

// LocalStorage keys
const USERS_KEY = 'mock_users';

const seededUsers = [] as User[];

function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(seededUsers));
      return [...seededUsers];
    }
    return JSON.parse(raw) as User[];
  } catch {
    return [...seededUsers];
  }
}

function setStoredUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{
    requiresMfa: boolean;
    mfaMethod?: 'TOTP' | 'PASSKEY';
    challengeId?: string;
  }>;
  verifyLoginMfa: (challengeId: string, totpCode: string) => Promise<void>;
  verifyLoginMfaPasskey: (challengeId: string, credential: Record<string, unknown>) => Promise<void>;
  signup: (data: { fullName: string; email: string; password: string; role: Role }) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  isTeamMember: () => boolean;
  updateProfile: (profileData: ProfileFormData) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user: reduxUser, token: reduxToken, loading: reduxLoading, error: reduxError } = useAppSelector(
    (state) => state.auth
  );

  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw && !user) {
      try {
        const u = JSON.parse(raw) as User;
        setUser(u);
      } catch {
        // ignore
      }
    }
  }, [user]);

  const commit = (u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem('token', u.token);
      localStorage.setItem('user', JSON.stringify(u));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const updateStoredUser = (updatedUser: User) => {
    const users = getStoredUsers();
    const updatedUsers = users.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    );
    setStoredUsers(updatedUsers);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await dispatch(performLogin({ email, password })).unwrap();

      const needsMfa = Boolean((result.mfaRequired ?? false) || (result.challengeId && !result.token));

      if (result.token && result.user) {
        commit(result.user);
        localStorage.setItem('token', result.token);
        return { requiresMfa: false };
      }

      if (needsMfa) {
        return {
          requiresMfa: true,
          mfaMethod: result.mfa_method ?? 'TOTP',
          challengeId: result.challengeId ?? undefined,
        };
      }

      throw new Error(reduxError || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyLoginMfa = async (challengeId: string, totpCode: string) => {
    setLoading(true);
    try {
      const response = await dispatch(
        verifyLoginMfaThunk({ challengeId, totpCode })
      ).unwrap();

      const verifiedUser = response.user as User;
      commit(verifiedUser);
      localStorage.setItem('token', response.token);
    } catch (error) {
      console.error('MFA verification error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyLoginMfaPasskey = async (challengeId: string, credential: Record<string, unknown>) => {
    setLoading(true);
    try {
      const response = await dispatch(
        verifyLoginMfaPasskeyThunk({ challengeId, credential })
      ).unwrap();

      const verifiedUser = response.user as User;
      commit(verifiedUser);
      localStorage.setItem('token', response.token);
    } catch (error) {
      console.error('Passkey verification error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: { fullName: string; email: string; password: string; role: Role }) => {
    setLoading(true);
    try {
      // Dummy local signup: store user locally and log in
      const users = getStoredUsers();
      const id = uid();
      const newUser: User = {
        id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        token: `token-${id}`,
        phone: '',
        location: '',
        department: '',
        bio: 'Welcome to ExpensePro! Update your profile to get started.'
      };
      users.push(newUser);
      setStoredUsers(users);
      commit(newUser);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: ProfileFormData) => {
    setLoading(true);
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const updatedUser: User = {
        ...user,
        fullName: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        department: profileData.department,
        bio: profileData.bio,
        avatar: profileData.avatar
      };

      // Update in localStorage
      updateStoredUser(updatedUser);
      
      // Update current user state
      commit(updatedUser);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } finally {
      setLoading(false);
    }
  };

  const logout = () => commit(null);

  const isAdmin = () => {
    if (!user) return false;
    return ['CEO', 'CTO', 'CFO', 'Founder', 'Manager', 'Team Leader'].includes(user.role);
  };

  const isTeamMember = () => {
    if (!user) return false;
    return !isAdmin();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      verifyLoginMfa,
      verifyLoginMfaPasskey,
      signup, 
      logout, 
      isAdmin, 
      isTeamMember,
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
};