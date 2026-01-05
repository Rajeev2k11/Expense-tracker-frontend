import api from '../../services/api';
import type { User } from '../../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user?: User;
  token?: string;
  message: string;
  challengeId?: string | null;
  mfaMethod?: 'TOTP' | 'PASSKEY' | null;
  mfaRequired?: boolean;
}

export interface VerifyLoginMfaRequest {
  challengeId: string;
  totpCode: string;
}

export interface VerifyLoginMfaResponse {
  message: string;
  token: string;
  user: User;
}

export const loginApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/v1/users/login', data);
    return response.data;
  },

  verifyLoginMfa: async (data: VerifyLoginMfaRequest): Promise<VerifyLoginMfaResponse> => {
    const response = await api.post<VerifyLoginMfaResponse>('/v1/users/verify-login-mfa', data);
    return response.data;
  },
};
