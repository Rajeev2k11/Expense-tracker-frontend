import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  expenseApi,
  type CreateExpensePayload,
  type ExpenseEntity,
  type ExpenseApprovalPayload,
  type UpdateExpensePayload,
} from './expenseApi';

interface ExpenseState {
  expenses: ExpenseEntity[];
  loading: boolean;
  creating: boolean;
  updating: boolean;
  approving: boolean;
  deleting: boolean;
  error: string | null;
}

const initialState: ExpenseState = {
  expenses: [],
  loading: false,
  creating: false,
  updating: false,
  approving: false,
  deleting: false,
  error: null,
};

export const fetchExpenses = createAsyncThunk<ExpenseEntity[], void, { rejectValue: string }>(
  'expenses/fetchExpenses',
  async (_, { rejectWithValue }) => {
    try {
      return await expenseApi.listExpenses();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
      return rejectWithValue(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Failed to fetch expenses'
      );
    }
  }
);

export const createExpense = createAsyncThunk<ExpenseEntity, CreateExpensePayload, { rejectValue: string }>(
  'expenses/createExpense',
  async (payload, { rejectWithValue }) => {
    try {
      return await expenseApi.createExpense(payload);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
      return rejectWithValue(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Failed to create expense'
      );
    }
  }
);

export const updateExpense = createAsyncThunk<
  ExpenseEntity,
  { id: string; payload: UpdateExpensePayload },
  { rejectValue: string }
>(
  'expenses/updateExpense',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await expenseApi.updateExpense(id, payload);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
      return rejectWithValue(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Failed to update expense'
      );
    }
  }
);

export const approveExpense = createAsyncThunk<
  ExpenseEntity,
  { id: string; payload: ExpenseApprovalPayload },
  { rejectValue: string }
>(
  'expenses/approveExpense',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await expenseApi.approveOrRejectExpense(id, payload);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
      return rejectWithValue(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Failed to update expense approval'
      );
    }
  }
);

export const deleteExpense = createAsyncThunk<string, string, { rejectValue: string }>(
  'expenses/deleteExpense',
  async (id, { rejectWithValue }) => {
    try {
      await expenseApi.deleteExpense(id);
      return id;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
      return rejectWithValue(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Failed to delete expense'
      );
    }
  }
);

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearExpenseError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action: PayloadAction<ExpenseEntity[]>) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch expenses';
      })
      .addCase(createExpense.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action: PayloadAction<ExpenseEntity>) => {
        state.creating = false;
        state.expenses.unshift(action.payload);
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || 'Failed to create expense';
      })
      .addCase(updateExpense.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action: PayloadAction<ExpenseEntity>) => {
        state.updating = false;
        const index = state.expenses.findIndex((expense) => expense.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || 'Failed to update expense';
      })
      .addCase(approveExpense.pending, (state) => {
        state.approving = true;
        state.error = null;
      })
      .addCase(approveExpense.fulfilled, (state, action) => {
        state.approving = false;
        const index = state.expenses.findIndex((expense) => expense.id === action.payload.id);
        if (index !== -1) {
          const requestedStatus = action.meta.arg.payload.status === 'approved' ? 'Approved' : 'Rejected';
          state.expenses[index] = {
            ...state.expenses[index],
            ...action.payload,
            status: requestedStatus,
          };
        }
      })
      .addCase(approveExpense.rejected, (state, action) => {
        state.approving = false;
        state.error = action.payload || 'Failed to update expense approval';
      })
      .addCase(deleteExpense.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleting = false;
        state.expenses = state.expenses.filter((expense) => expense.id !== action.payload);
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload || 'Failed to delete expense';
      });
  },
});

export const { clearExpenseError } = expenseSlice.actions;
export default expenseSlice.reducer;
