import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uid } from 'uuid';
import type { User, Role, ProfileFormData } from '../types';

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
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { fullName: string; email: string; password: string; role: Role }) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  isTeamMember: () => boolean;
  updateProfile: (profileData: ProfileFormData) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      // Notify other parts of the app (e.g., Redux) that auth changed
      try {
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:changed'));
      } catch {}
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      try {
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:changed'));
      } catch {}
    }
  };

  const updateStoredUser = (updatedUser: User) => {
    const users = getStoredUsers();
    const updatedUsers = users.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    );
    setStoredUsers(updatedUsers);
  };

  const login = async (email: string) => {
    setLoading(true);
    try {
      // Dummy local login: accept any password; if user exists, return it; otherwise create a lightweight user
      const users = getStoredUsers();
      let found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!found) {
        const id = uid();
        found = {
          id,
          fullName: email.split('@')[0] || 'User',
          email,
          role: 'Employee',
          token: `token-${id}`,
          phone: '',
          location: '',
          department: '',
          bio: 'Welcome to ExpensePro! Update your profile to get started.'
        } as User;
        users.push(found);
        setStoredUsers(users);
      }
      commit(found);
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
    const adminRoles = ['CEO', 'CTO', 'CFO', 'Founder', 'Manager', 'Team Leader', 'Admin', 'Administrator', 'Owner'];
    return adminRoles.map((r) => r.toLowerCase()).includes((user.role || '').toLowerCase());
  };

  // Listen for auth changes triggered elsewhere (Redux thunks, other windows)
  useEffect(() => {
    const handler = () => {
      try {
        const raw = localStorage.getItem('user');
        if (!raw) {
          setUser(null);
          return;
        }
        const u = JSON.parse(raw) as User;
        // Only update state if different to avoid rerenders
        if (!user || u.id !== user.id || u.token !== user.token) {
          setUser(u);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('auth:changed', handler);
    // also handle storage events (other tabs)
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('auth:changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, [user]);

  const isTeamMember = () => {
    if (!user) return false;
    return !isAdmin();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
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