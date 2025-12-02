/**
 * Example UI State Management Component
 * Shows how to manage UI state (modals, notifications, sidebar)
 */

import React from 'react';
import {
  useAppDispatch,
  useAppSelector,
  toggleSidebar,
  toggleDarkMode,
  addNotification,
  removeNotification,
  openModal,
  closeModal,
  selectSidebarOpen,
  selectDarkMode,
  selectNotifications,
  selectModalOpen,
} from '@/redux';

export const UIStateExample: React.FC = () => {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector(selectSidebarOpen);
  const darkMode = useAppSelector(selectDarkMode);
  const notifications = useAppSelector(selectNotifications);
  const modals = useAppSelector(selectModalOpen);

  const handleShowNotification = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: 'Operation completed successfully!',
      error: 'An error occurred. Please try again.',
      warning: 'Please be careful with this action.',
      info: 'Here is some useful information.',
    };

    dispatch(addNotification({
      type,
      message: messages[type],
      duration: 3000,
    }));
  };

  const handleRemoveNotification = (id: string) => {
    dispatch(removeNotification(id));
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
      {/* Header */}
      <header className="border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">UI Management</h1>
          <div className="flex gap-2">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              {sidebarOpen ? 'Hide' : 'Show'} Sidebar
            </button>
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="px-3 py-1 bg-purple-500 text-white rounded text-sm"
            >
              {darkMode ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 border-r p-4">
            <h2 className="font-bold mb-4">Navigation</h2>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-500">Dashboard</a></li>
              <li><a href="#" className="hover:text-blue-500">Expenses</a></li>
              <li><a href="#" className="hover:text-blue-500">Teams</a></li>
              <li><a href="#" className="hover:text-blue-500">Reports</a></li>
            </ul>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Notifications Demo</h2>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleShowNotification('success')}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Success
              </button>
              <button
                onClick={() => handleShowNotification('error')}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Error
              </button>
              <button
                onClick={() => handleShowNotification('warning')}
                className="px-4 py-2 bg-yellow-500 text-white rounded"
              >
                Warning
              </button>
              <button
                onClick={() => handleShowNotification('info')}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Info
              </button>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Modal Demo</h2>
            <button
              onClick={() => dispatch(openModal('expenseModal'))}
              className="px-4 py-2 bg-indigo-500 text-white rounded"
            >
              Open Expense Modal
            </button>
            {modals.expenseModal && (
              <div className="mt-4 p-4 border rounded bg-gray-50">
                <div className="flex justify-between items-center">
                  <p>Expense Modal is Open</p>
                  <button
                    onClick={() => dispatch(closeModal('expenseModal'))}
                    className="text-red-500 hover:text-red-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Notifications Display */}
          <div className="fixed bottom-4 right-4 space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded text-white flex justify-between items-center ${
                  notification.type === 'success'
                    ? 'bg-green-500'
                    : notification.type === 'error'
                      ? 'bg-red-500'
                      : notification.type === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                }`}
              >
                <span>{notification.message}</span>
                <button
                  onClick={() => handleRemoveNotification(notification.id)}
                  className="ml-2 text-white hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};
