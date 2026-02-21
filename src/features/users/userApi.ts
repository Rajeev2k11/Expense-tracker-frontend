import api from '../../services/api';
import type { ReadUserProfileResponse, User } from '../../types';

export interface GetAllUsersResponse {
  users: User[];
}

export interface UserTeamOption {
  id: string;
  name: string;
}

export interface UserTeamDetails {
  id: string;
  name: string;
  description?: string;
  team_leader?: User | null;
  members?: User[];
  monthly_budget?: number;
  monthly_budget_remaining?: number;
}

export interface CurrentUserTeamsOverview {
  defaultTeamId?: string;
  activeTeamId?: string;
  defaultTeam?: UserTeamDetails | null;
  activeTeam?: UserTeamDetails | null;
  teams: UserTeamDetails[];
}

type UserTeamsResponse =
  | UserTeamOption[]
  | {
      defaultTeamId?: string;
      activeTeamId?: string;
      defaultTeam?: { id?: string; _id?: string; name?: string; description?: string; team_leader?: User; members?: User[]; monthly_budget?: number; monthly_budget_remaining?: number };
      activeTeam?: { id?: string; _id?: string; name?: string; description?: string; team_leader?: User; members?: User[]; monthly_budget?: number; monthly_budget_remaining?: number };
      teams?: Array<{ id?: string; _id?: string; name?: string; description?: string; team_leader?: User; members?: User[]; monthly_budget?: number; monthly_budget_remaining?: number }>;
      allTeams?: Array<{ id?: string; _id?: string; name?: string; description?: string; team_leader?: User; members?: User[]; monthly_budget?: number; monthly_budget_remaining?: number }>;
      data?: Array<{ id?: string; _id?: string; name?: string; description?: string; team_leader?: User; members?: User[]; monthly_budget?: number; monthly_budget_remaining?: number }>;
    };

const normalizeTeamOption = (team: { id?: string; _id?: string; name?: string }): UserTeamOption | null => {
  const id = String(team.id ?? team._id ?? '');
  if (!id) return null;
  return {
    id,
    name: team.name || 'Team',
  };
};

const normalizeTeamDetails = (team: {
  id?: string;
  _id?: string;
  name?: string;
  description?: string;
  team_leader?: User;
  members?: User[];
  monthly_budget?: number;
  monthly_budget_remaining?: number;
} | null | undefined): UserTeamDetails | null => {
  if (!team) return null;
  const id = String(team.id ?? team._id ?? '');
  if (!id) return null;

  return {
    id,
    name: team.name || 'Team',
    description: team.description,
    team_leader: team.team_leader ?? null,
    members: Array.isArray(team.members) ? team.members : [],
    monthly_budget: typeof team.monthly_budget === 'number' ? team.monthly_budget : 0,
    monthly_budget_remaining:
      typeof team.monthly_budget_remaining === 'number' ? team.monthly_budget_remaining : 0,
  };
};

export const userApi = {
  readUserProfile: async (): Promise<ReadUserProfileResponse> => {
    const response = await api.get<ReadUserProfileResponse>('/v1/users/readUserProfile', {
      params: import.meta.env.DEV ? { _t: Date.now() } : undefined,
    });
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

  getCurrentUserTeamsOverview: async (): Promise<CurrentUserTeamsOverview> => {
    const response = await api.get<UserTeamsResponse>('/v1/users/teams');
    const payload = response.data;

    if (Array.isArray(payload)) {
      const teams = payload
        .map((team) => normalizeTeamDetails(team as { id?: string; _id?: string; name?: string; description?: string; team_leader?: User; members?: User[]; monthly_budget?: number; monthly_budget_remaining?: number }))
        .filter((team): team is UserTeamDetails => !!team);
      return {
        teams,
      };
    }

    const teams = (payload?.teams || payload?.allTeams || payload?.data || [])
      .map((team) => normalizeTeamDetails(team))
      .filter((team): team is UserTeamDetails => !!team);

    return {
      defaultTeamId: payload?.defaultTeamId,
      activeTeamId: payload?.activeTeamId,
      defaultTeam: normalizeTeamDetails(payload?.defaultTeam) ?? null,
      activeTeam: normalizeTeamDetails(payload?.activeTeam) ?? null,
      teams,
    };
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
