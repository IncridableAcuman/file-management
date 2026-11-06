import { apiClient } from './api';
import type { 
  AuthResponse, 
  ForgotPasswordRequest, 
  LoginRequest, 
  RegisterRequest, 
  ResetPasswordRequest, 
  UpdatePasswordRequest, 
  User, 
  VerifyEmailRequest 
} from '@/types/auth';

export const authService = {
  async register(data: RegisterRequest): Promise<string> {
    const res = await apiClient.post<string>('/auth/register', data);
    return res.data;
  },

  async verifyEmail(data: VerifyEmailRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/verify-email', data);
    if (res.data.accessToken) {
      localStorage.setItem('fms_access_token', res.data.accessToken);
    }
    return res.data;
  },

  async resendOtp(email: string): Promise<string> {
    const res = await apiClient.post<string>('/auth/resend-otp', { email });
    return res.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login', data);
    if (res.data.accessToken) {
      localStorage.setItem('fms_access_token', res.data.accessToken);
    }
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('fms_access_token');
      localStorage.removeItem('fms_user');
    }
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<string> {
    const res = await apiClient.post<string>('/auth/forgot-password', data);
    return res.data;
  },

  async resetPassword(data: ResetPasswordRequest): Promise<string> {
    const res = await apiClient.post<string>('/auth/reset-password', data);
    return res.data;
  },

  async getCurrentUser(id: number): Promise<User> {
    const res = await apiClient.get<User>(`/users/${id}`);
    return res.data;
  },

  async updatePassword(id: number, data: UpdatePasswordRequest): Promise<string> {
    const res = await apiClient.post<string>(`/users/${id}`, data);
    return res.data;
  }
};
