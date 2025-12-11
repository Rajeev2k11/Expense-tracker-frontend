# Redux Configuration Reference

## Store Configuration

The Redux store is configured in `src/redux/store/index.ts`:

```typescript
export const store = configureStore({
  reducer: {
    auth: authReducer,
    expenses: expensesReducer,
    dashboard: dashboardReducer,
    team: teamReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/login/fulfilled', 'auth/signup/fulfilled'],
        ignoredPaths: ['auth.user'],
      },
    }).concat(
      import.meta.env.DEV ? logger : []
    ),
  devTools: import.meta.env.DEV,
});
```

## Slices Overview

### Auth Slice (authSlice.ts)

**State:**
- `user: User | null` - Current authenticated user
- `token: string | null` - Authentication token
- `status: RequestStatus` - Loading status
- `error: ApiError | null` - Error information
- `isAdmin: boolean` - Whether user has admin role
- `isTeamMember: boolean` - Whether user is team member

**Thunks:**
- `login({ email })` - Authenticate user
- `signup({ fullName, email, password, role })` - Register new user
- `updateProfile({ profileData, userId })` - Update user profile

**Actions:**
- `logout()` - Clear authentication
- `clearError()` - Clear error state
- `setRoles({ isAdmin, isTeamMember })` - Set user roles

### Expenses Slice (expensesSlice.ts)

**State:**
- `items: Expense[]` - List of expenses
- `selectedExpense: Expense | null` - Currently selected expense
- `status: RequestStatus` - Loading status
- `error: ApiError | null` - Error information
- `pagination: PaginationState` - Pagination info
- `filters: {...}` - Applied filters
- `totalAmount: number` - Sum of all expenses

**Thunks:**
- `fetchExpenses({ page?, pageSize?, filters? })` - Get expenses
- `createExpense(expenseData)` - Create new expense
- `updateExpense({ id, data })` - Update expense
- `deleteExpense(id)` - Delete expense

**Actions:**
- `setFilters(filters)` - Apply filters
- `setPagination(pagination)` - Set pagination
- `selectExpense(expense)` - Select expense
- `clearError()` - Clear error
- `calculateTotal()` - Recalculate total amount

### Dashboard Slice (dashboardSlice.ts)

**State:**
- `stats: DashboardStats | null` - Dashboard statistics
- `spending: any[]` - Spending chart data
- `categories: any[]` - Category breakdown
- `status: RequestStatus` - Loading status
- `error: ApiError | null` - Error information
- `lastUpdated: string | null` - Last update timestamp

**Thunks:**
- `fetchDashboardStats()` - Fetch all dashboard data

**Actions:**
- `clearError()` - Clear error

### Team Slice (teamSlice.ts)

**State:**
- `teams: Team[]` - List of teams
- `selectedTeam: Team | null` - Currently selected team
- `status: RequestStatus` - Loading status
- `error: ApiError | null` - Error information

**Thunks:**
- `fetchTeams()` - Get all teams
- `createTeam(teamData)` - Create new team
- `updateTeam({ id, data })` - Update team
- `deleteTeam(id)` - Delete team

**Actions:**
- `selectTeam(team)` - Select team
- `clearError()` - Clear error

### UI Slice (uiSlice.ts)

**State:**
- `sidebarOpen: boolean` - Sidebar visibility
- `darkMode: boolean` - Dark mode toggle
- `notifications: Notification[]` - Active notifications
- `modalOpen: {...}` - Modal visibility states
- `loading: boolean` - Global loading state

**Actions:**
- `toggleSidebar()` - Toggle sidebar visibility
- `setSidebarOpen(boolean)` - Set sidebar state
- `toggleDarkMode()` - Toggle dark mode
- `setDarkMode(boolean)` - Set dark mode state
- `addNotification(notification)` - Add notification
- `removeNotification(id)` - Remove notification
- `clearNotifications()` - Clear all notifications
- `openModal(modalName)` - Open modal
- `closeModal(modalName)` - Close modal
- `setLoading(boolean)` - Set global loading

## Type Definitions

### RequestStatus
```typescript
type RequestStatus = 'idle' | 'loading' | 'success' | 'error';
```

