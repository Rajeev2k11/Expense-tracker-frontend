import type { RootState } from '../store';

// Auth Selectors
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectIsAdmin = (state: RootState) => state.auth.isAdmin;
export const selectIsTeamMember = (state: RootState) => state.auth.isTeamMember;
export const selectIsAuthenticated = (state: RootState) => state.auth.user !== null;

// Expenses Selectors
export const selectExpenses = (state: RootState) => state.expenses.items;
export const selectExpensesStatus = (state: RootState) => state.expenses.status;
export const selectExpensesError = (state: RootState) => state.expenses.error;
export const selectExpensesTotal = (state: RootState) => state.expenses.totalAmount;
export const selectExpensesFilters = (state: RootState) => state.expenses.filters;
export const selectExpensesPagination = (state: RootState) => state.expenses.pagination;
export const selectSelectedExpense = (state: RootState) => state.expenses.selectedExpense;

export const selectExpensesByCategory = (category: string) => (state: RootState) =>
  state.expenses.items.filter(
    (expense) => category === 'All' || expense.category === category
  );

export const selectExpensesByStatus = (status: string) => (state: RootState) =>
  state.expenses.items.filter(
    (expense) => status === 'All' || expense.status === status
  );

// Dashboard Selectors
export const selectDashboard = (state: RootState) => state.dashboard;
export const selectDashboardStats = (state: RootState) => state.dashboard.stats;
export const selectDashboardSpending = (state: RootState) => state.dashboard.spending;
export const selectDashboardCategories = (state: RootState) => state.dashboard.categories;
export const selectDashboardStatus = (state: RootState) => state.dashboard.status;
export const selectDashboardError = (state: RootState) => state.dashboard.error;
export const selectDashboardLastUpdated = (state: RootState) => state.dashboard.lastUpdated;

// Team Selectors
export const selectTeams = (state: RootState) => state.team.teams;
export const selectTeamsStatus = (state: RootState) => state.team.status;
export const selectTeamsError = (state: RootState) => state.team.error;
export const selectSelectedTeam = (state: RootState) => state.team.selectedTeam;

export const selectTeamById = (id: string) => (state: RootState) =>
  state.team.teams.find((team) => team.id === id);

// UI Selectors
export const selectUI = (state: RootState) => state.ui;
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectDarkMode = (state: RootState) => state.ui.darkMode;
export const selectNotifications = (state: RootState) => state.ui.notifications;
export const selectModalOpen = (state: RootState) => state.ui.modalOpen;
export const selectLoading = (state: RootState) => state.ui.loading;

export const selectNotificationById = (id: string) => (state: RootState) =>
  state.ui.notifications.find((notification) => notification.id === id);
