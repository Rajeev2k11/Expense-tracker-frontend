import React from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import { CreditCard, Plus, MoreVertical } from 'lucide-react';

const Cards: React.FC = () => {
  const cards = [
    {
      id: 1,
      type: 'Corporate Card',
      number: '1234',
      balance: 12500,
      currency: 'USD',
      expiry: '12/25',
      holderName: 'John Doe',
      bank: 'ExpensePro Bank',
      gradient: 'from-blue-600 to-purple-600',
      status: 'Active'
    },
    {
      id: 2,
      type: 'Virtual Card',
      number: '5678',
      balance: 3500,
      currency: 'USD',
      expiry: '09/24',
      holderName: 'John Doe',
      bank: 'ExpensePro Bank',
      gradient: 'from-green-600 to-cyan-600',
      status: 'Active'
    },
    {
      id: 3,
      type: 'Travel Card',
      number: '9012',
      balance: 8000,
      currency: 'USD',
      expiry: '03/26',
      holderName: 'John Doe',
      bank: 'ExpensePro Bank',
      gradient: 'from-orange-500 to-red-500',
      status: 'Active'
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cards</h1>
            <p className="text-gray-600 mt-1">Manage your corporate cards</p>
          </div>
          <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <Plus className="w-5 h-5" />
            New Card
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {cards.map((card) => (
            <div key={card.id} className="relative group">
              {/* Credit Card */}
              <div className={`bg-gradient-to-r ${card.gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
                {/* Card Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-6 h-6" />
                    <span className="text-sm font-medium opacity-90">{card.type}</span>
                  </div>
                  <button className="opacity-80 hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Card Balance */}
                <div className="mb-6">
                  <p className="text-sm opacity-80 mb-1">Available Balance</p>
                  <p className="text-2xl font-bold">
                    {card.currency} {card.balance.toLocaleString()}
                  </p>
                </div>

                {/* Card Number */}
                <div className="mb-6">
                  <p className="text-sm opacity-80 mb-2">Card Number</p>
                  <div className="flex items-center gap-3 text-lg font-mono">
                    <span>••••</span>
                    <span>••••</span>
                    <span>••••</span>
                    <span>{card.number}</span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80 mb-1">Card Holder</p>
                    <p className="text-sm font-medium">{card.holderName}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-80 mb-1">Expires</p>
                    <p className="text-sm font-medium">{card.expiry}</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-8 bg-white bg-opacity-20 rounded-lg">
                    <span className="text-xs font-bold">{card.bank.split(' ')[0]}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between mt-4 px-2">
                <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  View Details
                </button>
                <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                  Freeze Card
                </button>
              </div>
            </div>
          ))}

          {/* Add New Card */}
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-gray-400 transition-colors group cursor-pointer">
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add New Card</h3>
              <p className="text-gray-600 text-sm">Create a new corporate or virtual card</p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <Card padding="lg" hover={false}>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Transactions</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Office Supplies Purchase</p>
                    <p className="text-sm text-gray-500">Today, 10:30 AM • Card ****1234</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">-$245.00</p>
                  <p className="text-sm text-green-600">Completed</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Cards;