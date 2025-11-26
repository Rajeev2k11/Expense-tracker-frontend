import { rest } from 'msw';
import { users, teams, expenses, transactions, dashboard } from './data';
import { v4 as uid } from 'uuid';

export const handlers = [
  rest.post('/api/auth/signup', async (req, res, ctx) => {
    const body = await req.json();
    const id = uid();
    const newUser = { id, ...body, token: `token-${id}` };
    users.push(newUser);
    return res(ctx.status(201), ctx.json({ user: newUser, token: newUser.token }));
  }),

  rest.post('/api/auth/login', async (req, res, ctx) => {
    const { email } = await req.json();
    const user = users.find((u) => u.email === email) || users[0];
    return res(ctx.status(200), ctx.json({ user, token: user.token }));
  }),

  rest.get('/api/auth/me', (req, res, ctx) => {
    const auth = req.headers.get('authorization') || '';
    const token = auth.replace('Bearer ', '');
    const user = users.find((u) => u.token === token) || null;
    if (!user) return res(ctx.status(401), ctx.json({ message: 'Not authenticated' }));
    return res(ctx.status(200), ctx.json({ user }));
  }),

  rest.get('/api/dashboard/stats', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(dashboard.stats));
  }),

  rest.get('/api/dashboard/spending', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(dashboard.spending));
  }),

  rest.get('/api/dashboard/categories', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(dashboard.categories));
  }),

  rest.get('/api/transactions', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(transactions));
  }),

  rest.get('/api/teams', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(teams));
  }),

  rest.get('/api/expenses', (req, res, ctx) => {
    const url = new URL(req.url.toString());
    const category = url.searchParams.get('category');
    const member = url.searchParams.get('member');
    let list = expenses.slice();
    if (category) list = list.filter((e) => e.category === category);
    if (member) list = list.filter((e) => e.userId === member);
    return res(ctx.status(200), ctx.json(list));
  }),

  rest.post('/api/expenses', async (req, res, ctx) => {
    const body = await req.json();
    const newE = { id: uid(), ...body };
    expenses.unshift(newE);
    return res(ctx.status(201), ctx.json(newE));
  }),

  rest.patch('/api/expenses/:id', async (req, res, ctx) => {
    const { id } = req.params as { id: string };
    const body = await req.json();
    const idx = expenses.findIndex((e) => e.id === id);
    if (idx === -1) return res(ctx.status(404));
    expenses[idx] = { ...expenses[idx], ...body };
    return res(ctx.status(200), ctx.json(expenses[idx]));
  }),

  rest.delete('/api/expenses/:id', (req, res, ctx) => {
    const { id } = req.params as { id: string };
    const idx = expenses.findIndex((e) => e.id === id);
    if (idx === -1) return res(ctx.status(404));
    expenses.splice(idx, 1);
    return res(ctx.status(204));
  }),
];
