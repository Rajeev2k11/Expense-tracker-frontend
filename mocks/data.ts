import { v4 as uid } from 'uuid';

const users = [
  {
    id: uid(),
    fullName: 'Alice Johnson',
    email: 'alice@company.com',
    role: 'CEO',
    token: 'token-alice',
    avatar: '',
  },
  {
    id: uid(),
    fullName: 'Bob Smith',
    email: 'bob@company.com',
    role: 'Developer',
    token: 'token-bob',
    avatar: '',
  },
  {
    id: uid(),
    fullName: 'Clara Green',
    email: 'clara@company.com',
    role: 'Marketing',
    token: 'token-clara',
    avatar: '',
  },
];

const teams = [
  {
    id: 'team-marketing',
    name: 'Marketing',
    color: '#F97316',
    members: [users[2]],
    activeCount: 3,
  },
  {
    id: 'team-engineering',
    name: 'Engineering',
    color: '#2563EB',
    members: [users[1]],
    activeCount: 5,
  },
  {
    id: 'team-design',
    name: 'Design',
    color: '#A78BFA',
    members: [],
    activeCount: 2,
  },
  {
    id: 'team-sales',
    name: 'Sales',
    color: '#10B981',
    members: [],
    activeCount: 4,
  },
];

const expenses = Array.from({ length: 12 }).map((_, i) => ({
  id: uid(),
  title: ['Ad Campaign', 'Client Dinner', 'Flight to NYC', 'Office Supplies'][i % 4],
  amount: Math.round(Math.random() * 2000 + 50),
  date: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString(),
  category: ['Marketing', 'Meals', 'Travel', 'Other'][i % 4],
  userId: users[i % users.length].id,
  userName: users[i % users.length].fullName,
  status: i % 3 === 0 ? 'Approved' : i % 3 === 1 ? 'Pending' : 'Rejected',
  notes: 'Mock expense item',
}));

const transactions = expenses.slice(0, 8).map((e) => ({
  id: e.id,
  icon: undefined,
  title: e.title,
  userName: e.userName,
  date: e.date,
  status: e.status,
  amount: e.amount,
}));

const dashboard = {
  stats: {
    totalSpent: expenses.reduce((s, e) => s + e.amount, 0),
    budgetLeft: 50000 - expenses.reduce((s, e) => s + e.amount, 0),
    pendingApprovals: expenses.filter((e) => e.status === 'Pending').length,
    activeUsers: 23,
  },
  spending: Array.from({ length: 12 }).map((_, i) => ({
    date: new Date(Date.now() - (11 - i) * 1000 * 60 * 60 * 24).toISOString().slice(0, 10),
    value: Math.round(Math.random() * 5000 + 200),
  })),
  categories: [
    { name: 'Marketing', value: 35 },
    { name: 'Meals', value: 20 },
    { name: 'Travel', value: 30 },
    { name: 'Other', value: 15 },
  ],
};

export { users, teams, expenses, transactions, dashboard };
