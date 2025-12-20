import api from '../../services/api';

export interface SetupPasswordRequest {
  token: string;
  password: string;
}

export interface SetupPasswordResponse {
  message: string;
  challengeId: string;
}

export interface SelectMfaMethodRequest {
  challengeId: string;
  mfaMethod: 'TOTP' | 'PASSKEY';
}

export interface SelectMfaMethodResponse {
  message: string;
  challengeId: string;
  secret: string;
  qrCode: string;
  otpAuthUrl: string;
}

export interface VerifyMfaRequest {
  challengeId: string;
  totpCode: string;
}

export interface VerifyMfaResponse {
  message: string;
  success: boolean;
}

export const setupPasswordApi = {
  setupPassword: async (data: SetupPasswordRequest): Promise<SetupPasswordResponse> => {
    const response = await api.post<SetupPasswordResponse>('/v1/users/setup-password', data);
    return response.data;
  },
  
  selectMfaMethod: async (data: SelectMfaMethodRequest): Promise<SelectMfaMethodResponse> => {
    const response = await api.post<SelectMfaMethodResponse>('/v1/users/select-mfa-method', data);
    return response.data;
  },

  verifyMfa: async (data: VerifyMfaRequest): Promise<VerifyMfaResponse> => {
    const response = await api.post<VerifyMfaResponse>('/v1/users/verify-mfa', data);
    return response.data;
  },
};
