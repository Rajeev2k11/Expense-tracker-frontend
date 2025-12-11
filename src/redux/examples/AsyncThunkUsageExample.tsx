/**
 * Example Async Thunk Usage Component
 * Shows how to handle async operations and loading states
 */

import React from 'react';
import {
  useAppDispatch,
  useAppSelector,
  createExpense,
  fetchExpenses,
  selectExpenses,
  selectExpensesStatus,
  selectExpensesError,
} from '@/redux';
import type { Expense } from '@/types';

export const AsyncThunkUsageExample: React.FC = () => {
  const dispatch = useAppDispatch();
  const expenses = useAppSelector(selectExpenses);
  const status = useAppSelector(selectExpensesStatus);
  const error = useAppSelector(selectExpensesError);

  React.useEffect(() => {
    // Fetch initial expenses
    void dispatch(fetchExpenses({ page: 1, pageSize: 10 }));
  }, [dispatch]);

  const handleAddExpense = async () => {
    const newExpense: Omit<Expense, 'id'> = {
      title: 'Coffee',
      amount: 5.50,
      date: new Date().toISOString(),
      category: 'Food',
      userId: 'user123',
      userName: 'John Doe',
      status: 'Pending',
      notes: 'Morning coffee',
    };

    try {
      const result = await dispatch(createExpense(newExpense));
      if (result.type === 'expenses/createExpense/fulfilled') {
        console.log('Expense created successfully');
      }
    } catch (err) {
      console.error('Failed to create expense:', err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Expense Management</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error.message}
        </div>
      )}

      <button
        onClick={handleAddExpense}
        disabled={status === 'loading'}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {status === 'loading' ? 'Adding...' : 'Add Expense'}
      </button>

      <div className="mt-6">
        {status === 'loading' && expenses.length === 0 && (
          <div className="text-center text-gray-500">Loading expenses...</div>
        )}

        {status === 'error' && (
          <div className="text-center text-red-500">
            Failed to load expenses. Please try again.
          </div>
        )}

        {status === 'success' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Expenses ({expenses.length})
            </h2>
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="border p-4 mb-2 rounded hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{expense.title}</p>
                    <p className="text-sm text-gray-600">
                      {expense.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${expense.amount}</p>
                    <p className={`text-xs ${
                      expense.status === 'Approved'
                        ? 'text-green-600'
                        : expense.status === 'Pending'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}>
                      {expense.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
