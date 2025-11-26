import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useForm } from 'react-hook-form';
import { Plus, Search, Download, Trash2, Calendar, DollarSign, Tag } from 'lucide-react';

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  status: string;
  description: string;
};

const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const { register, handleSubmit, reset } = useForm();

  const categories = ['All', 'Marketing', 'Meals', 'Travel', 'Software', 'Office', 'Other'];

  // Load expenses from localStorage or use demo data
  const loadExpenses = () => {
    setLoading(true);
    try {
      const storedExpenses = localStorage.getItem('expenses');
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses));
      } else {
        // Demo data
        const demoExpenses: Expense[] = [
          {
            id: '1',
            title: 'Office Supplies',
            amount: 245.50,
            category: 'Office',
            date: new Date().toISOString(),
            status: 'Pending',
            description: 'Purchase of stationery and office materials'
          },
          {
            id: '2',
            title: 'Client Dinner',
            amount: 189.75,
            category: 'Meals',
            date: new Date(Date.now() - 86400000).toISOString(),
            status: 'Approved',
            description: 'Business dinner with potential clients'
          },
          {
            id: '3',
            title: 'Software Subscription',
            amount: 499.00,
            category: 'Software',
            date: new Date(Date.now() - 172800000).toISOString(),
            status: 'Approved',
            description: 'Annual subscription for design tools'
          }
        ];
        setExpenses(demoExpenses);
        localStorage.setItem('expenses', JSON.stringify(demoExpenses));
      }
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  // Save expenses to localStorage whenever expenses change
  useEffect(() => {
    if (expenses.length > 0) {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    }
  }, [expenses]);

  const onDelete = async (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
    setSelectedExpenses(prev => prev.filter(expenseId => expenseId !== id));
    setShowDeleteModal(false);
    setExpenseToDelete(null);
  };

  const onBulkDelete = () => {
    setExpenses(prev => prev.filter(expense => !selectedExpenses.includes(expense.id)));
    setSelectedExpenses([]);
    setShowDeleteModal(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onAdd = async (data: any) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      title: data.title,
      amount: parseFloat(data.amount),
      category: data.category,
      date: new Date().toISOString(),
      status: 'Pending',
      description: data.description || ''
    };

    setExpenses(prev => [newExpense, ...prev]);
    setShowAddModal(false);
    reset();
  };

  // Placeholder for edit functionality not currently implemented

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'Approved';
      case 'Rejected': return 'Rejected';
      default: return 'Pending';
    }
  };

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Export Functions
  const exportToCSV = () => {
    const csvData = filteredExpenses.map(expense => ({
      Title: expense.title,
      Description: expense.description,
      Category: expense.category,
      Amount: expense.amount,
      Date: new Date(expense.date).toLocaleDateString(),
      Status: expense.status
    }));

    const headers = ['Title', 'Description', 'Category', 'Amount', 'Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Simple PDF export simulation - in real app, use libraries like jsPDF
    const pdfContent = `
      Expenses Report
      Generated on: ${new Date().toLocaleDateString()}
      
      ${filteredExpenses.map(expense => `
        Title: ${expense.title}
        Description: ${expense.description}
        Category: ${expense.category}
        Amount: $${expense.amount}
        Date: ${new Date(expense.date).toLocaleDateString()}
        Status: ${expense.status}
        --------------------
      `).join('')}
      
      Total: $${totalAmount.toLocaleString()}
    `;

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses_report_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleExpenseSelection = (expenseId: string) => {
    setSelectedExpenses(prev => 
      prev.includes(expenseId) 
        ? prev.filter(id => id !== expenseId)
        : [...prev, expenseId]
    );
  };

  const selectAllExpenses = () => {
    if (selectedExpenses.length === filteredExpenses.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(filteredExpenses.map(expense => expense.id));
    }
  };

  const openDeleteModal = (expense?: Expense) => {
    if (expense) {
      setExpenseToDelete(expense);
    }
    setShowDeleteModal(true);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
            <p className="text-gray-600 mt-1">Manage and track your expenses</p>
          </div>
          <div className="flex items-center gap-3 mt-4 lg:mt-0">
            <div className="relative group">
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button 
                  onClick={exportToCSV}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Export as CSV
                </button>
                <button 
                  onClick={exportToPDF}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Export as PDF
                </button>
              </div>
            </div>
            <Button 
              onClick={() => setShowAddModal(true)}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card padding="lg" hover={true}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">${totalAmount.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card padding="lg" hover={true}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {expenses.filter(e => e.status === 'Pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card padding="lg" hover={true}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ${expenses
                    .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
                    .reduce((sum, e) => sum + e.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 w-full md:w-64 text-sm"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-600">
              {filteredExpenses.length} of {expenses.length} expenses
              {selectedExpenses.length > 0 && ` • ${selectedExpenses.length} selected`}
            </div>
          </div>
        </Card>

        {/* Bulk Actions */}
        {selectedExpenses.length > 0 && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-900">
                  {selectedExpenses.length} expense(s) selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => openDeleteModal()}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setSelectedExpenses([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Expenses Table */}
        <Card padding="none">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first expense.</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                      <input
                        type="checkbox"
                        checked={selectedExpenses.length === filteredExpenses.length}
                        onChange={selectAllExpenses}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Expense</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Category</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Amount</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedExpenses.includes(expense.id)}
                          onChange={() => toggleExpenseSelection(expense.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{expense.title}</p>
                          <p className="text-sm text-gray-500 mt-1">{expense.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{expense.category}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-900">${expense.amount.toLocaleString()}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge status={getStatusColor(expense.status)}>
                          {expense.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openDeleteModal(expense)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Add Expense Modal */}
        <Modal
          open={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            reset();
          }}
          title="Add New Expense"
          size="md"
        >
          <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                {...register('title', { required: true })}
                placeholder="Enter expense title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                {...register('description')}
                placeholder="Enter expense description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  {...register('amount', { required: true, valueAsNumber: true })}
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  {...register('category', { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                >
                  <option value="">Select category</option>
                  {categories.filter(cat => cat !== 'All').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowAddModal(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                Add Expense
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          open={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setExpenseToDelete(null);
          }}
          title={expenseToDelete ? "Delete Expense" : "Delete Selected Expenses"}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              {expenseToDelete 
                ? `Are you sure you want to delete the expense "${expenseToDelete.title}"? This action cannot be undone.`
                : `Are you sure you want to delete ${selectedExpenses.length} selected expense(s)? This action cannot be undone.`
              }
            </p>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={() => expenseToDelete ? onDelete(expenseToDelete.id) : onBulkDelete()}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default ExpensesPage;