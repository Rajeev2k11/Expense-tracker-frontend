# Redux Architecture Diagram

## Redux State Tree Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                        Redux Store                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Auth Slice (authSlice.ts)                               │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ • user: User | null                                      │   │
│  │ • token: string | null                                   │   │
│  │ • status: RequestStatus                                  │   │
│  │ • error: ApiError | null                                 │   │
│  │ • isAdmin: boolean                                       │   │
│  │ • isTeamMember: boolean                                  │   │
│  │                                                          │   │
│  │ Thunks: login, signup, updateProfile                    │   │
│  │ Actions: logout, clearError, setRoles                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Expenses Slice (expensesSlice.ts)                        │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ • items: Expense[]                                       │   │
│  │ • selectedExpense: Expense | null                        │   │
│  │ • status: RequestStatus                                  │   │
│  │ • error: ApiError | null                                 │   │
│  │ • pagination: PaginationState                            │   │
│  │ • filters: { category, status, dates }                  │   │
│  │ • totalAmount: number                                    │   │
│  │                                                          │   │
│  │ Thunks: fetchExpenses, createExpense,                   │   │
│  │         updateExpense, deleteExpense                    │   │
│  │ Actions: setFilters, setPagination, selectExpense       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Dashboard Slice (dashboardSlice.ts)                      │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ • stats: DashboardStats | null                           │   │
│  │ • spending: any[]                                        │   │
│  │ • categories: any[]                                      │   │
│  │ • status: RequestStatus                                  │   │
│  │ • error: ApiError | null                                 │   │
│  │ • lastUpdated: string | null                             │   │
│  │                                                          │   │
│  │ Thunks: fetchDashboardStats                             │   │
│  │ Actions: clearError                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Team Slice (teamSlice.ts)                                │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ • teams: Team[]                                          │   │
│  │ • selectedTeam: Team | null                              │   │
│  │ • status: RequestStatus                                  │   │
│  │ • error: ApiError | null                                 │   │
│  │                                                          │   │
│  │ Thunks: fetchTeams, createTeam,                         │   │
│  │         updateTeam, deleteTeam                          │   │
│  │ Actions: selectTeam, clearError                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ UI Slice (uiSlice.ts)                                    │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ • sidebarOpen: boolean                                   │   │
│  │ • darkMode: boolean                                      │   │
│  │ • notifications: Notification[]                          │   │
│  │ • modalOpen: { expenseModal, teamModal, confirmDialog }  │   │
│  │ • loading: boolean                                       │   │
│  │                                                          │   │
│  │ Actions: toggleSidebar, setDarkMode,                    │   │
│  │          addNotification, openModal, etc.               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────┐
│  Component   │
│   (React)    │
└──────┬───────┘
       │
       │ useAppDispatch()
       │ useAppSelector()
       │
       ↓
┌─────────────────────────────────────────────────┐
│           Custom Hooks & Selectors              │
│  (hooks/index.ts, selectors/index.ts)           │
├─────────────────────────────────────────────────┤
│ • useAppDispatch()                              │
│ • useAuthUser()                                 │
│ • useExpenses()                                 │
│ • useDashboardStats()                           │
│ • selectExpensesByCategory()                    │
│ • selectTeamById()                              │
└──────────────┬──────────────────────────────────┘
               │
               │ dispatch(action)
               │ or
               │ subscribe to state
               │
       ┌───────┴───────┐
       │               │
       ↓               ↓
┌─────────────┐  ┌─────────────┐
│   Thunks    │  │ Reducers    │
│  (Async)    │  │  (Sync)     │
├─────────────┤  ├─────────────┤
│ • login     │  │ • logout    │
│ • signup    │  │ • setFilters│
│ • fetch...  │  │ • openModal │
│ • create... │  │ • setDarkMode
│ • update... │  │ • etc.      │
│ • delete... │  │             │
└──────┬──────┘  └──────┬──────┘
       │                │
       └────────┬───────┘
                │
                ↓
       ┌─────────────────────┐
       │   Redux Store       │
       │ (state/getState())  │
       └─────────────────────┘
                │
                ↓ (state updated)
                │
       ┌─────────────────────┐
       │  Middleware         │
       │ • redux-logger      │
       │ • error handler     │
       │ • DevTools          │
       └─────────────────────┘
                │
                ↓ (state updated)
                │
       ┌─────────────────────┐
       │   Component         │
       │  (re-renders)       │
       └─────────────────────┘
