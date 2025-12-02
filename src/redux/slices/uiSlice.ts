import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  notifications: Notification[];
  modalOpen: {
    expenseModal: boolean;
    teamModal: boolean;
    confirmDialog: boolean;
  };
  loading: boolean;
}

const initialState: UIState = {
  sidebarOpen: true,
  darkMode: false,
  notifications: [],
  modalOpen: {
    expenseModal: false,
    teamModal: false,
    confirmDialog: false,
  },
  loading: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const id = `${Date.now()}-${Math.random()}`;
      state.notifications.push({
        ...action.payload,
        id,
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    openModal: (
      state,
      action: PayloadAction<keyof UIState['modalOpen']>
    ) => {
      state.modalOpen[action.payload] = true;
    },
    closeModal: (
      state,
      action: PayloadAction<keyof UIState['modalOpen']>
    ) => {
      state.modalOpen[action.payload] = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
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
} = uiSlice.actions;
export default uiSlice.reducer;
