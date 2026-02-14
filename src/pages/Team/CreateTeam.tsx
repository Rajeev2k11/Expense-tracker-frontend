import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createTeam } from '../../features/teams/teamSlice';
import { teamApi } from '../../features/teams/teamApi';
import { userApi } from '../../features/users/userApi';
import type { User } from '../../types';
import { ArrowLeft, Users, Search, X, AlertCircle, CheckCircle } from 'lucide-react';

// Team role type for members in a team
type TeamRole = 'Manager' | 'Member';
type LeaderRole = 'Manager' | 'Admin' | 'CEO' | 'CTO';

interface SelectedMember {
  user: User;
  teamRole: TeamRole;
}

const CreateTeam: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { creating, error } = useAppSelector((state) => state.teams);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthly_budget: '',
  });

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [leaderRole, setLeaderRole] = useState<LeaderRole>('Manager');
  
  // Store selected team role for each user in the list
  const [selectedRoles, setSelectedRoles] = useState<Record<string, TeamRole>>({});

  // Check authorization
  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    const managerRoles = ['MANAGER', 'ADMIN', 'CEO', 'CTO', 'CFO', 'FOUNDER'];
    const isAuthorized = managerRoles.includes(user.role.toUpperCase());
    
    if (!isAuthorized) {
      navigate('/team');
      return;
    }
  }, [user, navigate]);

  // Load all users
  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      setUsersError(null);
      try {
        const users = await userApi.getAllUsers();
        setAllUsers(users);
        setFilteredUsers(users);
      } catch (err) {
        console.error('Failed to load users:', err);
        setUsersError('Failed to load users. Please try again.');
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  // Filter users by search term (email)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter((u) =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, allUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (userId: string, userEmail: string, role: TeamRole) => {
    const key = userId || userEmail; // Use email as fallback if ID is missing
    setSelectedRoles((prev) => ({ ...prev, [key]: role }));
  };

  const handleAddMember = (userToAdd: User) => {
    // Check if user is already added (by ID or email)
    if (selectedMembers.find((m) => 
      (userToAdd.id && m.user.id === userToAdd.id) || 
      (m.user.email === userToAdd.email)
    )) {
      return;
    }
    
    // Get selected role or default to 'Member'
    const roleKey = userToAdd.id || userToAdd.email;
    const teamRole = selectedRoles[roleKey] || 'Member';
    
    setSelectedMembers((prev) => [...prev, { user: userToAdd, teamRole }]);
  };

  const handleRemoveMember = (userId: string | undefined, userEmail: string) => {
    setSelectedMembers((prev) => prev.filter((m) => {
      // If both have valid IDs, compare by ID
      if (userId && m.user.id) {
        return m.user.id !== userId;
      }
      // Otherwise compare by email (more reliable)
      return m.user.email !== userEmail;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (!formData.name.trim()) {
      alert('Team name is required');
      return;
    }

    if (!formData.monthly_budget || parseFloat(formData.monthly_budget) <= 0) {
      alert('Please enter a valid monthly budget');
      return;
    }

    // Team leader is the current user
    const teamLeaderId = user.id;

    // Members array includes all selected member IDs + team leader
    const memberIds = [
      teamLeaderId,
      ...selectedMembers.map((m) => m.user.id).filter((id) => id !== teamLeaderId),
    ];

    try {
      const createdTeam = await dispatch(
        createTeam({
          name: formData.name,
          description: formData.description,
          team_leader: teamLeaderId,
          members: memberIds,
          monthly_budget: parseFloat(formData.monthly_budget),
          createdAt: new Date().toISOString(),
        })
      ).unwrap();

      const createdTeamId = String((createdTeam as { id?: string; _id?: string }).id ?? (createdTeam as { id?: string; _id?: string })._id ?? '');

      if (createdTeamId) {
        const roleAssignments: Array<{ memberId: string; role: string }> = [
          { memberId: teamLeaderId, role: leaderRole },
          ...selectedMembers
            .filter((m) => !!m.user.id)
            .map((m) => ({ memberId: m.user.id, role: m.teamRole })),
        ];

        if (roleAssignments.length > 0) {
          await Promise.all(
            roleAssignments.map((assignment) =>
              teamApi.updateTeamMemberRole(createdTeamId, assignment.memberId, { role: assignment.role })
            )
          );
        }
      }

      // Success - navigate back to team page
      navigate('/team');
    } catch (err) {
      console.error('Failed to create team:', err);
      // Error is handled by Redux state
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/team')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Teams
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Team</h1>
          <p className="text-gray-600 mt-2">Set up a new team with members and budget allocation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team Details Card */}
          <Card padding="lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Details</h2>
            <div className="space-y-4">
              {/* Team Name */}
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
                  placeholder="e.g., Development Team"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the team's responsibilities"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Monthly Budget */}
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
                    placeholder="5000"
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Team Leader Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-sm text-blue-800">
                    <strong>Team Leader:</strong> {user.fullName} ({user.email})
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-blue-900">Leader Role:</label>
                    <select
                      value={leaderRole}
                      onChange={(e) => setLeaderRole(e.target.value as LeaderRole)}
                      className="px-2 py-1 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                      <option value="CEO">CEO</option>
                      <option value="CTO">CTO</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Add Members Card */}
          <Card padding="lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Add Team Members
            </h2>

            {/* Search Box */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by email..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Users List */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Select users to add to the team (optional)</p>
              
              {loadingUsers && (
                <div className="text-center py-8 text-gray-500">Loading users...</div>
              )}

              {usersError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  {usersError}
                </div>
              )}

              {!loadingUsers && !usersError && (
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <div className="max-h-80 overflow-y-auto">
                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        {searchTerm ? 'No users found matching your search' : 'No users available'}
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {filteredUsers.map((userItem, index) => {
                          const isAlreadyAdded = selectedMembers.find((m) => 
                            (userItem.id && m.user.id === userItem.id) || 
                            (m.user.email === userItem.email)
                          );
                          const isCurrentUser = userItem.id === user.id;
                          const roleKey = userItem.id || userItem.email; // Use email as fallback
                          const selectedRole = selectedRoles[roleKey] || 'Member';

                          return (
                            <div
                              key={userItem.id || `user-${index}`}
                              className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {userItem.fullName}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs text-blue-600">(You - Team Leader)</span>
                                  )}
                                </p>
                                <p className="text-sm text-gray-600 truncate">{userItem.email}</p>
                              </div>
                              <div className="flex items-center gap-3 ml-4">
                                {!isCurrentUser && (
                                  <select
                                    value={selectedRole}
                                    onChange={(e) => handleRoleChange(userItem.id, userItem.email, e.target.value as TeamRole)}
                                    className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={!!isAlreadyAdded}
                                  >
                                    <option value="Member">Member</option>
                                    <option value="Manager">Manager</option>
                                  </select>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleAddMember(userItem)}
                                  disabled={!!isAlreadyAdded || isCurrentUser}
                                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                    isAlreadyAdded || isCurrentUser
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      : 'bg-blue-600 text-white hover:bg-blue-700'
                                  }`}
                                >
                                  {isCurrentUser ? 'Leader' : isAlreadyAdded ? 'Added' : 'Add'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Members */}
            {(selectedMembers.length > 0 || !!user) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Selected Members ({selectedMembers.length + 1})
                </h3>
                <div className="space-y-2">
                  <div
                    className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{user.fullName}</p>
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-xs px-2 py-1 bg-white border border-blue-300 text-gray-700 rounded-full whitespace-nowrap">
                        {leaderRole}
                      </span>
                      <span className="text-xs text-blue-700 font-medium">Leader (Auto Added)</span>
                    </div>
                  </div>

                  {selectedMembers.map((member, index) => (
                    <div
                      key={member.user.id || `selected-${index}`}
                      className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{member.user.fullName}</p>
                        <p className="text-sm text-gray-600 truncate">{member.user.email}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-xs px-2 py-1 bg-white border border-green-300 text-gray-700 rounded-full whitespace-nowrap">
                          {member.teamRole}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.user.id, member.user.email)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                          title="Remove member"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              disabled={creating}
              className="flex-1"
            >
              {creating ? 'Creating Team...' : 'Create Team'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/team')}
              disabled={creating}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateTeam;
