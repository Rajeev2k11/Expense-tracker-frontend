import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Auth Hooks
export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  return {
    ...auth,
    dispatch,
  };
};

export const useAuthUser = () => useAppSelector((state) => state.auth.user);
export const useAuthStatus = () => useAppSelector((state) => state.auth.status);
export const useAuthError = () => useAppSelector((state) => state.auth.error);
export const useIsAdmin = () => useAppSelector((state) => state.auth.isAdmin);
export const useIsTeamMember = () => useAppSelector((state) => state.auth.isTeamMember);

// Expenses Hooks
export const useExpenses = () => useAppSelector((state) => state.expenses.items);
export const useExpensesStatus = () => useAppSelector((state) => state.expenses.status);
export const useExpensesError = () => useAppSelector((state) => state.expenses.error);
export const useExpensesTotal = () => useAppSelector((state) => state.expenses.totalAmount);
export const useExpensesFilters = () => useAppSelector((state) => state.expenses.filters);
export const useExpensesPagination = () => useAppSelector((state) => state.expenses.pagination);
export const useSelectedExpense = () => useAppSelector((state) => state.expenses.selectedExpense);

// Dashboard Hooks
export const useDashboard = () => useAppSelector((state) => state.dashboard);
export const useDashboardStats = () => useAppSelector((state) => state.dashboard.stats);
export const useDashboardSpending = () => useAppSelector((state) => state.dashboard.spending);
export const useDashboardCategories = () => useAppSelector((state) => state.dashboard.categories);
export const useDashboardStatus = () => useAppSelector((state) => state.dashboard.status);
export const useDashboardError = () => useAppSelector((state) => state.dashboard.error);

// Team Hooks
export const useTeams = () => useAppSelector((state) => state.team.teams);
export const useTeamsStatus = () => useAppSelector((state) => state.team.status);
export const useTeamsError = () => useAppSelector((state) => state.team.error);
export const useSelectedTeam = () => useAppSelector((state) => state.team.selectedTeam);

// UI Hooks
export const useUIState = () => useAppSelector((state) => state.ui);
export const useSidebarOpen = () => useAppSelector((state) => state.ui.sidebarOpen);
export const useDarkMode = () => useAppSelector((state) => state.ui.darkMode);
export const useNotifications = () => useAppSelector((state) => state.ui.notifications);
export const useModalOpen = () => useAppSelector((state) => state.ui.modalOpen);
export const useLoading = () => useAppSelector((state) => state.ui.loading);
