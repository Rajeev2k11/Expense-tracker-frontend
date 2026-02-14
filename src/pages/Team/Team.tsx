import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { TeamWithDetails, User, Role } from '../../types';
import { 
  Users, Plus, Search, Mail, UserPlus,
  Download, Trash2, Edit, FolderPlus, Tag, MoreVertical,
  Calendar
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  fetchCategories, 
  createCategory as createCategoryAction, 
  updateCategory as updateCategoryAction, 
  deleteCategory as deleteCategoryAction 
} from '../../features/categories/categorySlice';
import { 
  fetchTeams as fetchTeamsAction, 
  deleteTeam as deleteTeamAction 
} from '../../features/teams/teamSlice';
import type { Category } from '../../features/categories/categoryApi';

type TeamItem = {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  color?: string;
  department?: string;
  monthlyBudget?: number;
  monthly_budget?: number;
  activeCount?: number;
  members: User[];
  createdAt?: string;
  created_at?: string;
  createdDate?: string;
  created_date?: string;
};

type CategoryWithFallbackId = Category & { _id?: string };
type DeletableTeam = TeamWithDetails | TeamItem;
const DEMO_TEAMS: TeamItem[] = [];

const TeamPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, defaultTeamId, setDefaultTeam } = useAuth();
  const dispatch = useAppDispatch();
  const { categories, creating: creatingCategory, updating: updatingCategory, deleting: deletingCategory } = useAppSelector((state) => state.categories);
  const { teams: reduxTeams, loading: teamsLoading, deleting: deletingTeam } = useAppSelector((state) => state.teams);
  
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTeamActionMenu, setShowTeamActionMenu] = useState<string | null>(null);
  const [teamActionMenuPosition, setTeamActionMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedTeam, setSelectedTeam] = useState<TeamItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithFallbackId | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamDefaultingId, setTeamDefaultingId] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [teamToDelete, setTeamToDelete] = useState<DeletableTeam | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithFallbackId | null>(null);
  const [showCategoryMenu, setShowCategoryMenu] = useState<string | null>(null);

  // New team form state
  const [newTeam, setNewTeam] = useState({
    name: '',
    department: '',
    color: '#3B82F6',
    monthlyBudget: ''
  });

  // New/Edit category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  // Add member form state
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '' as Role,
    teamId: ''
  });

  const loadTeams = useCallback(async () => {
    try {
      const res = await api.get('/v1/teams');
      const apiTeams = Array.isArray(res.data) ? (res.data as TeamItem[]) : [];
      setTeams(apiTeams);
    } catch (error) {
      console.error('Failed to load teams:', error);
      // Fallback to demo data if API fails
      setTeams(DEMO_TEAMS);
    } finally {
      setLoading(false);
    }
  }, []);

  // Category menus use closest-based click detection (no shared ref needed)
  // (clicks outside are detected via event.target.closest('[data-category-menu]'))

  useEffect(() => {
    loadTeams();
    dispatch(fetchCategories());
    dispatch(fetchTeamsAction());
  }, [dispatch, loadTeams]);

  // Check if user can create/edit/delete teams (Admin or Manager)
  const canManageTeams = () => {
    if (!user) return false;
    const managerRoles = ['MANAGER', 'ADMIN', 'CEO', 'CTO', 'CFO', 'FOUNDER'];
    return managerRoles.includes(user.role.toUpperCase());
  };

  const departments = ['All', 'Engineering', 'Marketing', 'Sales', 'Design', 'Operations', 'HR', 'Finance'];
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  const displayedTeams = teams.length > 0 ? teams : DEMO_TEAMS;

  const filteredTeams = displayedTeams.filter((team) => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All' || team.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const totalMembers = displayedTeams.reduce((sum, team) => sum + team.members.length, 0);

  // Team Management Functions
  const createTeam = async () => {
    const teamData = {
      ...newTeam,
      id: Date.now().toString(),
      monthlyBudget: parseInt(newTeam.monthlyBudget) || 0,
      activeCount: 0,
      members: []
    };

    setTeams(prev => [...prev, teamData]);
    setShowCreateTeamModal(false);
    setNewTeam({ name: '', department: '', color: '#3B82F6', monthlyBudget: '' });
  };

  // Category Management Functions
  const createCategory = async () => {
    if (!categoryForm.name || !categoryForm.description) return;
    try {
      await dispatch(createCategoryAction({
        name: categoryForm.name,
        description: categoryForm.description,
        color: categoryForm.color
      })).unwrap();

      setShowCreateCategoryModal(false);
      setCategoryForm({ name: '', description: '', color: '#3B82F6' });
    } catch (err) {
      console.error('Failed to create category:', err);
      alert(err as string);
    }
  };

  const updateCategory = async () => {
    if (!selectedCategory || !categoryForm.name || !categoryForm.description) return;
    const idToUse = getCategoryId(selectedCategory);
    if (!idToUse) {
      alert('Category id is missing. Please reopen the edit modal and try again.');
      return;
    }
    try {
      await dispatch(updateCategoryAction({
        id: idToUse,
        payload: {
          name: categoryForm.name,
          description: categoryForm.description,
          color: categoryForm.color
        }
      })).unwrap();

      setShowEditCategoryModal(false);
      setSelectedCategory(null);
      setCategoryForm({ name: '', description: '', color: '#3B82F6' });
      setShowCategoryMenu(null);
    } catch (err) {
      console.error('Failed to update category:', err);
      alert(err as string);
    }
  };

  const deleteCategory = async (category: CategoryWithFallbackId) => {
    try {
      const idToUse = getCategoryId(category);
      if (!idToUse) throw new Error('Category id missing');
      await dispatch(deleteCategoryAction(idToUse)).unwrap();
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      setShowCategoryMenu(null);
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert(err as string);
    }
  };

  const openEditCategoryModal = (category: CategoryWithFallbackId) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      color: category.color
    });
    setShowEditCategoryModal(true);
    setShowCategoryMenu(null);
  };

  const openDeleteCategoryModal = (category: CategoryWithFallbackId) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
    setShowCategoryMenu(null);
  };

  const toggleCategoryMenu = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCategoryMenu(prev => prev === categoryId ? null : categoryId);
  };

  const deleteTeam = async (teamId: string) => {
    setTeams(prev => prev.filter(t => t.id !== teamId));
    setShowDeleteModal(false);
    setTeamToDelete(null);
  };

  const handleTeamEdit = (teamId: string) => {
    navigate(`/team/edit/${teamId}`);
    setShowTeamActionMenu(null);
    setTeamActionMenuPosition(null);
  };

  const handleTeamDeleteClick = (team: TeamWithDetails) => {
    setTeamToDelete(team);
    setShowDeleteModal(true);
    setShowTeamActionMenu(null);
    setTeamActionMenuPosition(null);
  };

  const toggleTeamActionMenu = (teamId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (showTeamActionMenu === teamId) {
      setShowTeamActionMenu(null);
      setTeamActionMenuPosition(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 192;
    const menuHeight = 96;
    const gap = 8;

    const openUp = window.innerHeight - rect.bottom < menuHeight + 16 && rect.top > menuHeight + 16;
    const top = openUp ? rect.top - menuHeight - gap : rect.bottom + gap;
    const left = Math.max(8, rect.right - menuWidth);

    setTeamActionMenuPosition({ top, left });
    setShowTeamActionMenu(teamId);
  };

  const handleTeamDeleteConfirm = async () => {
    if (!teamToDelete) return;
    try {
      const teamId = getTeamId(teamToDelete);
      if (!teamId) {
        throw new Error('Team id is missing');
      }
      await dispatch(deleteTeamAction(teamId)).unwrap();
      setShowDeleteModal(false);
      setTeamToDelete(null);
      dispatch(fetchTeamsAction());
    } catch (error) {
      console.error('Failed to delete team:', error);
    }
  };

  const handleSetAsDefaultTeam = async (teamId: string) => {
    if (!teamId || teamId === defaultTeamId) return;

    try {
      setTeamDefaultingId(teamId);
      await setDefaultTeam(teamId);
      setShowTeamActionMenu(null);
      setTeamActionMenuPosition(null);
    } catch (error) {
      console.error('Failed to set default team:', error);
    } finally {
      setTeamDefaultingId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getEntityId = (value: { id?: string; _id?: string } | null | undefined): string => {
    return String(value?.id ?? value?._id ?? '');
  };

  const getTeamId = (team: TeamWithDetails | TeamItem): string => {
    return getEntityId(team);
  };

  const getTeamCreatedAt = (team: TeamWithDetails | TeamItem): string => {
    const source = team as {
      createdAt?: string;
      created_at?: string;
      createdDate?: string;
      created_date?: string;
    };

    return source.createdAt || source.created_at || source.createdDate || source.created_date || '';
  };

  const getCategoryId = (category: CategoryWithFallbackId | null | undefined): string => {
    return getEntityId(category);
  };

  const getMemberId = (member: User | string, index: number): string => {
    if (typeof member === 'string') return member;
    return member.id || member.email || String(index);
  };

  const addMember = async () => {
    if (!newMember.teamId) return;

    const memberData: User = {
      id: Date.now().toString(),
      fullName: `${newMember.firstName} ${newMember.lastName}`,
      email: newMember.email,
      role: newMember.role,
      token: 'token',
      department: displayedTeams.find((t) => t.id === newMember.teamId)?.department || ''
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
        ? { ...team, members: team.members.filter((m) => !memberIds.includes(getMemberId(m, 0))) }
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

  const selectAllMembers = (team: TeamItem) => {
    if (selectedMembers.length === team.members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(team.members.map((m, index) => getMemberId(m, index)));
    }
  };

  // Export Functions
  const exportToCSV = () => {
    const csvData = displayedTeams.flatMap((team) => 
      team.members.map((member) => ({
        Team: team.name,
        Department: team.department,
        'Member Name': member.fullName,
        Email: member.email,
        Role: member.role,
        'Team Budget': team.monthlyBudget ?? team.monthly_budget ?? 0
      }))
    );

    const headers = ['Team', 'Department', 'Member Name', 'Email', 'Role', 'Team Budget'];
    const csvContent = [
      headers.join(','),
      ...csvData.map((row) => 
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

  // Close category menu when clicking outside (checks closest [data-category-menu] or toggle)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-category-menu]') && !target.closest('[data-category-toggle]')) {
        setShowCategoryMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Team Management</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your teams, categories and members</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="relative group">
              <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
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
              onClick={() => setShowCreateCategoryModal(true)}
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Create Category</span>
              <span className="sm:hidden">Category</span>
            </Button>
            <Button 
              onClick={() => setShowAddMemberModal(true)}
              size="sm"
              className="w-full sm:w-auto"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add Member</span>
              <span className="sm:hidden">Member</span>
            </Button>
            {canManageTeams() && (
              <Button 
                onClick={() => navigate('/team/create')}
                size="sm"
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Create Team</span>
                <span className="sm:hidden">Team</span>
              </Button>
            )}
          </div>
        </div>

        {/* Stats Overview - Improved Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 lg:mb-8">
          <Card padding="lg" hover={true} className="bg-linear-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{displayedTeams.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card padding="lg" hover={true} className="bg-linear-to-br from-green-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{totalMembers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          

          

          <Card padding="lg" hover={true} className="bg-linear-to-br from-pink-50 to-white sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{categories.length}</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <Tag className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search teams or members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-sm transition-all duration-200"
                />
              </div>

              {/* Department Filter */}
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm min-w-[140px] transition-all duration-200"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
              <span className="font-medium">{filteredTeams.length}</span> of <span className="font-medium">{displayedTeams.length}</span> teams
            </div>
          </div>
        </Card>

        {/* Categories Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
            <Button 
              onClick={() => setShowCreateCategoryModal(true)}
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              New Category
            </Button>
          </div>
          
          {categories.length === 0 ? (
            <Card className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
              <p className="text-gray-600 mb-4">Create your first category to organize teams.</p>
              <Button onClick={() => setShowCreateCategoryModal(true)}>
                <FolderPlus className="w-4 h-4 mr-2" />
                Create Category
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((category, index) => {
                const categoryId = getCategoryId(category) || `category-${index}`;

                return (
                <Card key={categoryId} padding="lg" hover={true}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                        style={{ backgroundColor: category.color }}
                      >
                        <Tag className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{category.description}</p>
                      </div>
                    </div>
                    <div className="relative shrink-0 ml-2">
                      <button 
                        data-category-toggle
                        onClick={(e) => toggleCategoryMenu(categoryId, e)}
                        className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {/* Category Actions Menu - Only shows for clicked category */}
                      {showCategoryMenu === categoryId && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50" data-category-menu data-category-id={categoryId}>
                          <button
                            onClick={() => openEditCategoryModal(category)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                          >
                            <Edit className="w-3 h-3" />
                            Edit Category
                          </button>
                          <button
                            onClick={() => openDeleteCategoryModal(category)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete Category
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Created: {formatDate(category.createdAt)}</span>
                  </div>
                </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Teams Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Teams</h2>
            {canManageTeams() && (
              <Button 
                onClick={() => navigate('/team/create')}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            )}
          </div>
          
          <Card padding="none">
            {teamsLoading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading teams...</p>
              </div>
            ) : reduxTeams.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No teams yet</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first team</p>
                {canManageTeams() && (
                  <Button onClick={() => navigate('/team/create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Team
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monthly Budget
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Members
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reduxTeams.map((team, index) => {
                      const teamId = getTeamId(team) || `team-${index}`;

                      return (
                      <tr key={teamId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              <span>{team.name}</span>
                              {defaultTeamId === teamId && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                  Default Team
                                </span>
                              )}
                            </div>
                            {team.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">{team.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {team.monthly_budget ? formatBudget(team.monthly_budget) : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(getTeamCreatedAt(team))}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => toggleTeamActionMenu(teamId, e)}
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                              aria-label="Team actions"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            
                            {showTeamActionMenu === teamId && teamActionMenuPosition && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowTeamActionMenu(null);
                                    setTeamActionMenuPosition(null);
                                  }}
                                />
                                <div
                                  className="fixed w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50"
                                  style={{ top: teamActionMenuPosition.top, left: teamActionMenuPosition.left }}
                                >
                                  {canManageTeams() && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTeamEdit(teamId);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <Edit className="w-4 h-4" />
                                      Edit Team
                                    </button>
                                  )}

                                  {canManageTeams() && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTeamDeleteClick(team);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete Team
                                    </button>
                                  )}

                                  {defaultTeamId !== teamId && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        void handleSetAsDefaultTeam(teamId);
                                      }}
                                      disabled={teamDefaultingId === teamId}
                                      className="w-full px-4 py-2 text-left text-sm text-blue-700 hover:bg-blue-50 flex items-center gap-2 disabled:opacity-60"
                                    >
                                      <Tag className="w-4 h-4" />
                                      {teamDefaultingId === teamId ? 'Setting...' : 'Set As Default Team'}
                                    </button>
                                  )}

                                  {defaultTeamId === teamId && (
                                    <div className="w-full px-4 py-2 text-left text-sm text-gray-500 flex items-center gap-2">
                                      <Tag className="w-4 h-4" />
                                      Default Team
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

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
                      <span className="text-sm font-medium">{selectedTeam.activeCount ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Monthly Budget:</span>
                      <span className="text-sm font-medium">${(selectedTeam.monthlyBudget ?? selectedTeam.monthly_budget ?? 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Team Lead</h4>
                  {selectedTeam.members.find((m) => m.role === 'Manager' || m.role === 'Team Leader') ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                        {getInitials(selectedTeam.members.find((m) => m.role === 'Manager' || m.role === 'Team Leader')?.fullName || '')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedTeam.members.find((m) => m.role === 'Manager' || m.role === 'Team Leader')?.fullName || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedTeam.members.find((m) => m.role === 'Manager' || m.role === 'Team Leader')?.email || 'N/A'}
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
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

                  {selectedTeam.members.map((member, index) => {
                    const memberId = getMemberId(member, index);

                    return (
                    <div key={memberId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(memberId)}
                          onChange={() => toggleMemberSelection(memberId)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 shrink-0"
                        />
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium shrink-0">
                          {getInitials(member.fullName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">{member.fullName}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                            <Badge status={getRoleColor(member.role) as 'default'} size="sm" className="w-fit">
                              {member.role}
                            </Badge>
                            <span className="text-sm text-gray-500 truncate">{member.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteMembers(selectedTeam.id, [memberId])}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="secondary" className="w-full sm:w-auto">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Team
                </Button>
                <Button onClick={() => setShowAddMemberModal(true)} className="w-full sm:w-auto">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter team name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={newTeam.department}
                onChange={(e) => setNewTeam(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newTeam.color === color ? 'border-gray-900 ring-2 ring-offset-1 ring-gray-300' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter monthly budget"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCreateTeamModal(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={createTeam} disabled={!newTeam.name || !newTeam.department} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </div>
          </div>
        </Modal>

        {/* Create Category Modal */}
        <Modal
          open={showCreateCategoryModal}
          onClose={() => setShowCreateCategoryModal(false)}
          title="Create New Category"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter category name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter category description"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Color</label>
              <div className="flex gap-2 flex-wrap">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setCategoryForm(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      categoryForm.color === color ? 'border-gray-900 ring-2 ring-offset-1 ring-gray-300' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCreateCategoryModal(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button 
                onClick={createCategory} 
                disabled={creatingCategory || !categoryForm.name || !categoryForm.description}
                className="w-full sm:w-auto"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                {creatingCategory ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Category Modal */}
        <Modal
          open={showEditCategoryModal}
          onClose={() => {
            setShowEditCategoryModal(false);
            setSelectedCategory(null);
            setCategoryForm({ name: '', description: '', color: '#3B82F6' });
          }}
          title="Edit Category"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter category name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter category description"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Color</label>
              <div className="flex gap-2 flex-wrap">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setCategoryForm(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      categoryForm.color === color ? 'border-gray-900 ring-2 ring-offset-1 ring-gray-300' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowEditCategoryModal(false);
                  setSelectedCategory(null);
                  setCategoryForm({ name: '', description: '', color: '#3B82F6' });
                }} 
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={updateCategory} 
                disabled={updatingCategory || !categoryForm.name || !categoryForm.description}
                className="w-full sm:w-auto"
              >
                <Edit className="w-4 h-4 mr-2" />
                {updatingCategory ? 'Updating...' : 'Update Category'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Category Modal */}
        <Modal
          open={showEditCategoryModal && !!selectedCategory}
          onClose={() => {
            setShowEditCategoryModal(false);
            setSelectedCategory(null);
            setCategoryForm({ name: '', description: '', color: '#3B82F6' });
          }}
          title="Edit Category"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="Enter category name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="Enter category description"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Color</label>
              <div className="flex gap-2 flex-wrap">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setCategoryForm(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 ${
                      categoryForm.color === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => { setShowEditCategoryModal(false); setSelectedCategory(null); setCategoryForm({ name: '', description: '', color: '#3B82F6' }); }}>
                Cancel
              </Button>
              <Button
                onClick={updateCategory}
                disabled={updatingCategory || !categoryForm.name || !categoryForm.description}
              >
                {updatingCategory ? 'Saving...' : 'Save Changes'}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={newMember.firstName}
                  onChange={(e) => setNewMember(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={newMember.lastName}
                  onChange={(e) => setNewMember(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="john.doe@company.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value as Role }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select team</option>
                  {displayedTeams.map((team: TeamItem, index: number) => {
                    const teamId = getTeamId(team) || `team-option-${index}`;
                    return (
                      <option key={teamId} value={teamId}>{team.name}</option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowAddMemberModal(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button 
                onClick={addMember} 
                disabled={!newMember.firstName || !newMember.lastName || !newMember.email || !newMember.role || !newMember.teamId}
                className="w-full sm:w-auto"
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
            setCategoryToDelete(null);
          }}
          title={teamToDelete ? "Delete Team" : "Delete Category"}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              {teamToDelete 
                ? `Are you sure you want to delete the team <strong>"${teamToDelete.name}"</strong>? This action cannot be undone and all team data will be permanently removed.`
                : categoryToDelete 
                ? `Are you sure you want to delete the category <strong>"${categoryToDelete.name}"</strong>? This action cannot be undone and all associated data will be permanently removed.`
                : ''}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={() => {
                  if (teamToDelete) {
                    const teamId = getTeamId(teamToDelete);
                    if (!teamId) {
                      return;
                    }
                    // Check if it's a Redux team (TeamWithDetails)
                    if ('team_leader' in teamToDelete || reduxTeams.find(t => getTeamId(t) === teamId)) {
                      handleTeamDeleteConfirm();
                    } else {
                      deleteTeam(teamId);
                    }
                  } else if (categoryToDelete) {
                    deleteCategory(categoryToDelete);
                  }
                }}
                disabled={deletingTeam || deletingCategory}
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deletingTeam || deletingCategory ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default TeamPage;