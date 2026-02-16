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
  const isAdminUser = user?.role?.toUpperCase() === 'ADMIN';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthly_budget: '',
  });

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<EditableMember[]>([]);
  const [initialMemberIds, setInitialMemberIds] = useState<string[]>([]);
  const [changedRoles, setChangedRoles] = useState<Record<string, TeamRole>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getEntityId = (entity: unknown): string => {
    const candidate = entity as { id?: string; _id?: string };
    return String(candidate?.id ?? candidate?._id ?? '');
  };

  const normalizeTeamRole = (rawRole: unknown, isLeader = false): TeamRole => {
    if (isLeader) return 'Manager';

    const roleUpper = String(rawRole || '').toUpperCase().trim();
    if (
      roleUpper === 'MANAGER' ||
      roleUpper === 'TEAM LEADER' ||
      roleUpper === 'TEAM_LEADER' ||
      roleUpper === 'LEADER'
    ) {
      return 'Manager';
    }
    return 'Member';
  };

  const normalizeUser = useCallback((member: unknown, leaderId?: string): EditableMember | null => {
    const raw = member as {
      id?: string;
      _id?: string;
      fullName?: string;
      name?: string;
      username?: string;
      email?: string;
      role?: string;
      member_type?: string;
      team_role?: string;
      teamRole?: string;
      user_type?: string;
    };

    const id = getEntityId(raw);
    if (!id) return null;

    const fullName = raw.fullName || raw.name || raw.username || raw.email || 'Unknown User';
    const isLeader = !!leaderId && id === leaderId;
    const resolvedTeamRole = normalizeTeamRole(
      raw.member_type ?? raw.team_role ?? raw.teamRole ?? raw.role ?? raw.user_type,
      isLeader
    );

    return {
      id,
      fullName,
      email: raw.email || 'No email',
      role: resolvedTeamRole,
      isExisting: true,
      originalRole: resolvedTeamRole,
    };
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
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

        const currentUserId = String(user.id || '');
        const currentUserEmail = String(user.email || '').toLowerCase();
        const isAdmin = user.role.toUpperCase() === 'ADMIN';

        setFormData({
          name: team.name || '',
          description: team.description || '',
          monthly_budget: String(team.monthly_budget || ''),
        });

        const teamLeaderId = getEntityId(team.team_leader);

        const normalizedMembers = (team.members || [])
          .map((member) => normalizeUser(member, teamLeaderId))
          .filter((member): member is EditableMember => !!member);

        const currentUserMember = normalizedMembers.find((member) => {
          const memberEmail = String(member.email || '').toLowerCase();
          return member.id === currentUserId || (memberEmail && memberEmail === currentUserEmail);
        });

        const isTeamManager = String(currentUserMember?.role || '').toUpperCase() === 'MANAGER';

        if (!isAdmin && !isTeamManager) {
          navigate('/team');
          return;
        }

        setMembers(normalizedMembers);
        setInitialMemberIds(normalizedMembers.map((member) => member.id));
        setChangedRoles({});
        setAllUsers(users);
      } catch (err) {
        console.error('Failed to load team details:', err);
        setError('Failed to load team details. Please refresh and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, normalizeUser, teamId, user]);

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
    const targetMember = members.find((member) => member.id === memberId);
    if (!targetMember) return;

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

    setChangedRoles((prev) => {
      const next = { ...prev };
      if (role === targetMember.originalRole) {
        delete next[memberId];
      } else {
        next[memberId] = role;
      }
      return next;
    });
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
    setMembers((prev) => prev.filter((member) => member.id !== memberId));
    setChangedRoles((prev) => {
      if (!(memberId in prev)) return prev;
      const next = { ...prev };
      delete next[memberId];
      return next;
    });
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
      const memberIds = members.map((member) => member.id);
      const removedMemberIds = initialMemberIds.filter(
        (memberId) => !memberIds.includes(memberId)
      );

      const roleChanges = isAdminUser
        ? members
            .filter((member) => !!changedRoles[member.id])
            .map((member) => ({
              id: member.id,
              role: changedRoles[member.id],
            }))
        : [];

      if (removedMemberIds.length > 0) {
        await Promise.all(
          removedMemberIds.map((memberId) => teamApi.removeTeamMember(teamId, memberId))
        );
      }

      await teamApi.updateTeam(teamId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        monthly_budget: Number(formData.monthly_budget),
        members: memberIds,
      });

      if (isAdminUser && roleChanges.length > 0) {
        await Promise.all(
          roleChanges.map((member) =>
            teamApi.updateTeamMemberRole(teamId, member.id, { role: String(member.role).toUpperCase() })
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
                      {isAdminUser ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as TeamRole)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Member">Member</option>
                          <option value="Manager">Manager</option>
                        </select>
                      ) : (
                        <span className="px-2 py-1 text-xs border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                          {member.role}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1 rounded-md transition-colors text-red-600 hover:bg-red-100"
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
