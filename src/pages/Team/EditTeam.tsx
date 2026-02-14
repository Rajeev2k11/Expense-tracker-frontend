import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../features/users/userApi';
import { teamApi } from '../../features/teams/teamApi';
import type { Role, User } from '../../types';
import { ArrowLeft, Users, Search, X, AlertCircle, UserPlus, Trash2 } from 'lucide-react';

type TeamRole = 'Manager' | 'Member' | 'Admin' | 'CEO' | 'CTO' | Role;
type LeaderRole = 'Manager' | 'Admin' | 'CEO' | 'CTO';

interface EditableMember {
  id: string;
  fullName: string;
  email: string;
  role: TeamRole;
  isExisting: boolean;
  originalRole: TeamRole;
}

const EditTeam: React.FC = () => {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId: string }>();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthly_budget: '',
  });

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<EditableMember[]>([]);
  const [initialMemberIds, setInitialMemberIds] = useState<string[]>([]);
  const [leaderMemberId, setLeaderMemberId] = useState<string>('');
  const [leaderRole, setLeaderRole] = useState<LeaderRole>('Manager');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getEntityId = (entity: unknown): string => {
    const candidate = entity as { id?: string; _id?: string };
    return String(candidate?.id ?? candidate?._id ?? '');
  };

  const normalizeUser = useCallback((member: unknown): EditableMember | null => {
    const raw = member as {
      id?: string;
      _id?: string;
      fullName?: string;
      name?: string;
      username?: string;
      email?: string;
      role?: string;
    };

    const id = getEntityId(raw);
    if (!id) return null;

    const fullName = raw.fullName || raw.name || raw.username || raw.email || 'Unknown User';

    return {
      id,
      fullName,
      email: raw.email || 'No email',
      role: (raw.role as TeamRole) || 'Member',
      isExisting: true,
      originalRole: (raw.role as TeamRole) || 'Member',
    };
  }, []);

  const canManageTeams = useCallback(() => {
    if (!user) return false;
    const managerRoles = ['MANAGER', 'ADMIN', 'CEO', 'CTO', 'CFO', 'FOUNDER'];
    return managerRoles.includes(user.role.toUpperCase());
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    if (!canManageTeams()) {
      navigate('/team');
      return;
    }

    if (!teamId) {
      navigate('/team');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [team, users] = await Promise.all([
          teamApi.getTeamById(teamId),
          userApi.getAllUsers(),
        ]);

        setFormData({
          name: team.name || '',
          description: team.description || '',
          monthly_budget: String(team.monthly_budget || ''),
        });

        const teamLeaderRaw = team.team_leader as unknown as {
          id?: string;
          _id?: string;
          fullName?: string;
          name?: string;
          username?: string;
          email?: string;
          role?: string;
        };
        const teamLeaderId = getEntityId(teamLeaderRaw);
        const normalizedLeader = normalizeUser(teamLeaderRaw);
        const normalizedLeaderRole = ((teamLeaderRaw?.role as LeaderRole) || 'Manager') as LeaderRole;

        const normalizedMembers = (team.members || [])
          .map((member) => normalizeUser(member))
          .filter((member): member is EditableMember => !!member);

        const membersWithLeader = [...normalizedMembers];
        const hasLeaderInMembers = teamLeaderId && membersWithLeader.some((member) => member.id === teamLeaderId);

        if (normalizedLeader && teamLeaderId && !hasLeaderInMembers) {
          membersWithLeader.unshift({
            ...normalizedLeader,
            role: normalizedLeaderRole,
            originalRole: normalizedLeaderRole,
          });
        }

        if (teamLeaderId) {
          setLeaderMemberId(teamLeaderId);
          setLeaderRole(normalizedLeaderRole);
        }

        setMembers(membersWithLeader);
        setInitialMemberIds(membersWithLeader.map((member) => member.id));
        setAllUsers(users);
      } catch (err) {
        console.error('Failed to load team details:', err);
        setError('Failed to load team details. Please refresh and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [canManageTeams, navigate, normalizeUser, teamId, user]);

  const selectedMemberIds = useMemo(() => new Set(members.map((member) => member.id)), [members]);

  const filteredUsers = useMemo(() => {
    const availableUsers = allUsers.filter((candidate) => {
      const candidateId = getEntityId(candidate);
      return candidateId && !selectedMemberIds.has(candidateId);
    });

    if (!searchTerm.trim()) return availableUsers;

    const query = searchTerm.toLowerCase();
    return availableUsers.filter((candidate) => {
      const name = (candidate.fullName || '').toLowerCase();
      const email = (candidate.email || '').toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [allUsers, searchTerm, selectedMemberIds]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (memberId: string, role: TeamRole) => {
    if (memberId === leaderMemberId) {
      setLeaderRole(role as LeaderRole);
    }

    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId
          ? {
              ...member,
              role,
            }
          : member
      )
    );
  };

  const handleAddMember = (candidate: User) => {
    const id = getEntityId(candidate);
    if (!id || selectedMemberIds.has(id)) return;

    setMembers((prev) => [
      ...prev,
      {
        id,
        fullName: candidate.fullName || candidate.email,
        email: candidate.email,
        role: 'Member',
        isExisting: false,
        originalRole: 'Member',
      },
    ]);
  };

  const handleRemoveMember = (memberId: string) => {
    if (memberId === leaderMemberId) return;
    setMembers((prev) => prev.filter((member) => member.id !== memberId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamId) return;

    if (!formData.name.trim()) {
      setError('Team name is required.');
      return;
    }

    if (!formData.monthly_budget || Number(formData.monthly_budget) <= 0) {
      setError('Please enter a valid monthly budget.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const addedMembers = members.filter((member) => !initialMemberIds.includes(member.id));
      const removedMemberIds = initialMemberIds.filter(
        (memberId) => !members.some((member) => member.id === memberId)
      );

      const roleChanges = members.filter((member) => {
        if (!member.role) return false;
        if (!member.isExisting) return true;
        return member.role !== member.originalRole;
      });

      await teamApi.updateTeam(teamId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        monthly_budget: Number(formData.monthly_budget),
      });

      if (addedMembers.length > 0) {
        await Promise.all(
          addedMembers.map((member) => teamApi.addTeamMember(teamId, { userId: member.id }))
        );
      }

      if (removedMemberIds.length > 0) {
        await Promise.all(
          removedMemberIds.map((memberId) => teamApi.removeTeamMember(teamId, memberId))
        );
      }

      if (roleChanges.length > 0) {
        await Promise.all(
          roleChanges.map((member) =>
            teamApi.updateTeamMemberRole(teamId, member.id, { role: String(member.role) })
          )
        );
      }

      navigate('/team');
    } catch (err) {
      console.error('Failed to update team:', err);
      setError('Failed to update team. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 max-w-5xl mx-auto">
          <div className="text-center py-12 text-gray-500">Loading team details...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/team')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Teams
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Team</h1>
          <p className="text-gray-600 mt-2">Update team details, members, and member roles</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card padding="lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="monthly_budget" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Budget <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="monthly_budget"
                    name="monthly_budget"
                    value={formData.monthly_budget}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members
            </h2>

            <div className="space-y-2 mb-6">
              {members.length === 0 ? (
                <div className="text-sm text-gray-500 py-2">No members in this team.</div>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{member.fullName}</p>
                      <p className="text-sm text-gray-600 truncate">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <select
                        value={member.id === leaderMemberId ? leaderRole : member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as TeamRole)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {member.id === leaderMemberId ? (
                          <>
                            <option value="Manager">Manager</option>
                            <option value="Admin">Admin</option>
                            <option value="CEO">CEO</option>
                            <option value="CTO">CTO</option>
                          </>
                        ) : (
                          <>
                            <option value="Member">Member</option>
                            <option value="Manager">Manager</option>
                          </>
                        )}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={member.id === leaderMemberId}
                        className={`p-1 rounded-md transition-colors ${
                          member.id === leaderMemberId
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-red-600 hover:bg-red-100'
                        }`}
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Add Users
            </h3>

            <div className="mb-3 relative">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="border border-gray-300 rounded-md overflow-hidden">
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No users found.' : 'No available users to add.'}
                  </div>
                ) : (
                  filteredUsers.map((candidate, index) => {
                    const candidateId = getEntityId(candidate);
                    return (
                      <div
                        key={candidateId || `candidate-${index}`}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{candidate.fullName}</p>
                          <p className="text-sm text-gray-600 truncate">{candidate.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddMember(candidate)}
                          className="px-3 py-1 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Card>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" loading={saving} className="flex-1">
              {saving ? 'Updating Team...' : 'Update Team'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/team')} disabled={saving}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditTeam;
