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

export const setupPasswordApi = {
  setupPassword: async (data: SetupPasswordRequest): Promise<SetupPasswordResponse> => {
    const response = await api.post<SetupPasswordResponse>('/v1/users/setup-password', data);
    return response.data;
  },
  
  selectMfaMethod: async (data: SelectMfaMethodRequest): Promise<SelectMfaMethodResponse> => {
    const response = await api.post<SelectMfaMethodResponse>('/v1/users/select-mfa-method', data);
    return response.data;
  },
};
