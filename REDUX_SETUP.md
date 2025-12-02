# Redux Setup - Expense Tracker Frontend

## Overview

This project uses **Redux Toolkit** for state management with a professional, industry-level folder structure. The setup includes:

- ✅ **Redux Toolkit** - Modern Redux with simplified API
- ✅ **Redux Logger** - Middleware for debugging state changes
- ✅ **Type-safe hooks** - Custom hooks with full TypeScript support
- ✅ **Selectors** - Reusable state selectors
- ✅ **Async thunks** - Async operations management
- ✅ **Custom middleware** - Error handling and analytics
- ✅ **DevTools support** - Time travel debugging

## Project Structure

```
src/
├── redux/                              # Redux state management
│   ├── store/
│   │   └── index.ts                   # Redux store configuration
│   │
│   ├── slices/                        # Redux slices (state + reducers + thunks)
│   │   ├── authSlice.ts               # Authentication (user, login, signup)
│   │   ├── expensesSlice.ts           # Expenses CRUD operations
│   │   ├── dashboardSlice.ts          # Dashboard statistics
│   │   ├── teamSlice.ts               # Team management
│   │   └── uiSlice.ts                 # UI state (modals, sidebar, notifications)
│   │
│   ├── hooks/                         # Custom React hooks for Redux
│   │   └── index.ts                   # All useAppDispatch, useAppSelector, etc.
│   │
│   ├── selectors/                     # Redux selectors for accessing state
│   │   └── index.ts                   # All selector functions
│   │
│   ├── middleware/                    # Custom Redux middleware
│   │   └── errorHandler.ts            # Error handling middleware
│   │
│   ├── types/                         # TypeScript types for Redux
│   │   └── index.ts                   # RequestStatus, ApiError, etc.
│   │
│   ├── utils/                         # Utility functions
│   │   ├── errorHandler.ts            # Error handling utilities
│   │   └── asyncThunkHelper.ts        # Async thunk helpers
│   │
│   ├── examples/                      # Example components
│   │   ├── HookUsageExample.tsx        # Using custom hooks
│   │   ├── SelectorUsageExample.tsx    # Using selectors
│   │   ├── AsyncThunkUsageExample.tsx  # Handling async operations
│   │   └── UIStateExample.tsx          # UI state management
│   │
│   ├── index.ts                       # Main export file (use this!)
│   ├── REDUX_GUIDE.md                 # Detailed Redux guide
│   └── README.md                      # This file
│
├── pages/                             # Page components
├── components/                        # Reusable components
├── services/                          # API services
├── types/                             # App type definitions
├── mocks/                             # Mock data
├── App.tsx                            # Main app component
├── main.tsx                           # App entry point (with Redux Provider)
└── index.css                          # Global styles
```

## Installation & Setup

Redux packages are already installed. If needed, you can reinstall them:

```bash
npm install @reduxjs/toolkit react-redux redux-logger
npm install -D @types/redux-logger
```

## Quick Start

### 1. Using Hooks (Recommended)

```tsx
import { useAppDispatch, useAuthUser, useExpenses, fetchExpenses } from '@/redux';

function MyComponent() {
  const dispatch = useAppDispatch();
  const user = useAuthUser();
  const expenses = useExpenses();

  useEffect(() => {
    dispatch(fetchExpenses({}));
  }, [dispatch]);

  return <div>{user?.fullName} - {expenses.length} expenses</div>;
}
```

### 2. Using Selectors

```tsx
import { useAppSelector, selectAuthUser, selectExpensesTotal } from '@/redux';

function MyComponent() {
  const user = useAppSelector(selectAuthUser);
  const total = useAppSelector(selectExpensesTotal);

  return <div>{user?.fullName}: ${total}</div>;
}
```

### 3. Dispatching Actions

