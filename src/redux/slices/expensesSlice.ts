import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Expense, ExpenseStatus } from '../../types';
import type { ApiError, RequestStatus, PaginationState } from '../types';
import api from '../../services/api';

interface ExpensesState {
  items: Expense[];
  selectedExpense: Expense | null;
  status: RequestStatus;
  error: ApiError | null;
  pagination: PaginationState;
  filters: {
    category: string;
    status: ExpenseStatus | 'All';
    startDate: string;
    endDate: string;
  };
  totalAmount: number;
}

const initialState: ExpensesState = {
  items: [],
  selectedExpense: null,
  status: 'idle',
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: true,
  },
  filters: {
    category: 'All',
    status: 'All',
    startDate: '',
    endDate: '',
  },
  totalAmount: 0,
};

export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (
    {
      page = 1,
      pageSize = 10,
      filters,
    }: {
      page?: number;
      pageSize?: number;
      filters?: Record<string, unknown>;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/expenses', {
        params: {
          page,
          pageSize,
          ...filters,
        },
      });
      return response.data as Expense[];
    } catch (error) {
      const err = error as Record<string, unknown>;
      const errorData = (err?.response as Record<string, unknown>)?.data as Record<string, unknown>;
      return rejectWithValue({
        message: (errorData?.message as string) || 'Failed to fetch expenses',
        code: (err?.response as Record<string, unknown>)?.status || 'FETCH_ERROR',
      });
    }
  }
);

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (expenseData: Omit<Expense, 'id'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/expenses', expenseData);
      return response.data as Expense;
    } catch (error) {
      const err = error as Record<string, unknown>;
      const errorData = (err?.response as Record<string, unknown>)?.data as Record<string, unknown>;
      return rejectWithValue({
        message: (errorData?.message as string) || 'Failed to create expense',
        code: (err?.response as Record<string, unknown>)?.status || 'CREATE_ERROR',
      });
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async (
    { id, data }: { id: string; data: Partial<Expense> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/expenses/${id}`, data);
      return response.data as Expense;
    } catch (error) {
      const err = error as Record<string, unknown>;
      const errorData = (err?.response as Record<string, unknown>)?.data as Record<string, unknown>;
      return rejectWithValue({
        message: (errorData?.message as string) || 'Failed to update expense',
        code: (err?.response as Record<string, unknown>)?.status || 'UPDATE_ERROR',
      });
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/expenses/${id}`);
      return id;
    } catch (error) {
      const err = error as Record<string, unknown>;
      const errorData = (err?.response as Record<string, unknown>)?.data as Record<string, unknown>;
      return rejectWithValue({
        message: (errorData?.message as string) || 'Failed to delete expense',
        code: (err?.response as Record<string, unknown>)?.status || 'DELETE_ERROR',
      });
    }
  }
);

export const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ExpensesState['filters']>) => {
      state.filters = action.payload;
      state.pagination.page = 1;
    },
    setPagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    selectExpense: (state, action: PayloadAction<Expense | null>) => {
      state.selectedExpense = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    calculateTotal: (state) => {
      state.totalAmount = state.items.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.status = 'success';
        state.items = action.payload;
        state.pagination.total = action.payload.length || 0;
        state.totalAmount = state.items.reduce(
          (sum, expense) => sum + expense.amount,
          0
        );
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as ApiError;
      })
      .addCase(createExpense.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.status = 'success';
        state.items.unshift(action.payload);
        state.pagination.total += 1;
        state.totalAmount += action.payload.amount;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as ApiError;
      })
      .addCase(updateExpense.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.status = 'success';
        const index = state.items.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          const oldAmount = state.items[index].amount;
          state.items[index] = action.payload;
          state.totalAmount = state.totalAmount - oldAmount + action.payload.amount;
        }
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as ApiError;
      })
      .addCase(deleteExpense.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.status = 'success';
        const index = state.items.findIndex((e) => e.id === action.payload);
        if (index !== -1) {
          state.totalAmount -= state.items[index].amount;
          state.items.splice(index, 1);
          state.pagination.total -= 1;
        }
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as ApiError;
      });
  },
});

export const {
  setFilters,
  setPagination,
  selectExpense,
  clearError,
  calculateTotal,
} = expensesSlice.actions;
export default expensesSlice.reducer;