### ApiError
```typescript
interface ApiError {
  message: string;
  code?: string;
  timestamp?: string;
}
```

### PaginationState
```typescript
interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}
```

### AsyncState<T>
```typescript
interface AsyncState<T> {
  data: T;
  status: RequestStatus;
  error: ApiError | null;
}
```

## Middleware

### Redux Logger
Logs all actions and state changes in development mode.

Logged information:
- Previous state
- Action dispatched
- Next state
- Time taken

### Error Handler Middleware
Catches and logs errors during action processing.

### Custom Middleware Pattern
```typescript
export const customMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action) => {
    // Before action
    console.log('Before:', store.getState());
    
    const result = next(action);
    
    // After action
    console.log('After:', store.getState());
    
    return result;
  };
```

## Adding Middleware

To add middleware to the store:

```typescript
export const store = configureStore({
  reducer: { /* ... */ },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      customMiddleware,
      anotherMiddleware
    ),
});
```

## Utilities

### Error Handler (errorHandler.ts)
```typescript
export const handleError = (error: unknown): ApiError
export const isErrorResponse = (response: unknown): boolean
```

### Async Thunk Helper (asyncThunkHelper.ts)
```typescript
export const defaultThunkConfig
export const createErrorPayload = (error: unknown)
export const isLoading = (status: string): boolean
export const isSuccess = (status: string): boolean
export const isError = (status: string): boolean
export type SelectorType<T> = (state: RootState) => T
```

## Selectors

### Type-Safe Selectors
All selectors are type-safe and exported from `@/redux`:

```typescript
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectExpenses = (state: RootState) => state.expenses.items;
export const selectExpensesTotal = (state: RootState) => state.expenses.totalAmount;
// ... many more
```

### Parameterized Selectors
```typescript
export const selectExpensesByCategory = (category: string) => 
  (state: RootState) => 
    state.expenses.items.filter(e => 
      category === 'All' || e.category === category
    );

// Usage
const foodExpenses = useAppSelector(selectExpensesByCategory('Food'));
```

## Redux DevTools Integration

### Enabled When
- Development mode (`import.meta.env.DEV`)

### Access
- Chrome Extension: Redux DevTools
- Open DevTools and switch to Redux tab

### Features
- Time travel debugging
- Action dispatch replay
- State inspection
- State diff viewer
- Action history

## Best Practices

1. **Immutable Updates** - Redux Toolkit uses Immer, so mutations are safe in reducers
2. **Normalized State** - Keep related data together in slices
3. **Selectors** - Use for complex state access
4. **Hooks** - Prefer typed hooks over selectors for simple cases
5. **Error Handling** - Always check error state before rendering
6. **Loading States** - Always check status before rendering data
7. **No Side Effects** - Keep reducers pure, use thunks for async

## Performance Tips

1. **Memoize Selectors** - Use `reselect` for complex selectors (if needed)
2. **Selector Parametrization** - Use selectors instead of passing data
3. **Split State** - Keep state at appropriate levels
4. **DevTools in Dev Only** - Disabled in production
5. **Logger in Dev Only** - Disabled in production

## Troubleshooting

### Issue: "Cannot find module '@/redux'"
**Solution:** Ensure path aliases are configured in tsconfig.json and vite.config.ts

### Issue: "Type not assignable to RootState"
**Solution:** Use proper types when creating selectors

### Issue: "Actions not updating state"
**Solution:** Ensure reducers are registered in configureStore

### Issue: "Redux DevTools not working"
**Solution:** Install Redux DevTools browser extension and verify dev mode

## Migration Guide (from Context API)

If migrating from Context API:

1. Replace `useAuth()` with `useAuthUser()` + `useAppDispatch()`
2. Replace `context.dispatch(action)` with Redux actions
3. Replace `useContext()` with custom Redux hooks
4. Move async logic to thunks
5. Use Redux selectors for state access

## Future Enhancements

- [ ] Add Redux Persist for local storage
- [ ] Add reselect for memoized selectors
- [ ] Add Redux Thunk error boundary
- [ ] Add Redux action tracking
- [ ] Add custom Redux hooks factory