```tsx
import { useAppDispatch, login, createExpense, addNotification } from '@/redux';

function MyComponent() {
  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    const result = await dispatch(login({ email: 'user@example.com' }));
    if (result.type === 'auth/login/fulfilled') {
      dispatch(addNotification({
        type: 'success',
        message: 'Logged in successfully!',
      }));
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

## State Structure

### Auth State
```typescript
{
  user: User | null;                    // Current logged-in user
  token: string | null;                 // Auth token
  status: 'idle' | 'loading' | 'success' | 'error';
  error: ApiError | null;               // Error details
  isAdmin: boolean;                     // User role check
  isTeamMember: boolean;                // User role check
}
```

### Expenses State
```typescript
{
  items: Expense[];                     // All expenses
  selectedExpense: Expense | null;      // Currently selected expense
  status: RequestStatus;                // Loading state
  error: ApiError | null;               // Error details
  pagination: { page, pageSize, total, hasMore };
  filters: { category, status, startDate, endDate };
  totalAmount: number;                  // Sum of all expenses
}
```

### Dashboard State
```typescript
{
  stats: DashboardStats | null;         // Dashboard statistics
  spending: any[];                      // Spending chart data
  categories: any[];                    // Category breakdown
  status: RequestStatus;
  error: ApiError | null;
  lastUpdated: string | null;           // Last update timestamp
}
```

### Team State
```typescript
{
  teams: Team[];                        // List of teams
  selectedTeam: Team | null;            // Currently selected team
  status: RequestStatus;
  error: ApiError | null;
}
```

### UI State
```typescript
{
  sidebarOpen: boolean;                 // Sidebar visibility
  darkMode: boolean;                    // Dark mode toggle
  notifications: Notification[];        // Toast notifications
  modalOpen: {                          // Modal states
    expenseModal: boolean;
    teamModal: boolean;
    confirmDialog: boolean;
  };
  loading: boolean;                     // Global loading state
}
```

## Available Hooks

### Auth Hooks
- `useAuth()` - Get full auth state
- `useAuthUser()` - Get current user
- `useAuthStatus()` - Get auth status
- `useAuthError()` - Get auth error
- `useIsAdmin()` - Check if user is admin
- `useIsTeamMember()` - Check if user is team member

### Expenses Hooks
- `useExpenses()` - Get all expenses
- `useExpensesStatus()` - Get expenses loading status
- `useExpensesError()` - Get expenses error
- `useExpensesTotal()` - Get total amount spent
- `useExpensesFilters()` - Get applied filters
- `useExpensesPagination()` - Get pagination info
- `useSelectedExpense()` - Get selected expense

### Dashboard Hooks
- `useDashboard()` - Get full dashboard state
- `useDashboardStats()` - Get stats
- `useDashboardSpending()` - Get spending data
- `useDashboardCategories()` - Get categories
- `useDashboardStatus()` - Get loading status
- `useDashboardError()` - Get error

### Team Hooks
- `useTeams()` - Get all teams
- `useTeamsStatus()` - Get teams loading status
- `useTeamsError()` - Get teams error
- `useSelectedTeam()` - Get selected team

### UI Hooks
- `useUIState()` - Get full UI state
- `useSidebarOpen()` - Get sidebar visibility
- `useDarkMode()` - Get dark mode status
- `useNotifications()` - Get notifications
- `useModalOpen()` - Get modal states
- `useLoading()` - Get global loading state

## Available Actions

### Auth Actions
- `login(email)` - Login user
- `signup({ fullName, email, password, role })` - Register user
- `updateProfile({ profileData, userId })` - Update user profile
- `logout()` - Logout user
- `clearError()` - Clear auth errors
- `setRoles(isAdmin, isTeamMember)` - Set user roles

### Expenses Actions
- `fetchExpenses(options)` - Get expenses
- `createExpense(data)` - Add new expense
- `updateExpense({ id, data })` - Modify expense
- `deleteExpense(id)` - Remove expense
- `setFilters(filters)` - Apply filters
- `setPagination(pagination)` - Set pagination
- `selectExpense(expense)` - Select expense
- `calculateTotal()` - Recalculate total

### Dashboard Actions
- `fetchDashboardStats()` - Get dashboard data

### Team Actions
- `fetchTeams()` - Get teams
- `createTeam(data)` - Add team
- `updateTeam({ id, data })` - Modify team
- `deleteTeam(id)` - Remove team
- `selectTeam(team)` - Select team

### UI Actions
- `toggleSidebar()` - Toggle sidebar
- `setSidebarOpen(boolean)` - Set sidebar state
- `toggleDarkMode()` - Toggle dark mode
- `setDarkMode(boolean)` - Set dark mode state
- `addNotification({ type, message, duration })` - Show notification
- `removeNotification(id)` - Remove notification
- `clearNotifications()` - Remove all notifications
- `openModal(modalName)` - Open modal
- `closeModal(modalName)` - Close modal
- `setLoading(boolean)` - Set global loading

## Available Selectors

### Selector Functions
```tsx
import {
  selectAuthUser,
  selectExpenses,
  selectExpensesTotal,
  selectDashboardStats,
  selectTeams,
  selectNotifications,
  selectSidebarOpen,
} from '@/redux';

