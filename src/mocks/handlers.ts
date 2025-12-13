import { rest } from 'msw';
import { users, teams, expenses, transactions, dashboard } from './data';
import { v4 as uid } from 'uuid';

export const handlers = [
  // User management & MFA endpoints (v1)
  rest.post('/api/v1/users/register', async (req, res, ctx) => {
    const body = await req.json();
    const id = uid();
    const newUser = {
      id,
      fullName: body.fullName || body.email.split('@')[0],
      email: body.email,
      role: body.role || 'Employee',
      token: `token-${id}`,
      password: body.password || null,
      passwordSet: !!body.password,
      mfaMethod: null,
      mfaVerified: false,
      passkeys: [],
      invited: false,
    };
    users.push(newUser as any);
    return res(ctx.status(201), ctx.json({ user: newUser, token: newUser.token }));
  }),

  rest.post('/api/v1/users/setup-password', async (req, res, ctx) => {
    const body = await req.json();
    const { userId, password, token } = body;
    let user = null;
    if (userId) user = users.find((u) => u.id === userId) as any;
    else if (token) user = users.find((u) => u.token === token) as any;
    if (!user) return res(ctx.status(404), ctx.json({ message: 'User not found' }));
    user.password = password;
    user.passwordSet = true;
    return res(ctx.status(200), ctx.json({ message: 'Password set' }));
  }),

  rest.post('/api/v1/users/select-mfa-method', async (req, res, ctx) => {
    const body = await req.json();
    const { userId, method } = body;
    const user = users.find((u) => u.id === userId) as any;
    if (!user) return res(ctx.status(404), ctx.json({ message: 'User not found' }));
    user.mfaMethod = method;
    // If authenticator, return a mock secret for TOTP setup
    if (method === 'authenticator') {
      user.totpSecret = 'MOB7EMRTODRTUDG51EMF6J2ATKDTFES4';
      return res(ctx.status(200), ctx.json({ method, secret: user.totpSecret }));
    }
    return res(ctx.status(200), ctx.json({ method }));
  }),

  rest.post('/api/v1/users/verify-mfa', async (req, res, ctx) => {
    const body = await req.json();
    const { userId, code, method } = body;
    const user = users.find((u) => u.id === userId) as any;
    if (!user) return res(ctx.status(404), ctx.json({ message: 'User not found' }));
    // For demo accept 123456 as valid TOTP code
    if (method === 'authenticator') {
      if (code === '123456') {
        user.mfaVerified = true;
        return res(ctx.status(200), ctx.json({ verified: true }));
      }
      return res(ctx.status(400), ctx.json({ verified: false, message: 'Invalid code' }));
    }
    return res(ctx.status(400), ctx.json({ message: 'Unsupported method' }));
  }),

  rest.post('/api/v1/users/passkey-auth-options', async (req, res, ctx) => {
    const body = await req.json();
    const { userId, action } = body; // action: 'register' | 'authenticate'
    const user = users.find((u) => u.id === userId) as any;
    if (!user) return res(ctx.status(404), ctx.json({ message: 'User not found' }));
    const challenge = Math.random().toString(36).substring(2, 15);
    if (action === 'register') {
      const options = {
        challenge,
        rp: { name: 'Expense Tracker' },
        user: { id: user.id, name: user.email, displayName: user.fullName },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      };
      // store challenge so verify can check it
      user._lastPasskeyChallenge = challenge;
      return res(ctx.status(200), ctx.json(options));
    }
    if (action === 'authenticate') {
      const allow = (user.passkeys || []).map((p: any) => ({ id: p.id, type: 'public-key' }));
      const options = { challenge, allowCredentials: allow };
      user._lastPasskeyChallenge = challenge;
      return res(ctx.status(200), ctx.json(options));
    }
    return res(ctx.status(400), ctx.json({ message: 'Invalid action' }));
  }),

  rest.post('/api/v1/users/passkey-auth-verify', async (req, res, ctx) => {
    const body = await req.json();
    const { userId, action, credential } = body;
    const user = users.find((u) => u.id === userId) as any;
    if (!user) return res(ctx.status(404), ctx.json({ message: 'User not found' }));
    // For demo: accept any credential when registering and save its id
    if (action === 'register') {
      user.passkeys = user.passkeys || [];
      user.passkeys.push({ id: credential.id, attestation: credential });
      user.mfaVerified = true;
      return res(ctx.status(200), ctx.json({ verified: true }));
    }
    if (action === 'authenticate') {
      const found = (user.passkeys || []).find((p: any) => p.id === credential.id);
      if (found) {
        user.mfaVerified = true;
        return res(ctx.status(200), ctx.json({ verified: true, user, token: user.token }));
      }
      return res(ctx.status(400), ctx.json({ verified: false, message: 'Unknown credential' }));
    }
    return res(ctx.status(400), ctx.json({ message: 'Invalid action' }));
  }),

  rest.post('/api/v1/users/login', async (req, res, ctx) => {
    const body = await req.json();
    const { email, password } = body;
    const user = users.find((u) => u.email === email) as any;
    if (!user) return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }));
    // If password required
    if (user.passwordSet && user.password !== password) {
      return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }));
    }
    // If MFA required and not verified, instruct client to complete MFA
    if (user.mfaMethod && !user.mfaVerified) {
      return res(ctx.status(200), ctx.json({ mfaRequired: true, method: user.mfaMethod }));
    }
    return res(ctx.status(200), ctx.json({ user, token: user.token }));
  }),

  rest.get('/api/v1/users', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(users));
  }),

  rest.get('/api/v1/users/:id', (req, res, ctx) => {
    const { id } = req.params as { id: string };
    const user = users.find((u) => u.id === id) || null;
    if (!user) return res(ctx.status(404), ctx.json({ message: 'Not found' }));
    return res(ctx.status(200), ctx.json(user));
  }),

  rest.post('/api/v1/users/invite', async (req, res, ctx) => {
    const body = await req.json();
    const { email, role } = body;
    const id = uid();
    const invitedUser = {
      id,
      fullName: email.split('@')[0],
      email,
      role: role || 'Employee',
      token: `token-${id}`,
      invited: true,
      passwordSet: false,
      mfaMethod: null,
      mfaVerified: false,
      passkeys: [],
    };
    users.push(invitedUser as any);
    return res(ctx.status(201), ctx.json({ user: invitedUser, inviteLink: `/invite/${id}` }));
  }),

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
