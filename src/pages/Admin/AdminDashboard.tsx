// AdminDashboard.tsx
import React, { useState } from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { fetchUsersList, inviteUser } from '../../redux/slices/authSlice';
import Layout from '../../components/layout/Layout';
import { 
  Users, 
  Settings, 
  UserPlus, 
  Plus, 
  Mail, 
  Briefcase, 
  Building, 
  MoreVertical,
  Edit,
  Trash2,
  X,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';

// Types
interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  icon: string;
  members: Employee[];
  createdAt: string;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  team: string;
  status: 'pending' | 'accepted' | 'rejected';
  sentAt: string;
}

const AdminDashboard: React.FC = () => {
  // State for employees
  const [employees, setEmployees] = useState<Employee[]>([]);

  // State for teams
  const [teams, setTeams] = useState<Team[]>([
    {
      id: '1',
      name: 'Engineering',
      description: 'Software development and engineering team',
      icon: 'engineering',
      members: [],
      createdAt: '2023-01-15'
    },
    {
      id: '2',
      name: 'Design',
      description: 'UI/UX design and creative team',
      icon: 'design',
      members: [],
      createdAt: '2023-02-20'
    },
    {
      id: '3',
      name: 'Marketing',
      description: 'Marketing and sales team',
      icon: 'marketing',
      members: [],
      createdAt: '2023-03-10'
    },
    {
      id: '4',
      name: 'Operations',
      description: 'Business operations and management',
      icon: 'operations',
      members: [],
      createdAt: '2023-04-05'
    }
  ]);

  // State for invites
  const [invites, setInvites] = useState<Invite[]>([
    {
      id: '1',
      email: 'newhire@company.com',
      role: 'Frontend Developer',
      team: 'Engineering',
      status: 'pending',
      sentAt: '2023-05-01'
    },
    {
      id: '2',
      email: 'designer@company.com',
      role: 'Product Designer',
      team: 'Design',
      status: 'accepted',
      sentAt: '2023-04-28'
    },
    {
      id: '3',
      email: 'marketer@company.com',
      role: 'Digital Marketer',
      team: 'Marketing',
      status: 'rejected',
      sentAt: '2023-04-25'
    }
  ]);

  // State for forms
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: '',
    team: '',
    name: ''
  });

  const dispatch = useAppDispatch();

  React.useEffect(() => {
    // Fetch users from mock API
    let cancelled = false;
    (async () => {
      try {
        const resp: any = await dispatch(fetchUsersList()).unwrap();
        if (cancelled) return;
        const list = (resp || []).map((u: any) => ({ id: u.id, name: u.fullName, email: u.email, role: u.role, team: '', status: 'active', avatar: u.avatar || '' }));
        setEmployees(list);
      } catch (e) {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [dispatch]);

  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
    icon: 'users'
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [expandedSection, setExpandedSection] = useState<'invite' | 'team' | null>(null);
  
  // Delete confirmation states
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'team' | 'employee';
    id: string;
    name: string;
  } | null>(null);

  // Initialize team members
  React.useEffect(() => {
    const updatedTeams = teams.map(team => ({
      ...team,
      members: employees.filter(emp => emp.team === team.name)
    }));
    // Only update teams when the members actually change to avoid infinite re-renders
    setTeams((prev) => {
      const prevMembers = prev.map(t => t.members.map(m => m.id).join(',')).join('|');
      const newMembers = updatedTeams.map(t => t.members.map(m => m.id).join(',')).join('|');
      if (prevMembers === newMembers) return prev;
      return updatedTeams;
    });
  }, [employees]);

  // Invite Employee Handler
  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.role || !inviteForm.team || !inviteForm.name) {
      alert('Please fill all fields (name, email, role, team)');
      return;
    }

    (async () => {
      try {
        const payload = { team: inviteForm.team, email: inviteForm.email, role: inviteForm.role, name: inviteForm.name };
        const resp: any = await dispatch(inviteUser(payload)).unwrap();
        const user = resp?.user;
        const newInvite: Invite = {
          id: user?.id || Date.now().toString(),
          email: inviteForm.email,
          role: inviteForm.role,
          team: inviteForm.team,
          status: 'pending',
          sentAt: new Date().toISOString().split('T')[0]
        };
        setInvites([...invites, newInvite]);
        setInviteForm({ email: '', role: '', team: '', name: '' });
        setExpandedSection(null);
        // Show success message
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (e) {
        // Show helpful message from server when present
        // axios unwrap() will throw the rejectWithValue payload or the axios error
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err: any = e;
        const msg = err?.message || err?.response?.data?.message || err?.response?.data || 'Invite failed';
        console.error('[invite] error', err);
        alert(`Invite failed: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
      }
    })();
  };

  // Create Team Handler
  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamForm.name) {
      alert('Please enter team name');
      return;
    }
    
    // Check if team name already exists
    if (teams.some(team => team.name.toLowerCase() === teamForm.name.toLowerCase())) {
      alert('A team with this name already exists');
      return;
    }
    
    const newTeam: Team = {
      id: Date.now().toString(),
      name: teamForm.name,
      description: teamForm.description,
      icon: teamForm.icon,
      members: [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setTeams([...teams, newTeam]);
    setTeamForm({ name: '', description: '', icon: 'users' });
    setExpandedSection(null);
    
    // Show success message for team creation
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Update Team Handler
  const handleUpdateTeam = (teamId: string, updates: Partial<Team>) => {
    setTeams(teams.map(team => 
      team.id === teamId ? { ...team, ...updates } : team
    ));
    setEditingTeam(null);
  };

  // Open Delete Confirmation Modal
  const openDeleteModal = (type: 'team' | 'employee', id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      type,
      id,
      name
    });
  };

  // Close Delete Confirmation Modal
  const closeDeleteModal = () => {
    setDeleteModal(null);
  };

  // Delete Team Handler
  const handleDeleteTeam = (teamId: string) => {
    const teamToDelete = teams.find(t => t.id === teamId);
    if (!teamToDelete) return;

    // Remove team from employees
    setEmployees(employees.map(emp => 
      emp.team === teamToDelete.name 
        ? { ...emp, team: 'No Team' } 
        : emp
    ));
    
    // Remove team
    setTeams(teams.filter(team => team.id !== teamId));
    closeDeleteModal();
  };

  // Remove Employee Handler
  const handleRemoveEmployee = (employeeId: string) => {
    setEmployees(employees.filter(emp => emp.id !== employeeId));
    closeDeleteModal();
  };

  // Confirm Delete Action
  const confirmDelete = () => {
    if (!deleteModal) return;

    if (deleteModal.type === 'team') {
      handleDeleteTeam(deleteModal.id);
    } else if (deleteModal.type === 'employee') {
      handleRemoveEmployee(deleteModal.id);
    }
  };

  // Get icon component based on icon name
  const getIconComponent = (iconName: string, size: number = 20) => {
    const iconProps = { size, className: "text-gray-600" };
    
    switch (iconName) {
      case 'engineering':
        return <Settings {...iconProps} />;
      case 'design':
        return <Briefcase {...iconProps} />;
      case 'marketing':
        return <Building {...iconProps} />;
      case 'operations':
        return <Users {...iconProps} />;
      case 'users':
        return <Users {...iconProps} />;
      case 'settings':
        return <Settings {...iconProps} />;
      case 'briefcase':
        return <Briefcase {...iconProps} />;
      case 'building':
        return <Building {...iconProps} />;
      default:
        return <Users {...iconProps} />;
    }
  };

  // Available icons for teams
  const teamIcons = [
    { name: 'users', component: <Users size={24} /> },
    { name: 'settings', component: <Settings size={24} /> },
    { name: 'briefcase', component: <Briefcase size={24} /> },
    { name: 'building', component: <Building size={24} /> }
  ];

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'accepted':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-yellow-500" />;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle size={20} className="text-green-500 mr-2" />
              <p className="text-green-800 font-medium">
                {expandedSection === 'invite' ? 'Invitation sent successfully!' : 'Team created successfully!'}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Invite Employee Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button 
              onClick={() => setExpandedSection(expandedSection === 'invite' ? null : 'invite')}
              className="w-full p-6 flex items-center justify-between text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <UserPlus size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Invite Employee</h3>
                  <p className="text-sm text-gray-600">Send invitations to new team members</p>
                </div>
              </div>
              <ChevronDown 
                size={20} 
                className={`text-gray-400 transition-transform ${
                  expandedSection === 'invite' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expandedSection === 'invite' && (
              <div className="px-6 pb-6 border-t border-gray-200">
                <form onSubmit={handleInvite} className="space-y-4 mt-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="employee@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserPlus size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        id="name"
                        value={inviteForm.name}
                        onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Full name of the invitee"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <div className="relative">
                      <Briefcase size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        id="role"
                        value={inviteForm.role}
                        onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g. Developer, Designer"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="invite-team" className="block text-sm font-medium text-gray-700 mb-1">
                      Team
                    </label>
                    <div className="relative">
                      <Users size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <select
                        id="invite-team"
                        value={inviteForm.team}
                        onChange={(e) => setInviteForm({...inviteForm, team: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        required
                      >
                        <option value="">Select a team</option>
                        {teams.map(team => (
                          <option key={team.id} value={team.name}>{team.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!(inviteForm.email && inviteForm.role && inviteForm.team && inviteForm.name)}
                    className={`w-full flex items-center justify-center space-x-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${inviteForm.email && inviteForm.role && inviteForm.team && inviteForm.name ? 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' : 'bg-blue-300 cursor-not-allowed'}`}
                  >
                    <Send size={16} />
                    <span>Send Invitation</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Create Team Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button 
              onClick={() => setExpandedSection(expandedSection === 'team' ? null : 'team')}
              className="w-full p-6 flex items-center justify-between text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Plus size={24} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Create Team</h3>
                  <p className="text-sm text-gray-600">Create a new team for your organization</p>
                </div>
              </div>
              <ChevronDown 
                size={20} 
                className={`text-gray-400 transition-transform ${
                  expandedSection === 'team' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expandedSection === 'team' && (
              <div className="px-6 pb-6 border-t border-gray-200">
                <form onSubmit={handleCreateTeam} className="space-y-4 mt-4">
                  <div>
                    <label htmlFor="team-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Team Name
                    </label>
                    <input
                      type="text"
                      id="team-name"
                      value={teamForm.name}
                      onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. Engineering, Design"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="team-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="team-description"
                      value={teamForm.description}
                      onChange={(e) => setTeamForm({...teamForm, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Team description..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Icon
                    </label>
                    <div className="flex space-x-3">
                      {teamIcons.map((icon) => (
                        <button
                          key={icon.name}
                          type="button"
                          className={`p-3 border-2 rounded-lg transition-all ${
                            teamForm.icon === icon.name 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setTeamForm({...teamForm, icon: icon.name})}
                        >
                          {icon.component}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Plus size={16} />
                    <span>Create Team</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Teams Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Teams ({teams.length})</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users size={16} />
                  <span>{employees.length} Total Employees</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map(team => (
                  <div key={team.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg mr-3">
                          {getIconComponent(team.icon)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{team.name}</h3>
                          <p className="text-sm text-gray-500">{team.members.length} members</p>
                        </div>
                      </div>
                      <div className="relative">
                        <button 
                          className="text-gray-400 hover:text-gray-600 p-1"
                          onClick={() => setSelectedTeam(selectedTeam?.id === team.id ? null : team)}
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {selectedTeam?.id === team.id && (
                          <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200">
                            <button 
                              className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => {
                                setEditingTeam(team);
                                setSelectedTeam(null);
                              }}
                            >
                              <Edit size={14} className="mr-2" />
                              Edit Team
                            </button>
                            <button 
                              className="flex items-center w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                              onClick={() => openDeleteModal('team', team.id, team.name)}
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete Team
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{team.description}</p>
                    
                    <div className="space-y-3">
                      {team.members.length > 0 ? (
                        team.members.map(member => (
                          <div key={member.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <img 
                                src={member.avatar} 
                                alt={member.name}
                                className="h-8 w-8 rounded-full mr-3"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                <p className="text-xs text-gray-500">{member.role}</p>
                              </div>
                            </div>
                            <button 
                              className="text-red-500 hover:text-red-700 text-sm p-1"
                              onClick={() => openDeleteModal('employee', member.id, member.name)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-2">No members in this team</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Pending Invites */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Pending Invites</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sent Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invites.map(invite => (
                      <tr key={invite.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invite.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invite.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invite.team}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(invite.status)}
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              invite.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : invite.status === 'accepted'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invite.sentAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {invites.length === 0 && (
                  <div className="text-center py-8">
                    <Mail size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No pending invites</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Team Modal */}
        {editingTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Team</h3>
                <button 
                  onClick={() => setEditingTeam(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateTeam(editingTeam.id, {
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  icon: formData.get('icon') as string
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Team Name
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      name="name"
                      defaultValue={editingTeam.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="edit-description"
                      name="description"
                      defaultValue={editingTeam.description}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Icon
                    </label>
                    <div className="flex space-x-3">
                      {teamIcons.map((icon) => (
                        <label key={icon.name} className="cursor-pointer">
                          <input
                            type="radio"
                            name="icon"
                            value={icon.name}
                            defaultChecked={editingTeam.icon === icon.name}
                            className="sr-only"
                          />
                          <div className={`p-3 border-2 rounded-lg transition-all ${
                            editingTeam.icon === icon.name 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            {icon.component}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingTeam(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertTriangle size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                  <p className="text-sm text-gray-600">
                    {deleteModal.type === 'team' 
                      ? `Are you sure you want to delete the team "${deleteModal.name}"? This action cannot be undone.`
                      : `Are you sure you want to remove "${deleteModal.name}" from the team?`
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;