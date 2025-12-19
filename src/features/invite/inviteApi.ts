import api from '../../services/api';

export interface InviteRequest {
  email: string;
  role: string;
  team: string;
}

export interface InviteResponse {
  id: string;
  email: string;
  role: string;
  team: string;
  status: 'pending' | 'accepted' | 'rejected';
  sentAt: string;
  message: string;
}

export const inviteApi = {
  sendInvite: async (data: InviteRequest): Promise<InviteResponse> => {
    const response = await api.post<InviteResponse>('/v1/users/invite', data);
    return response.data;
  },
};
