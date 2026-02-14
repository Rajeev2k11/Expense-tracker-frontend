import api from '../../services/api';
import type { TeamWithDetails } from '../../types';

export interface CreateTeamRequest {
  name: string;
  description: string;
  team_leader: string;
  members: string[];
  monthly_budget: number;
  createdAt?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  members?: string[];
  monthly_budget?: number;
}

export interface AddTeamMemberRequest {
  userId: string;
}

export interface UpdateTeamMemberRoleRequest {
  role: string;
}

export const teamApi = {
  getAllTeams: async (): Promise<TeamWithDetails[]> => {
    const response = await api.get<TeamWithDetails[]>('/v1/teams');
    return response.data;
  },

  getTeamById: async (id: string): Promise<TeamWithDetails> => {
    const response = await api.get<TeamWithDetails>(`/v1/teams/${id}`);
    return response.data;
  },

  createTeam: async (data: CreateTeamRequest): Promise<TeamWithDetails> => {
    const response = await api.post<TeamWithDetails>('/v1/teams', data);
    return response.data;
  },

  updateTeam: async (id: string, data: UpdateTeamRequest): Promise<TeamWithDetails> => {
    const response = await api.put<TeamWithDetails>(`/v1/teams/${id}`, data);
    return response.data;
  },

  addTeamMember: async (teamId: string, data: AddTeamMemberRequest): Promise<TeamWithDetails> => {
    const response = await api.post<TeamWithDetails>(`/v1/teams/${teamId}/members`, data);
    return response.data;
  },

  updateTeamMemberRole: async (
    teamId: string,
    memberId: string,
    data: UpdateTeamMemberRoleRequest
  ): Promise<TeamWithDetails> => {
    const response = await api.patch<TeamWithDetails>(`/v1/teams/${teamId}/members/${memberId}/role`, data);
    return response.data;
  },

  removeTeamMember: async (teamId: string, memberId: string): Promise<void> => {
    await api.delete(`/v1/teams/${teamId}/members/${memberId}`);
  },

  deleteTeam: async (id: string): Promise<void> => {
    await api.delete(`/v1/teams/${id}`);
  },
};