// Usage
const user = useAppSelector(selectAuthUser);
const total = useAppSelector(selectExpensesTotal);

// With parameters
const expensesByStatus = useAppSelector(selectExpensesByStatus('Pending'));
const teamById = useAppSelector(selectTeamById('team-123'));
```

## Examples

### Complete Component Example

```tsx
import React, { useEffect } from 'react';
import {
  useAppDispatch,
  useAppSelector,
  fetchExpenses,
  createExpense,
  selectExpenses,
  selectExpensesStatus,
  selectExpensesError,
  selectExpensesTotal,
  addNotification,
} from '@/redux';

export function ExpenseManager() {
  const dispatch = useAppDispatch();
  const expenses = useAppSelector(selectExpenses);
  const status = useAppSelector(selectExpensesStatus);
  const error = useAppSelector(selectExpensesError);
  const total = useAppSelector(selectExpensesTotal);

  useEffect(() => {
    dispatch(fetchExpenses({}));
  }, [dispatch]);

  const handleAddExpense = async () => {
    const result = await dispatch(createExpense({
      title: 'Coffee',
      amount: 5.50,
      date: new Date().toISOString(),
      category: 'Food',
      userId: 'user123',
      userName: 'John',
      status: 'Pending',
    }));

    if (result.type === 'expenses/createExpense/fulfilled') {
      dispatch(addNotification({
        type: 'success',
        message: 'Expense added!',
      }));
    }
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Expenses: ${total}</h1>
      <button onClick={handleAddExpense}>Add Expense</button>
      <ul>
        {expenses.map(e => (
          <li key={e.id}>{e.title} - ${e.amount}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Best Practices

1. **Always use typed hooks** - Use `useAppDispatch` and `useAppSelector` for type safety
2. **Prefer hooks over selectors** - Hooks are simpler: `useExpenses()` vs `useAppSelector(selectExpenses)`
3. **Handle loading states** - Always check `status` before rendering
4. **Handle errors** - Show error messages when `error` is not null
5. **Use selectors for complex logic** - Selectors prevent unnecessary re-renders
6. **Keep slices focused** - Each slice handles one domain
7. **Type your components** - Use TypeScript for better DX

## Debugging

### Redux DevTools

Open your browser's Redux DevTools to:
- See all dispatched actions
- Time travel through state changes
- Inspect state at each step
- Replay actions

Enable with: Enable Redux DevTools Chrome Extension

### Logging

Redux Logger is enabled in development mode. Check console for:
- Previous state
- Action dispatched
- Next state
- Time taken

## File Paths

All Redux imports use `@/redux`:

```tsx
// ✅ Good
import { useAppDispatch, fetchExpenses } from '@/redux';

// ❌ Avoid
import { useAppDispatch } from '../../../redux/hooks';
import { fetchExpenses } from '../../../redux/slices/expensesSlice';
```

## FAQ

**Q: Where should I import Redux from?**
A: Always import from `@/redux` - it's the main export file.

**Q: Should I use hooks or selectors?**
A: Hooks are simpler for basic usage, selectors are better for complex logic.

**Q: How do I handle async operations?**
A: Use async thunks like `fetchExpenses`, `createExpense`, etc.

**Q: How do I show notifications?**
A: Dispatch `addNotification` action from UI slice.

**Q: How do I manage modals?**
A: Use `openModal` and `closeModal` from UI slice.

## Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [React-Redux Hooks](https://react-redux.js.org/api/hooks)
- [REDUX_GUIDE.md](./REDUX_GUIDE.md) - Detailed guide

## Support

Check the examples folder for complete working examples of:
- Hook usage
- Selector usage
- Async thunk handling
- UI state management
