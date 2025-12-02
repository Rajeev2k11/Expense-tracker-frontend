/**
 * Example Selector Usage Component
 * Shows how to use selectors for accessing state
 */

import React from 'react';
import {
  useAppDispatch,
  useAppSelector,
  selectAuthUser,
  selectExpenses,
  selectExpensesTotal,
  selectExpensesByStatus,
  selectIsAdmin,
  fetchExpenses,
} from '@/redux';

export const SelectorUsageExample: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const expenses = useAppSelector(selectExpenses);
  const total = useAppSelector(selectExpensesTotal);
  const pendingExpenses = useAppSelector(selectExpensesByStatus('Pending'));
  const isAdmin = useAppSelector(selectIsAdmin);

  React.useEffect(() => {
    void dispatch(fetchExpenses({}));
  }, [dispatch]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-sm text-gray-600">User</p>
          <p className="text-lg font-semibold">{user?.fullName}</p>
        </div>

        <div className="bg-green-50 p-4 rounded">
          <p className="text-sm text-gray-600">Total Spent</p>
          <p className="text-lg font-semibold">${total}</p>
        </div>

        <div className="bg-orange-50 p-4 rounded">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-lg font-semibold">{pendingExpenses.length}</p>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-purple-50 p-4 rounded mb-6">
          <p className="text-sm font-semibold text-purple-600">
            Admin Access Enabled
          </p>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">All Expenses</h2>
        {expenses.map((expense) => (
          <div key={expense.id} className="border p-4 mb-2 rounded">
            <p className="font-semibold">{expense.title}</p>
            <p className="text-sm text-gray-600">
              {expense.category} - ${expense.amount}
            </p>
            <p className="text-xs text-gray-400">{expense.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
