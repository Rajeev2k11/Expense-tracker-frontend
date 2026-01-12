import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import categoryApi from './categoryApi';
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from './categoryApi';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
};

// Async thunk to fetch all categories
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await categoryApi.getCategories();
      return categories;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

// Async thunk to create a new category
export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (payload: CreateCategoryPayload, { rejectWithValue }) => {
    try {
      const category = await categoryApi.createCategory(payload);
      return category;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
      return rejectWithValue(
        err.response?.data?.message || 
        err.response?.data?.error || 
        err.message || 
        'Failed to create category'
      );
    }
  }
);

// Async thunk to update a category
export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, payload }: { id: string; payload: UpdateCategoryPayload }, { rejectWithValue }) => {
    try {
      const category = await categoryApi.updateCategory(id, payload);
      return category;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
      return rejectWithValue(
        err.response?.data?.message || 
        err.response?.data?.error || 
        err.message || 
        'Failed to update category'
      );
    }
  }
);

// Async thunk to delete a category
export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      await categoryApi.deleteCategory(id);
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(
        err.response?.data?.message || 
        err.message || 
        'Failed to delete category'
      );
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.creating = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })
      
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.updating = false;
        const index = state.categories.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = { 
            ...action.payload, 
            updatedAt: new Date().toISOString() 
          };
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })
      
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleting = false;
        state.categories = state.categories.filter(cat => cat.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;
