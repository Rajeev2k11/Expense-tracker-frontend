import api from "@/services/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { act } from "react";
import { id } from "zod/locales";

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return rejectWithValue('Failed to fetch users');
    }
  }
);

const initialState = {
  id: null,
  name: '',
  email: '',
  username: '',
  role: '',
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.username = action.payload.username;
      state.role = action.payload.role;
    },
    clearUser(state) {
      state.id = null;
      state.name = '';
      state.email = '';
      state.username = '';
      state.role = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        // Handle the fetched users data as needed
        console.log('Fetched users:', action.payload);
         state.username= action.payload as string;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as null | string;
       
      });
  },
});

export const { setUser, clearUser } = authSlice.actions;

export default authSlice.reducer;