```

## Hook Usage Flow

```
┌─────────────────────────────────────────────────────────┐
│                Component                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 1. Get Dispatch                                         │
│    const dispatch = useAppDispatch();                  │
│                                                         │
│ 2. Get State                                            │
│    const user = useAuthUser();                         │
│    const expenses = useExpenses();                     │
│    const status = useExpensesStatus();                 │
│                                                         │
│ 3. Dispatch Async Action                               │
│    dispatch(fetchExpenses({}))                         │
│         │                                               │
│         ├─→ action.pending                             │
│         │   • status = 'loading'                       │
│         │                                               │
│         ├─→ API call (async)                           │
│         │                                               │
│         └─→ action.fulfilled or rejected               │
│             • status = 'success' or 'error'            │
│             • data updated or error set                │
│                                                         │
│ 4. Component Re-renders                                │
│    • Shows loading state (status === 'loading')       │
│    • Shows data when ready (status === 'success')     │
│    • Shows error message (status === 'error')         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Selector Usage Flow

```
┌────────────────────────────────────────────────────┐
│        useAppSelector(selector)                    │
├────────────────────────────────────────────────────┤
│                                                    │
│ const expenses = useAppSelector(selectExpenses)   │
│              ↓                                     │
│        Pass RootState                             │
│              ↓                                     │
│  Selector returns state.expenses.items            │
│              ↓                                     │
│     Subscribe to changes                          │
│              ↓                                     │
│ When state.expenses.items changes,                │
│ Component re-renders with new value               │
│                                                    │
└────────────────────────────────────────────────────┘
```

## Async Operation Flow

```
┌──────────────────────────────────────────────────────────┐
│ 1. Call Thunk                                            │
│    dispatch(fetchExpenses({ page: 1 }))                │
└──────────────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ 2. Pending State                                         │
│    status: 'loading'                                     │
│    error: null                                           │
└──────────────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ 3. Execute Async Task                                    │
│    await api.get('/expenses', { params: ... })          │
└──────────────────────────────────────────────────────────┘
                     ↓
        ┌────────────┴────────────┐
        │                         │
        ↓ Success                 ↓ Error
┌──────────────────┐    ┌──────────────────┐
│ 4a. Fulfilled    │    │ 4b. Rejected     │
│ status: 'success'│    │ status: 'error'  │
│ items: [...]     │    │ error: ApiError  │
│ error: null      │    │ items: []        │
└──────────────────┘    └──────────────────┘
        ↓                        ↓
┌──────────────────────────────────────────────────────────┐
│ 5. Component Updates                                     │
│    • Re-renders with new state                          │
│    • Shows data or error message                        │
└──────────────────────────────────────────────────────────┘
```

## File Import Dependencies

```
Component
  ├─ @/redux
  │   ├─ store/index.ts (store, RootState, AppDispatch)
  │   ├─ hooks/index.ts (useAppDispatch, custom hooks)
  │   ├─ selectors/index.ts (selector functions)
  │   ├─ slices/*.ts (actions, thunks)
  │   └─ types/index.ts (RequestStatus, ApiError, etc.)
  │
  └─ services/api.ts (axios instance)
      └─ interceptors (auth, error handling)
```

## Middleware Chain

```
    Action Dispatched
         │
         ↓
  ┌─────────────────┐
  │ Default Redux   │
  │ Middleware      │
  │ (thunk, etc.)   │
  └────────┬────────┘
           │
           ↓ (if DEV mode)
  ┌──────────────────┐
  │ Redux Logger     │
  │ (log state)      │
  └────────┬─────────┘
           │
           ↓
  ┌──────────────────┐
  │ Error Handler    │
  │ Middleware       │
  └────────┬─────────┘
           │
           ↓
  ┌──────────────────┐
  │ Redux DevTools   │
  │ (integration)    │
  └────────┬─────────┘
           │
           ↓
    Reducer Executed
           │
           ↓
    State Updated
           │
           ↓
  Subscribers Notified
           │
           ↓
  Component Re-renders
```

## Type Safety Flow

```
RootState (inferred from store)
    ├─ auth: AuthState
    │   ├─ user: User | null
    │   ├─ token: string | null
    │   ├─ status: RequestStatus
    │   ├─ error: ApiError | null
    │   └─ ... (more fields)
    │
    ├─ expenses: ExpensesState
    │   ├─ items: Expense[]
    │   ├─ status: RequestStatus
    │   └─ ... (more fields)
    │
    ├─ dashboard: DashboardState
    ├─ team: TeamState
    └─ ui: UIState

AppDispatch (inferred from store)
    ├─ (action: AnyAction) => any
    └─ (thunk: AsyncThunkAction) => Promise
```

## Error Handling Flow

```
API Call in Thunk
        │
        ├─ Success
        │   └─→ return data
        │
        └─ Error
            │
            ├─→ Try extract error message
            │   • Check response.data.message
            │   • Check error.message
            │   • Use fallback message
            │
            └─→ return rejectWithValue(ApiError)
                    │
                    ↓
            Reducer catches rejection
                    │
                    ├─→ status = 'error'
                    ├─→ error = ApiError
                    └─→ Show error in UI
```

This architecture ensures:
✅ Type safety throughout
✅ Clear data flow
✅ Predictable state management
✅ Easy debugging with DevTools
✅ Scalable and maintainable
