import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useForm } from 'react-hook-form';
import { Plus, Search, Download, Trash2, Calendar, DollarSign, Tag, MoreVertical, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchCategories } from '../../features/categories/categorySlice';
import { teamApi } from '../../features/teams/teamApi';
import { userApi } from '../../features/users/userApi';
import {
  approveExpense as approveExpenseAction,
  createExpense as createExpenseAction,
  fetchExpenses,
  updateExpense as updateExpenseAction,
  deleteExpense as deleteExpenseAction,
} from '../../features/expenses/expenseSlice';

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  categoryName?: string;
  date: string;
  status: string;
  description: string;
  team?: string;
  user?: string;
  createdBy?: string;
  userEmail?: string;
};

type ExpenseFormData = {
  title: string;
  amount: number;
  category: string;
  description?: string;
  date?: string;
};

const ExpensesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, activeTeamId, userTeams } = useAuth();
  const { categories } = useAppSelector((state) => state.categories);
  const {
    expenses: expenseItems,
    loading: loadingExpenses,
    creating: creatingExpense,
    updating: updatingExpense,
    approving: approvingExpense,
    deleting: deletingExpense,
    error: expenseError,
  } = useAppSelector((state) => state.expenses);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [showExpenseActionMenu, setShowExpenseActionMenu] = useState<string | null>(null);
  const [expenseActionMenuPosition, setExpenseActionMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [teamBudgetLimit, setTeamBudgetLimit] = useState<number | null>(null);
  const [isActiveTeamMember, setIsActiveTeamMember] = useState(false);
  const [canCreateForActiveTeam, setCanCreateForActiveTeam] = useState(false);
  const [isActiveTeamManager, setIsActiveTeamManager] = useState(false);
  const [resolvedCurrentUserId, setResolvedCurrentUserId] = useState('');
  const [activeTeamMemberEmailMap, setActiveTeamMemberEmailMap] = useState<Record<string, string>>({});
  const [allUserEmailMap, setAllUserEmailMap] = useState<Record<string, string>>({});
  const [approvalExpenseId, setApprovalExpenseId] = useState<string | null>(null);
  const [teamValidationMessage, setTeamValidationMessage] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<ExpenseFormData>();
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
  } = useForm<ExpenseFormData>();

  const categoryOptions = categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  const resolveUserId = (value: unknown): string => {
    const source = value as { id?: string; _id?: string; email?: string } | null | undefined;
    return String(source?.id ?? source?._id ?? source?.email ?? '');
  };

  const resolveUserEmail = (value: unknown): string => {
    const source = value as { email?: string } | null | undefined;
    return String(source?.email ?? '').trim();
  };

  const normalizeRole = (value: unknown): string =>
    String(value ?? '')
      .trim()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .toUpperCase();

  const resolveMemberUserId = (value: unknown): string => {
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }

    const source = value as {
      id?: string;
      _id?: string;
      email?: string;
      userId?: string;
      user_id?: string;
      user?: string | { id?: string; _id?: string; email?: string };
      member?: string | { id?: string; _id?: string; email?: string };
    } | null | undefined;

    const nestedUser = source?.user;
    const nestedMember = source?.member;

    const nestedUserId =
      typeof nestedUser === 'string'
        ? nestedUser
        : String(nestedUser?.id ?? nestedUser?._id ?? '');

    const nestedMemberId =
      typeof nestedMember === 'string'
        ? nestedMember
        : String(nestedMember?.id ?? nestedMember?._id ?? '');

    return String(
      source?.userId ??
        source?.user_id ??
        nestedUserId ??
        nestedMemberId ??
        source?.id ??
        source?._id ??
        source?.email ??
        ''
    );
  };

  const resolveMemberEmail = (value: unknown): string => {
    if (typeof value === 'string') return '';

    const source = value as {
      email?: string;
      user?: string | { email?: string };
      member?: string | { email?: string };
    } | null | undefined;

    const nestedUserEmail = typeof source?.user === 'string' ? '' : source?.user?.email;
    const nestedMemberEmail = typeof source?.member === 'string' ? '' : source?.member?.email;

    return String(source?.email ?? nestedUserEmail ?? nestedMemberEmail ?? '').trim();
  };

  const resolveMemberType = (value: unknown): string => {
    if (typeof value === 'string') return '';

    const source = value as {
      member_type?: string;
      memberType?: string;
      team_role?: string;
      role?: string;
      user?: { member_type?: string; memberType?: string; team_role?: string; role?: string };
      member?: { member_type?: string; memberType?: string; team_role?: string; role?: string };
    } | null | undefined;

    return normalizeRole(
      source?.member_type ??
        source?.memberType ??
        source?.team_role ??
        source?.role ??
        source?.user?.member_type ??
        source?.user?.memberType ??
        source?.user?.team_role ??
        source?.user?.role ??
        source?.member?.member_type ??
        source?.member?.memberType ??
        source?.member?.team_role ??
        source?.member?.role ??
        ''
    );
  };

  const getCategoryLabel = (categoryId: string, categoryName?: string): string => {
    if (categoryName) return categoryName;
    const matched = categoryOptions.find((category) => category.id === categoryId);
    return matched?.name || categoryId;
  };

  useEffect(() => {
    void dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const validateActiveTeam = async () => {
      if (!activeTeamId || !user) {
        setResolvedCurrentUserId('');
        setIsActiveTeamMember(false);
        setCanCreateForActiveTeam(false);
        setTeamValidationMessage('No active team selected. Please switch to a team first.');
        setTeamBudgetLimit(null);
        setActiveTeamMemberEmailMap({});
        return;
      }

      try {
        const [team, profile] = await Promise.all([
          teamApi.getTeamById(activeTeamId),
          userApi.readUserProfile(),
        ]);
        const monthlyBudget = Number(team.monthly_budget ?? 0);
        const userId = resolveUserId(user);
        const profileUserId = String(profile?.user?.id || '');
        const userEmail = String(user.email || '').toLowerCase();
        const profileUserEmail = String(profile?.user?.email || '').toLowerCase();
        const teamLeaderId = resolveUserId(team.team_leader);
        const authMemberType = normalizeRole(
          profile?.user?.member_type ??
            (user as { member_type?: string; memberType?: string; team_role?: string; role?: string } | null | undefined)
              ?.member_type ??
            (user as { member_type?: string; memberType?: string; team_role?: string; role?: string } | null | undefined)
              ?.memberType ??
            (user as { member_type?: string; memberType?: string; team_role?: string; role?: string } | null | undefined)
              ?.team_role ??
            ''
        );
        const isUserTeamListed = (userTeams || []).some((teamOption) => String(teamOption.id || '') === String(activeTeamId));

        const emailMap: Record<string, string> = {};
        if (teamLeaderId) {
          const leaderEmail = resolveUserEmail(team.team_leader);
          if (leaderEmail) {
            emailMap[teamLeaderId] = leaderEmail;
          }
        }

        (team.members || []).forEach((member) => {
          const memberId = resolveMemberUserId(member);
          const memberEmail = resolveMemberEmail(member);
          if (memberId && memberEmail) {
            emailMap[memberId] = memberEmail;
          }
        });

        const matchedMember = (team.members || []).find((member) => {
          const memberId = resolveMemberUserId(member);
          const memberEmail = resolveMemberEmail(member).toLowerCase();
          const matchById =
            (memberId && userId && memberId === userId) ||
            (memberId && profileUserId && memberId === profileUserId);
          const matchByEmail =
            (memberEmail && userEmail && memberEmail === userEmail) ||
            (memberEmail && profileUserEmail && memberEmail === profileUserEmail);
          return matchById || matchByEmail;
        });
        const isMember = !!matchedMember || isUserTeamListed;
        const memberRole = resolveMemberType(matchedMember);
        const isManagerRole = memberRole === 'MANAGER' || authMemberType === 'MANAGER';
        const isAuthKnownMemberType = authMemberType === 'MANAGER' || authMemberType === 'MEMBER';

        const isAllowedMember = isMember || isAuthKnownMemberType;

        setResolvedCurrentUserId(profileUserId || userId);
        setIsActiveTeamMember(isAllowedMember);
        setCanCreateForActiveTeam(isAllowedMember);
        setIsActiveTeamManager(isAllowedMember && isManagerRole);
        setTeamBudgetLimit(monthlyBudget);
        setActiveTeamMemberEmailMap(emailMap);
        setTeamValidationMessage(isAllowedMember ? null : 'You are not a member of the active team.');
      } catch {
        setResolvedCurrentUserId(resolveUserId(user));
        setIsActiveTeamMember(false);
        setCanCreateForActiveTeam(false);
        setIsActiveTeamManager(false);
        setTeamValidationMessage('Unable to validate active team details. Please try again.');
        setTeamBudgetLimit(null);
        setActiveTeamMemberEmailMap({});
      }
    };

    void validateActiveTeam();
  }, [activeTeamId, user, userTeams]);

  useEffect(() => {
    void dispatch(fetchExpenses());
  }, [dispatch, activeTeamId]);

  const expenses: Expense[] = expenseItems
    .filter((expense) => {
      if (!activeTeamId) return false;
      return String(expense.team || '') === activeTeamId;
    })
    .map((expense) => ({
      id: expense.id,
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      categoryName: expense.categoryName,
      date: expense.date,
      status: expense.status || 'Pending',
      description: expense.description,
      team: expense.team,
      user: expense.user,
      createdBy: expense.createdBy,
      userEmail: expense.userEmail,
    }));

  const activeTeamSpentAmount = useMemo(
    () => expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    [expenses]
  );

  const activeTeamBudgetLeft = useMemo(() => {
    const budget = Number(teamBudgetLimit ?? 0);
    return Math.max(0, budget - activeTeamSpentAmount);
  }, [teamBudgetLimit, activeTeamSpentAmount]);

  const onDelete = async (id: string) => {
    try {
      await dispatch(deleteExpenseAction(id)).unwrap();
      setSelectedExpenses(prev => prev.filter(expenseId => expenseId !== id));
      setShowDeleteModal(false);
      setExpenseToDelete(null);
      setShowExpenseActionMenu(null);
      setExpenseActionMenuPosition(null);
      await dispatch(fetchExpenses());
    } catch (error) {
      const message = typeof error === 'string' ? error : 'Failed to delete expense';
      alert(message);
    }
  };

  const onBulkDelete = async () => {
    try {
      const deletableIds = selectedExpenses.filter((id) => {
        const expense = expenses.find((item) => item.id === id);
        return expense ? canEditOrDeleteExpense(expense) : false;
      });

      if (deletableIds.length === 0) {
        alert('You are not allowed to delete selected expenses.');
        return;
      }

      await Promise.all(deletableIds.map((id) => dispatch(deleteExpenseAction(id)).unwrap()));
      setSelectedExpenses((prev) => prev.filter((id) => !deletableIds.includes(id)));
      setShowDeleteModal(false);
      setShowExpenseActionMenu(null);
      setExpenseActionMenuPosition(null);
      await dispatch(fetchExpenses());
    } catch (error) {
      const message = typeof error === 'string' ? error : 'Failed to delete selected expenses';
      alert(message);
    }
  };

  const canEditOrDeleteExpense = (expense: Expense) => {
    if (!user) return false;
    const currentUserId = String(resolvedCurrentUserId || resolveUserId(user) || '').trim();
    const creatorIds = [String(expense.createdBy || '').trim(), String(expense.user || '').trim()].filter(Boolean);
    const isCreator = !!currentUserId && creatorIds.includes(currentUserId);

    const expenseTeamId = String(expense.team || activeTeamId || '');
    const isSameActiveTeam = !!activeTeamId && !!expenseTeamId && expenseTeamId === activeTeamId;
    const managerAllowed = isSameActiveTeam && isActiveTeamManager;

    if (managerAllowed) return true;

    if (!isCreator) return false;

    const normalizedStatus = String(expense.status || '').toLowerCase();
    const isFinalized = normalizedStatus === 'approved' || normalizedStatus === 'rejected' || normalizedStatus === 'declined';

    if (isFinalized) {
      return false;
    }

    return true;
  };

  const onAdd = async (data: ExpenseFormData) => {
    if (!user) {
      alert('Please login again to create expense.');
      return;
    }

    if (!activeTeamId) {
      alert('No active team selected. Please select a team first.');
      return;
    }

    if (!canCreateForActiveTeam) {
      alert(teamValidationMessage || 'You are not allowed to create expense for this team.');
      return;
    }

    const amount = Number(data.amount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (amount > activeTeamBudgetLeft) {
      alert(`Amount exceeds active team monthly budget limit. Available: $${activeTeamBudgetLeft.toLocaleString()}`);
      return;
    }

    try {
      const payload = {
        title: data.title,
        amount,
        category: data.category,
        description: data.description || '',
        date: data.date || new Date().toISOString().split('T')[0],
        user: resolveUserId(user),
        team: activeTeamId,
      };

      await dispatch(createExpenseAction(payload)).unwrap();

      setShowAddModal(false);
      reset();

      await dispatch(fetchExpenses());
    } catch (error) {
      const message = typeof error === 'string' ? error : 'Failed to create expense';
      alert(message);
    }
  };

  const openEditModal = (expense: Expense) => {
    if (!canEditOrDeleteExpense(expense)) {
      alert('You are not allowed to edit this expense.');
      return;
    }

    setExpenseToEdit(expense);
    resetEdit({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
    });
    setShowEditModal(true);
  };

  const onEdit = async (data: ExpenseFormData) => {
    if (!expenseToEdit) return;

    if (!canEditOrDeleteExpense(expenseToEdit)) {
      alert('You are not allowed to edit this expense.');
      return;
    }

    const amount = Number(data.amount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const maxAllowedForEdit = activeTeamBudgetLeft + Number(expenseToEdit.amount || 0);
    if (amount > maxAllowedForEdit) {
      alert(`Amount exceeds active team monthly budget limit. Available: $${maxAllowedForEdit.toLocaleString()}`);
      return;
    }

    try {
      await dispatch(
        updateExpenseAction({
          id: expenseToEdit.id,
          payload: {
            title: data.title,
            amount,
            category: data.category,
            description: data.description || '',
            date: data.date || new Date().toISOString().split('T')[0],
          },
        })
      ).unwrap();

      setShowEditModal(false);
      setExpenseToEdit(null);
      resetEdit();
      await dispatch(fetchExpenses());
    } catch (error) {
      const message = typeof error === 'string' ? error : 'Failed to update expense';
      alert(message);
    }
  };

  // Placeholder for edit functionality not currently implemented

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getCategoryLabel(expense.category, expense.categoryName).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (String(status || '').toLowerCase()) {
      case 'approved': return 'Approved';
      case 'rejected':
      case 'declined':
        return 'Rejected';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (String(status || '').toLowerCase()) {
      case 'Approved': return 'Approved';
      case 'approved': return 'Approved';
      case 'Rejected':
      case 'rejected':
      case 'declined':
        return 'Rejected';
      case 'Pending':
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const isPendingStatus = (status: string) => String(status || '').toLowerCase() === 'pending';

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingCount = expenses.filter((expense) => isPendingStatus(expense.status)).length;
  const canViewPendingApproval = isActiveTeamMember && isActiveTeamManager;
  const pendingApprovalExpenses = expenses.filter(
    (expense) => isPendingStatus(expense.status) && String(expense.team || '') === String(activeTeamId || '')
  );

  useEffect(() => {
    if (!canViewPendingApproval) {
      setShowApprovalModal(false);
      setApprovalExpenseId(null);
    }
  }, [canViewPendingApproval]);

  const loadAllUsersIfNeeded = async () => {
    if (Object.keys(allUserEmailMap).length > 0) return;

    try {
      const users = await userApi.getAllUsers();
      const map: Record<string, string> = {};

      users.forEach((item) => {
        const userId = resolveUserId(item);
        const email = String(item.email || '').trim();
        if (userId && email) {
          map[userId] = email;
        }
      });

      setAllUserEmailMap(map);
    } catch {
      setAllUserEmailMap({});
    }
  };

  const openPendingApprovalModal = async () => {
    if (!isActiveTeamMember || !isActiveTeamManager) return;

    await loadAllUsersIfNeeded();
    setShowApprovalModal(true);
  };

  const onApprovalAction = async (expenseId: string, status: 'approved' | 'rejected') => {
    if (!isActiveTeamMember || !isActiveTeamManager) {
      alert('Only team manager can approve or reject expenses.');
      return;
    }

    try {
      setApprovalExpenseId(expenseId);
      await dispatch(approveExpenseAction({ id: expenseId, payload: { status } })).unwrap();
      await dispatch(fetchExpenses());
    } catch (error) {
      const message = typeof error === 'string' ? error : 'Failed to update expense approval';
      alert(message);
    } finally {
      setApprovalExpenseId(null);
    }
  };

  const getRequesterEmail = (expense: Expense): string => {
    const directEmail = String(expense.userEmail || '').trim();
    if (directEmail) return directEmail;

    const createdById = String(expense.createdBy || '').trim();
    if (createdById && allUserEmailMap[createdById]) {
      return allUserEmailMap[createdById];
    }

    const userId = String(expense.user || '').trim();
    if (userId && allUserEmailMap[userId]) {
      return allUserEmailMap[userId];
    }

    if (createdById && activeTeamMemberEmailMap[createdById]) {
      return activeTeamMemberEmailMap[createdById];
    }

    if (userId && activeTeamMemberEmailMap[userId]) {
      return activeTeamMemberEmailMap[userId];
    }

    return 'N/A';
  };

  // Export Functions
  const exportToCSV = () => {
    const csvData = filteredExpenses.map(expense => ({
      Title: expense.title,
      Description: expense.description,
      Category: getCategoryLabel(expense.category, expense.categoryName),
      Amount: expense.amount,
      Date: new Date(expense.date).toLocaleDateString(),
      Status: expense.status
    }));

    const headers = ['Title', 'Description', 'Category', 'Amount', 'Date', 'Status'];
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
    link.download = `expenses_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Simple PDF export simulation - in real app, use libraries like jsPDF
    const pdfContent = `
      Expenses Report
      Generated on: ${new Date().toLocaleDateString()}
      
      ${filteredExpenses.map(expense => `
        Title: ${expense.title}
        Description: ${expense.description}
        Category: ${expense.category}
        Amount: $${expense.amount}
        Date: ${new Date(expense.date).toLocaleDateString()}
        Status: ${expense.status}
        --------------------
      `).join('')}
      
      Total: $${totalAmount.toLocaleString()}
    `;

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses_report_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleExpenseSelection = (expenseId: string) => {
    setSelectedExpenses(prev => 
      prev.includes(expenseId) 
        ? prev.filter(id => id !== expenseId)
        : [...prev, expenseId]
    );
  };

  const selectAllExpenses = () => {
    if (selectedExpenses.length === filteredExpenses.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(filteredExpenses.map(expense => expense.id));
    }
  };

  const openDeleteModal = (expense?: Expense) => {
    if (expense) {
      setExpenseToDelete(expense);
    }
    setShowExpenseActionMenu(null);
    setExpenseActionMenuPosition(null);
    setShowDeleteModal(true);
  };

  const toggleExpenseActionMenu = (expenseId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (showExpenseActionMenu === expenseId) {
      setShowExpenseActionMenu(null);
      setExpenseActionMenuPosition(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 144;
    const menuHeight = 88;
    const gap = 8;

    const openUp = window.innerHeight - rect.bottom < menuHeight + 16 && rect.top > menuHeight + 16;
    const top = openUp ? rect.top - menuHeight - gap : rect.bottom + gap;
    const left = Math.max(8, rect.right - menuWidth);

    setExpenseActionMenuPosition({ top, left });
    setShowExpenseActionMenu(expenseId);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
            <p className="text-gray-600 mt-1">Manage and track your expenses</p>
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
              onClick={() => setShowAddModal(true)}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card padding="lg" hover={true}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">${totalAmount.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {canViewPendingApproval && (
            <button
              type="button"
              onClick={openPendingApprovalModal}
              className="w-full text-left cursor-pointer"
              title="View pending approvals"
            >
              <Card padding="lg" hover={true}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {pendingCount}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </Card>
            </button>
          )}

          <Card padding="lg" hover={true}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ${expenses
                    .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
                    .reduce((sum, e) => sum + e.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card padding="lg" hover={true}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Team Budget Left</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ${activeTeamBudgetLeft.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {teamValidationMessage && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <p className="text-sm text-amber-800">{teamValidationMessage}</p>
          </Card>
        )}

        {/* Filters and Search */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 w-full md:w-64 text-sm"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm"
              >
                <option value="All">All</option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-600">
              {filteredExpenses.length} of {expenses.length} expenses
              {selectedExpenses.length > 0 && ` • ${selectedExpenses.length} selected`}
            </div>
          </div>
        </Card>

        {/* Bulk Actions */}
        {selectedExpenses.length > 0 && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-900">
                  {selectedExpenses.length} expense(s) selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => openDeleteModal()}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setSelectedExpenses([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Expenses Table */}
        <Card padding="none">
          {loadingExpenses ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first expense.</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                      <input
                        type="checkbox"
                        checked={selectedExpenses.length === filteredExpenses.length}
                        onChange={selectAllExpenses}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Expense</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Category</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Amount</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedExpenses.includes(expense.id)}
                          onChange={() => toggleExpenseSelection(expense.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{expense.title}</p>
                          <p className="text-sm text-gray-500 mt-1">{expense.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{getCategoryLabel(expense.category, expense.categoryName)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-900">${expense.amount.toLocaleString()}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge status={getStatusColor(expense.status)}>
                          {getStatusLabel(expense.status)}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        {(() => {
                          const canManageExpense = canEditOrDeleteExpense(expense);
                          return (
                        <div className="relative flex justify-start">
                          <button
                            type="button"
                            onClick={(e) => {
                              if (!canManageExpense) return;
                              toggleExpenseActionMenu(expense.id, e);
                            }}
                            disabled={!canManageExpense}
                            className={`p-2 rounded-full transition-colors ${canManageExpense ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
                            aria-label="Expense actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {showExpenseActionMenu === expense.id && expenseActionMenuPosition && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => {
                                  setShowExpenseActionMenu(null);
                                  setExpenseActionMenuPosition(null);
                                }}
                              />
                              <div
                                className="fixed w-36 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20"
                                style={{ top: expenseActionMenuPosition.top, left: expenseActionMenuPosition.left }}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowExpenseActionMenu(null);
                                    setExpenseActionMenuPosition(null);
                                    openEditModal(expense);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  disabled={!canManageExpense}
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowExpenseActionMenu(null);
                                    setExpenseActionMenuPosition(null);
                                    openDeleteModal(expense);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  disabled={!canManageExpense}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Add Expense Modal */}
        <Modal
          open={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            reset();
          }}
          title="Add New Expense"
          size="md"
        >
          <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                {...register('title', { required: true })}
                placeholder="Enter expense title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                {...register('description')}
                placeholder="Enter expense description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  {...register('amount', { required: true, valueAsNumber: true })}
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  {...register('category', { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                {...register('date')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>

            {expenseError && (
              <p className="text-sm text-red-600">{expenseError}</p>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowAddModal(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creatingExpense || !canCreateForActiveTeam}>
                {creatingExpense ? 'Adding...' : 'Add Expense'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Expense Modal */}
        <Modal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setExpenseToEdit(null);
            resetEdit();
          }}
          title="Edit Expense"
          size="md"
        >
          <form onSubmit={handleSubmitEdit(onEdit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                {...registerEdit('title', { required: true })}
                placeholder="Enter expense title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                {...registerEdit('description')}
                placeholder="Enter expense description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  {...registerEdit('amount', { required: true, valueAsNumber: true })}
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  {...registerEdit('category', { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                {...registerEdit('date')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>

            {expenseError && (
              <p className="text-sm text-red-600">{expenseError}</p>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowEditModal(false);
                  setExpenseToEdit(null);
                  resetEdit();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updatingExpense}>
                {updatingExpense ? 'Updating...' : 'Update Expense'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          open={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setExpenseToDelete(null);
          }}
          title={expenseToDelete ? "Delete Expense" : "Delete Selected Expenses"}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              {expenseToDelete 
                ? `Are you sure you want to delete the expense "${expenseToDelete.title}"? This action cannot be undone.`
                : `Are you sure you want to delete ${selectedExpenses.length} selected expense(s)? This action cannot be undone.`
              }
            </p>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                disabled={deletingExpense}
                onClick={() => expenseToDelete ? onDelete(expenseToDelete.id) : onBulkDelete()}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deletingExpense ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          open={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false);
            setApprovalExpenseId(null);
          }}
          title="Pending Expense Approvals"
          size="lg"
        >
          {!isActiveTeamMember ? (
            <p className="text-sm text-gray-600">Only active team members can view this section.</p>
          ) : !isActiveTeamManager ? (
            <p className="text-sm text-gray-600">Only active-team manager can approve or reject pending expenses.</p>
          ) : pendingApprovalExpenses.length === 0 ? (
            <p className="text-sm text-gray-600">No pending expenses for approval.</p>
          ) : (
            <div className="space-y-3">
              {pendingApprovalExpenses.map((expense) => {
                const isProcessing = approvalExpenseId === expense.id && approvingExpense;

                return (
                  <div
                    key={expense.id}
                    className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{expense.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{expense.description || 'No description'}</p>
                      <p className="text-sm text-gray-500 mt-1">Requested by: {getRequesterEmail(expense)}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        ${Number(expense.amount || 0).toLocaleString()} • {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => onApprovalAction(expense.id, 'approved')}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Updating...' : 'Approve'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onApprovalAction(expense.id, 'rejected')}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Updating...' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default ExpensesPage;