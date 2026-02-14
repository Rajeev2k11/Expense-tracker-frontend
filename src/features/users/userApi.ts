import api from '../../services/api';
import type { ReadUserProfileResponse, User } from '../../types';

export interface GetAllUsersResponse {
  users: User[];
}

export interface UserTeamOption {
  id: string;
  name: string;
}

type UserTeamsResponse =
  | UserTeamOption[]
  | {
      teams?: Array<{ id?: string; _id?: string; name?: string }>;
      allTeams?: Array<{ id?: string; _id?: string; name?: string }>;
      data?: Array<{ id?: string; _id?: string; name?: string }>;
    };

const normalizeTeamOption = (team: { id?: string; _id?: string; name?: string }): UserTeamOption | null => {
  const id = String(team.id ?? team._id ?? '');
  if (!id) return null;
  return {
    id,
    name: team.name || 'Team',
  };
};

export const userApi = {
  readUserProfile: async (): Promise<ReadUserProfileResponse> => {
    const response = await api.get<ReadUserProfileResponse>('/v1/users/readUserProfile');
    return response.data;
  },

  getCurrentUserTeams: async (): Promise<UserTeamOption[]> => {
    const response = await api.get<UserTeamsResponse>('/v1/users/teams');
    const payload = response.data;

    if (Array.isArray(payload)) {
      return payload
        .map((team) => normalizeTeamOption(team as { id?: string; _id?: string; name?: string }))
        .filter((team): team is UserTeamOption => !!team);
    }

    const list = payload?.teams || payload?.allTeams || payload?.data || [];
    return list
      .map((team) => normalizeTeamOption(team))
      .filter((team): team is UserTeamOption => !!team);
  },

  setDefaultTeam: async (teamId: string): Promise<void> => {
    await api.patch('/v1/users/teams/default', { teamId });
  },

  switchActiveTeam: async (teamId: string): Promise<void> => {
    await api.patch('/v1/users/switch-team', { teamId });
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/v1/users');
    return response.data;
  },
};
