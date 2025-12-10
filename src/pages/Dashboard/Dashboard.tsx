import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import SpendingLine from '../../components/charts/SpendingLine';
import CategoryDonut from '../../components/charts/CategoryDonut';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { DashboardStats } from '../../types';
import { useSelector } from 'react-redux';
import { fetchUsers } from '@/redux/slices/authSlice';
import { useAppDispatch } from '@/redux';

const DashboardPage: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [spending, setSpending] = useState<{ date: string; value: number }[]>([]);
  const [categories, setCategories] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const {username} = useSelector((state: any) => state.auth);

const dispatch = useAppDispatch();

  useEffect(() => {
    console.log('Username from Redux store:', username);
   dispatch(fetchUsers());
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.fullName}</h1>
        <p className="text-gray-600 mt-1">Here's your expense overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">${stats?.totalSpent ?? '0'}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget Left</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">${stats?.budgetLeft ?? '0'}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.pendingApprovals ?? '0'}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section - Updated Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Line Chart - Takes 2 columns on xl screens */}
        <Card className="xl:col-span-2 p-6 min-h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Spending Overview</h3>
            <select className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-gray-400">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-80">
            <SpendingLine data={spending} />
          </div>
        </Card>

        {/* Pie Chart - Takes 1 column on xl screens */}
        <Card className="p-6 min-h-[500px]">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Expenses by Category</h3>
          <div className="h-80">
            <CategoryDonut data={categories} />
          </div>
        </Card>
      </div>

      {/* Alternative Layout for smaller screens - Stack charts vertically */}
      <div className="grid grid-cols-1 gap-6 mb-8 lg:hidden">
        <Card className="p-6 min-h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Spending Overview</h3>
            <select className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-gray-400">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-80">
            <SpendingLine data={spending} />
          </div>
        </Card>

        <Card className="p-6 min-h-[500px]">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Expenses by Category</h3>
          <div className="h-80">
            <CategoryDonut data={categories} />
          </div>
        </Card>
      </div>

      {/* Role-based Sections */}
      {isAdmin() ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h4>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">Office Supplies</p>
                    <p className="text-sm text-gray-500">Today, 10:30 AM</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">$245.00</p>
                    <p className="text-sm text-yellow-600">Pending</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Team Summary</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Team Members</span>
                <span className="font-semibold">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Projects</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">This Month's Expense</span>
                <span className="font-semibold">$12,450</span>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Team</h4>
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-600">Team overview will appear here</p>
          </div>
        </Card>
      )}
    </Layout>
  );
};

export default DashboardPage;