# Redux Documentation

## Folder Structure

```
src/redux/
├── store/
│   └── index.ts                 # Redux store configuration
├── slices/
│   ├── authSlice.ts             # Authentication state management
│   ├── expensesSlice.ts         # Expenses data management
│   ├── dashboardSlice.ts        # Dashboard statistics
│   ├── teamSlice.ts             # Team data management
│   └── uiSlice.ts               # UI state management
├── hooks/
│   └── index.ts                 # Custom Redux hooks
├── selectors/
│   └── index.ts                 # Selectors for state access
├── middleware/
│   └── errorHandler.ts          # Custom middleware
├── types/
│   └── index.ts                 # Redux type definitions
├── utils/
│   ├── errorHandler.ts          # Error handling utilities
│   └── asyncThunkHelper.ts      # Async thunk helpers
└── index.ts                     # Main export file
```

## Store Structure

### Auth State
```typescript
{
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: ApiError | null;
  isAdmin: boolean;
  isTeamMember: boolean;
}
```

### Expenses State
```typescript
{
  items: Expense[];
  selectedExpense: Expense | null;
  status: RequestStatus;
  error: ApiError | null;
  pagination: PaginationState;
  filters: { category, status, startDate, endDate };
  totalAmount: number;
}
```

### Dashboard State
```typescript
{
  stats: DashboardStats | null;
  spending: any[];
  categories: any[];
  status: RequestStatus;
  error: ApiError | null;
  lastUpdated: string | null;
}
```

### Team State
```typescript
{
  teams: Team[];
  selectedTeam: Team | null;
  status: RequestStatus;
  error: ApiError | null;
}
```

### UI State
```typescript
{
  sidebarOpen: boolean;
  darkMode: boolean;
  notifications: Notification[];
  modalOpen: { expenseModal, teamModal, confirmDialog };
  loading: boolean;
}
```

## Usage Examples

### Using Hooks

```tsx
import { useAppDispatch, useAppSelector, useAuthUser } from '@/redux';

function MyComponent() {
  // Using custom hooks
  const user = useAuthUser();
  const expenses = useAppSelector(state => state.expenses.items);
  const dispatch = useAppDispatch();

  return (
    <div>
      <p>User: {user?.fullName}</p>
      <p>Expenses Count: {expenses.length}</p>
    </div>
  );
}
```

### Using Selectors

```tsx
import { useAppSelector, selectAuthUser, selectExpensesTotal } from '@/redux';

function MyComponent() {
  const user = useAppSelector(selectAuthUser);
  const total = useAppSelector(selectExpensesTotal);

  return (
    <div>
      <p>User: {user?.fullName}</p>
      <p>Total Spent: ${total}</p>
    </div>
  );
}
```

### Dispatching Actions

```tsx
import { useAppDispatch, login, createExpense } from '@/redux';

function MyComponent() {
  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    const result = await dispatch(login({ email: 'user@example.com' }));
    if (result.type === 'auth/login/fulfilled') {
      console.log('Login successful');
    }
  };

  const handleCreateExpense = async () => {
    await dispatch(createExpense({
      title: 'Coffee',
      amount: 5,
      date: new Date().toISOString(),
      category: 'Food',
      userId: 'user123',
      userName: 'John',
      status: 'Pending',
    }));
  };

  return (
    <>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleCreateExpense}>Add Expense</button>
    </>
  );
}
```

### UI State Management

```tsx
import {
  useAppDispatch,
  toggleSidebar,
  addNotification,
  openModal,
} from '@/redux';

function MyComponent() {
  const dispatch = useAppDispatch();

  const showNotification = () => {
    dispatch(addNotification({
      type: 'success',
      message: 'Expense created successfully!',
      duration: 3000,
    }));
  };

  const openExpenseModal = () => {
    dispatch(openModal('expenseModal'));
  };

  return (
    <>
      <button onClick={() => dispatch(toggleSidebar())}>Toggle Sidebar</button>
      <button onClick={showNotification}>Show Success</button>
      <button onClick={openExpenseModal}>Open Modal</button>
    </>
  );
}
```

## Async Thunks

All async operations use Redux Toolkit's `createAsyncThunk`:

- `login` - User login
- `signup` - User registration
- `updateProfile` - Update user profile
- `fetchExpenses` - Get expenses list
- `createExpense` - Add new expense
- `updateExpense` - Modify expense
- `deleteExpense` - Remove expense
- `fetchDashboardStats` - Get dashboard data
- `fetchTeams` - Get teams list
- `createTeam` - Add new team
- `updateTeam` - Modify team
- `deleteTeam` - Remove team

## Best Practices

1. **Always use typed hooks**: Use `useAppDispatch` and `useAppSelector` for type safety
2. **Use selectors**: Prefer selectors over inline state access for reusability
3. **Handle loading states**: Always check `status` before rendering data
4. **Error handling**: Use `error` state to show error messages to users
5. **Keep slices focused**: Each slice handles one domain (auth, expenses, etc.)
6. **Use actions properly**: Import from main index file `/redux`

## Error Handling

```tsx
import { useAppSelector } from '@/redux';

function MyComponent() {
  const { error, status } = useAppSelector(state => state.expenses);

  if (status === 'error' && error) {
    return <div className="alert">{error.message}</div>;
  }

  return <div>Content</div>;
}
```

## Redux DevTools

Redux DevTools are enabled in development mode. Open DevTools to:
- View all dispatched actions
- Time travel debugging
- State inspection
- Action replay
