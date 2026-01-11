import api from '../../services/api';
import type { User } from '../../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

export const loginApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/v1/users/login', data);
    return response.data;
  },
};
