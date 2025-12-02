/**
 * Example Hook Usage Component
 * Shows best practices for using Redux hooks
 */

import React from 'react';
import {
  useAppDispatch,
  useAuthUser,
  useExpenses,
  useExpensesTotal,
  useExpensesStatus,
  fetchExpenses,
  addNotification,
  openModal,
} from '@/redux';

export const HookUsageExample: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAuthUser();
  const expenses = useExpenses();
  const total = useExpensesTotal();
  const status = useExpensesStatus();

  React.useEffect(() => {
    // Fetch expenses on mount
    void dispatch(fetchExpenses({ page: 1, pageSize: 10 }));
  }, [dispatch]);

  const handleAddExpense = () => {
    // Show modal and notify
    dispatch(openModal('expenseModal'));
    dispatch(addNotification({
      type: 'info',
      message: 'Opening expense form...',
    }));
  };

  if (status === 'loading') {
    return <div>Loading expenses...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {user?.fullName}
      </h1>

      <div className="mb-6">
        <p className="text-lg">Total Spent: ${total}</p>
        <p className="text-sm text-gray-500">
          Number of expenses: {expenses.length}
        </p>
      </div>

      <button
        onClick={handleAddExpense}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add Expense
      </button>

      <div className="mt-6">
        {expenses.map((expense) => (
          <div key={expense.id} className="border p-4 mb-2 rounded">
            <p className="font-semibold">{expense.title}</p>
            <p className="text-sm text-gray-600">${expense.amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
