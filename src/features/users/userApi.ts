import api from '../../services/api';
import type { ReadUserProfileResponse } from '../../types';

export const userApi = {
  readUserProfile: async (): Promise<ReadUserProfileResponse> => {
    const response = await api.get<ReadUserProfileResponse>('/v1/users/readUserProfile');
    return response.data;
  },
};
