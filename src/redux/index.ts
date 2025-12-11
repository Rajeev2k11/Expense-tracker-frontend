// Export everything from store
export { store } from './store';
export type { RootState, AppDispatch } from './store';

// Export hooks
export {
  useAppDispatch,
  useAppSelector,
  useAuth,
  useAuthUser,
  useAuthStatus,
  useAuthError,
  useIsAdmin,
  useIsTeamMember,
  useExpenses,
  useExpensesStatus,
  useExpensesError,
  useExpensesTotal,
  useExpensesFilters,
  useExpensesPagination,
  useSelectedExpense,
  useDashboard,
  useDashboardStats,
  useDashboardSpending,
  useDashboardCategories,
  useDashboardStatus,
  useDashboardError,
  useTeams,
  useTeamsStatus,
  useTeamsError,
  useSelectedTeam,
  useUIState,
  useSidebarOpen,
  useDarkMode,
  useNotifications,
  useModalOpen,
  useLoading,
} from './hooks';

// Export selectors
export * from './selectors';

// Export slice actions and thunks
export {
  login,
  signup,
  updateProfile,
  logout,
  clearError as clearAuthError,
  setRoles,
} from './slices/authSlice';

export {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  setFilters,
  setPagination,
  selectExpense,
  clearError as clearExpensesError,
  calculateTotal,
} from './slices/expensesSlice';

export {
  fetchDashboardStats,
  clearError as clearDashboardError,
} from './slices/dashboardSlice';

export {
  fetchTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  selectTeam,
  clearError as clearTeamError,
} from './slices/teamSlice';

export {
  toggleSidebar,
  setSidebarOpen,
  toggleDarkMode,
  setDarkMode,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  setLoading,
} from './slices/uiSlice';

// Export utility functions
export { handleError, isErrorResponse } from './utils/errorHandler';
export {
  isLoading,
  isSuccess,
  isError,
  createErrorPayload,
  defaultThunkConfig,
} from './utils/asyncThunkHelper';
