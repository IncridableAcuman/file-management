import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginRequest, RegisterRequest, VerifyEmailRequest, ResetPasswordRequest } from '@/types/auth';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  verifyOtp: (data: VerifyEmailRequest) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (data: ResetPasswordRequest) => Promise<string>;
  demoLogin: () => void;
  logout: () => void;
  updateUser: (updated: Partial<User>) => void;
}

const DEFAULT_DEMO_USER: User = {
  id: 1,
  username: 'Izzatbek Abdusharipov',
  email: 'abdusharipovizzat03@gmail.com',
  role: { id: 1, name: 'ADMIN' },
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: new Date().toISOString()
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('fms_access_token');
    const saved = localStorage.getItem('fms_user');
    if (token && saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('fms_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fms_user');
      localStorage.removeItem('fms_access_token');
    }
  }, [user]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('fms_access_token');
    if (token) {
      authService.getMyProfile()
        .then((profile) => {
          if (profile) {
            const roleStr = (profile.role?.name || profile.role?.type || 'USER').toUpperCase();
            setUser({
              ...profile,
              role: { id: profile.role?.id ?? 1, name: roleStr },
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      await authService.login(data);
      try {
        const profile = await authService.getMyProfile();
        const roleStr = (profile.role?.name || profile.role?.type || (data.email.toLowerCase().includes('admin') ? 'ADMIN' : 'USER')).toUpperCase();
        const normalizedUser: User = {
          ...profile,
          role: { id: profile.role?.id ?? 1, name: roleStr },
        };
        setUser(normalizedUser);
      } catch {
        const roleStr = data.email.toLowerCase().includes('admin') ? 'ADMIN' : 'USER';
        const newUser: User = {
          id: 1,
          username: data.email.split('@')[0],
          email: data.email,
          role: { id: 1, name: roleStr },
          updatedAt: new Date().toISOString()
        };
        setUser(newUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      await authService.register(data);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (data: VerifyEmailRequest) => {
    setIsLoading(true);
    try {
      await authService.verifyEmail(data);
      try {
        const profile = await authService.getMyProfile();
        const roleStr = (profile.role?.name || profile.role?.type || 'USER').toUpperCase();
        setUser({
          ...profile,
          role: { id: profile.role?.id ?? 1, name: roleStr },
        });
      } catch {
        const newUser: User = {
          id: 1,
          username: data.email.split('@')[0],
          email: data.email,
          role: { id: 1, name: 'USER' },
          updatedAt: new Date().toISOString()
        };
        setUser(newUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    await authService.resendOtp(email);
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      return await authService.forgotPassword({ email });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordRequest) => {
    setIsLoading(true);
    try {
      return await authService.resetPassword(data);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = () => {
    setUser(DEFAULT_DEMO_USER);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fms_user');
    localStorage.removeItem('fms_access_token');
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        demoLogin,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
