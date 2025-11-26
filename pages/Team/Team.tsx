import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import api from '../../services/api';
import type { Team, User, Role } from '../../types';
import { Users, Plus, Search, Mail, UserPlus, Settings, Download, Trash2, Edit } from 'lucide-react';

const TeamPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  // New team form state
  const [newTeam, setNewTeam] = useState({
    name: '',
    department: '',
    color: '#3B82F6',
    monthlyBudget: ''
  });

  // Add member form state
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '' as Role,
    teamId: ''
  });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const res = await api.get('/teams');
      setTeams(res.data);
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setLoading(false);
    }
  };

  // Demo data for teams (replace with actual API data)
  const demoTeams: Team[] = [
    {
      id: '1',
      name: 'Frontend Team',
      color: '#3B82F6',
      department: 'Engineering',
      monthlyBudget: 15000,
      activeCount: 8,
      members: [
        {
          id: '1',
          fullName: 'John Doe',
          email: 'john.doe@company.com',
          role: 'Team Leader',
          token: 'token',
          department: 'Engineering'
        },
        {
          id: '2',
          fullName: 'Jane Smith',
          email: 'jane.smith@company.com',
          role: 'Developer',
          token: 'token',
          department: 'Engineering'
        }
      ]
    },
    {
      id: '2',
      name: 'Marketing Team',
      color: '#10B981',
      department: 'Marketing',
      monthlyBudget: 20000,
      activeCount: 6,
      members: [
        {
          id: '3',
          fullName: 'Mike Johnson',
          email: 'mike.johnson@company.com',
          role: 'Manager',
          token: 'token',
          department: 'Marketing'
        }
      ]
    }
  ];

  const departments = ['All', 'Engineering', 'Marketing', 'Sales', 'Design', 'Operations', 'HR', 'Finance'];
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  const displayedTeams = teams.length > 0 ? teams : demoTeams;

  const filteredTeams = displayedTeams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All' || team.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const totalMembers = displayedTeams.reduce((sum, team) => sum + team.members.length, 0);
  const activeMembers = displayedTeams.reduce((sum, team) => sum + team.activeCount, 0);

  // Team Management Functions
  const createTeam = async () => {
    const teamData = {
      ...newTeam,
      id: Date.now().toString(),
      monthlyBudget: parseInt(newTeam.monthlyBudget) || 0,
      activeCount: 0,
      members: []
    };

    setTeams(prev => [...prev, teamData as Team]);
    setShowCreateTeamModal(false);
    setNewTeam({ name: '', department: '', color: '#3B82F6', monthlyBudget: '' });
  };

  const deleteTeam = async (team: Team) => {
    setTeams(prev => prev.filter(t => t.id !== team.id));
    setShowDeleteModal(false);
    setTeamToDelete(null);
  };

  const addMember = async () => {
    if (!newMember.teamId) return;

    const memberData: User = {
      id: Date.now().toString(),
      fullName: `${newMember.firstName} ${newMember.lastName}`,
      email: newMember.email,
      role: newMember.role,
      token: 'token',
      department: displayedTeams.find(t => t.id === newMember.teamId)?.department || ''
    };

    setTeams(prev => prev.map(team => 
      team.id === newMember.teamId 
        ? { ...team, members: [...team.members, memberData] }
        : team
    ));

    setShowAddMemberModal(false);
    setNewMember({ firstName: '', lastName: '', email: '', role: '' as Role, teamId: '' });
  };

  const deleteMembers = async (teamId: string, memberIds: string[]) => {
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, members: team.members.filter(m => !memberIds.includes(m.id)) }
        : team
    ));
    setSelectedMembers([]);
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectAllMembers = (team: Team) => {
    if (selectedMembers.length === team.members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(team.members.map(m => m.id));
    }
  };

  // Export Functions
  const exportToCSV = () => {
    const csvData = displayedTeams.flatMap(team => 
      team.members.map(member => ({
        Team: team.name,
        Department: team.department,
        'Member Name': member.fullName,
        Email: member.email,
        Role: member.role,
        'Team Budget': team.monthlyBudget
      }))
    );

    const headers = ['Team', 'Department', 'Member Name', 'Email', 'Role', 'Team Budget'];
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'teams_export.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Simple PDF export simulation
    alert('PDF export functionality would be implemented here with a PDF library like jsPDF');
  };

  const viewTeamDetails = (team: Team) => {
    setSelectedTeam(team);
    setSelectedMembers([]);
    setShowTeamModal(true);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const getRoleColor = (role: Role) => {
    const roleColors: { [key: string]: string } = {
      'CEO': 'blue',
      'CTO': 'blue',
      'CFO': 'blue',
      'Manager': 'green',
      'Team Leader': 'green',
      'HR': 'purple',
      'Designer': 'orange',
      'Developer': 'orange',
      'Marketing': 'pink',
      'Sales': 'red',
      'Support': 'yellow'
    };
    return roleColors[role] || 'gray';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-1">Manage your teams and members</p>
          </div>
          <div className="flex items-center gap-3 mt-4 lg:mt-0">
            <div className="relative group">
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button 
                  onClick={exportToCSV}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Export as CSV
                </button>
                <button 
                  onClick={exportToPDF}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Export as PDF
                </button>
              </div>
            </div>
            <Button 
              onClick={() => setShowAddMemberModal(true)}
              size="sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
            <Button 
              onClick={() => setShowCreateTeamModal(true)}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card padding="lg" hover={true}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{displayedTeams.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card padding="lg" hover={true}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{totalMembers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card padding="lg" hover={true}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{activeMembers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card padding="lg" hover={true}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{departments.length - 1}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search teams or members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 w-full md:w-64 text-sm"
                />
              </div>

              {/* Department Filter */}
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-600">
              {filteredTeams.length} of {displayedTeams.length} teams
            </div>
          </div>
        </Card>

        {/* Teams Grid */}
        {filteredTeams.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first team.</p>
            <Button onClick={() => setShowCreateTeamModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <Card key={team.id} padding="lg" hover={true}>
                {/* Team Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: team.color }}
                    >
                      {getInitials(team.name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-600">{team.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        setTeamToDelete(team);
                        setShowDeleteModal(true);
                      }}
                      className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-gray-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Team Stats */}
                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{team.members.length}</p>
                    <p className="text-xs text-gray-600">Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{team.activeCount}</p>
                    <p className="text-xs text-gray-600">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      ${team.monthlyBudget?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-gray-600">Budget</p>
                  </div>
                </div>

                {/* Team Members */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Team Members</h4>
                  <div className="space-y-2">
                    {team.members.slice(0, 3).map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                            {getInitials(member.fullName)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{member.fullName}</p>
                            <Badge 
                              status={getRoleColor(member.role) as 'default'} 
                              size="sm"
                              className="mt-1"
                            >
                              {member.role}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {member.email}
                        </div>
                      </div>
                    ))}
                    {team.members.length > 3 && (
                      <div className="text-center">
                        <button className="text-sm text-blue-600 hover:text-blue-700">
                          + {team.members.length - 3} more members
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => viewTeamDetails(team)}
                  >
                    View Details
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Team Details Modal */}
        <Modal
          open={showTeamModal && !!selectedTeam}
          onClose={() => {
            setShowTeamModal(false);
            setSelectedTeam(null);
            setSelectedMembers([]);
          }}
          title={selectedTeam?.name}
          size="lg"
        >
          {selectedTeam && (
            <div className="space-y-6">
              {/* Team Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Team Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Department:</span>
                      <span className="text-sm font-medium">{selectedTeam.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Members:</span>
                      <span className="text-sm font-medium">{selectedTeam.members.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active Members:</span>
                      <span className="text-sm font-medium">{selectedTeam.activeCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Monthly Budget:</span>
                      <span className="text-sm font-medium">${selectedTeam.monthlyBudget?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Team Lead</h4>
                  {selectedTeam.members.find(m => m.role === 'Manager' || m.role === 'Team Leader') ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                        {getInitials(selectedTeam.members.find(m => m.role === 'Manager' || m.role === 'Team Leader')!.fullName)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedTeam.members.find(m => m.role === 'Manager' || m.role === 'Team Leader')!.fullName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedTeam.members.find(m => m.role === 'Manager' || m.role === 'Team Leader')!.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No team lead assigned</p>
                  )}
                </div>
              </div>

              {/* All Members with Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">All Team Members</h4>
                  {selectedMembers.length > 0 && (
                    <Button 
                      variant="danger"
                      size="sm"
                      onClick={() => deleteMembers(selectedTeam.id, selectedMembers)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Selected ({selectedMembers.length})
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedMembers.length === selectedTeam.members.length}
                      onChange={() => selectAllMembers(selectedTeam)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Select All</span>
                  </div>

                  {selectedTeam.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.id)}
                          onChange={() => toggleMemberSelection(member.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                          {getInitials(member.fullName)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.fullName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge status={getRoleColor(member.role) as 'default'} size="sm">
                              {member.role}
                            </Badge>
                            <span className="text-sm text-gray-500">{member.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteMembers(selectedTeam.id, [member.id])}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="secondary">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Team
                </Button>
                <Button onClick={() => setShowAddMemberModal(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Create Team Modal */}
        <Modal
          open={showCreateTeamModal}
          onClose={() => setShowCreateTeamModal(false)}
          title="Create New Team"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
              <input
                type="text"
                value={newTeam.name}
                onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="Enter team name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={newTeam.department}
                onChange={(e) => setNewTeam(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                <option value="">Select department</option>
                {departments.filter(dept => dept !== 'All').map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team Color</label>
              <div className="flex gap-2 flex-wrap">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewTeam(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newTeam.color === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget ($)</label>
              <input
                type="number"
                value={newTeam.monthlyBudget}
                onChange={(e) => setNewTeam(prev => ({ ...prev, monthlyBudget: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="Enter monthly budget"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCreateTeamModal(false)}>
                Cancel
              </Button>
              <Button onClick={createTeam} disabled={!newTeam.name || !newTeam.department}>
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </div>
          </div>
        </Modal>

        {/* Add Member Modal */}
        <Modal
          open={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          title="Add Team Member"
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={newMember.firstName}
                  onChange={(e) => setNewMember(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={newMember.lastName}
                  onChange={(e) => setNewMember(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="john.doe@company.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value as Role }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="">Select role</option>
                  <option value="Manager">Manager</option>
                  <option value="Team Leader">Team Leader</option>
                  <option value="Developer">Developer</option>
                  <option value="Designer">Designer</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
                <select
                  value={newMember.teamId}
                  onChange={(e) => setNewMember(prev => ({ ...prev, teamId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="">Select team</option>
                  {displayedTeams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowAddMemberModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={addMember} 
                disabled={!newMember.firstName || !newMember.lastName || !newMember.email || !newMember.role || !newMember.teamId}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          open={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setTeamToDelete(null);
          }}
          title="Delete Team"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete the team <strong>"{teamToDelete?.name}"</strong>? 
              This action cannot be undone and all team data will be permanently removed.
            </p>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={() => teamToDelete && deleteTeam(teamToDelete)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Team
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default TeamPage;