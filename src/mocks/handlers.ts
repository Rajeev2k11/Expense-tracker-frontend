import { rest } from 'msw';
import { users, teams, expenses, transactions, dashboard } from './data';
import { v4 as uid } from 'uuid';

// Utilities for simple TOTP generation & verification (RFC 6238-ish) using Web Crypto
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function base32Decode(input) {
  // remove padding and non-base32 chars
  const clean = (input || '').toUpperCase().replace(/=+$/, '').replace(/[^A-Z2-7]/g, '');
  const bytes = [];
  let buffer = 0, bitsLeft = 0;
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean.charAt(i));
    if (val === -1) continue;
    buffer = (buffer << 5) | val;
    bitsLeft += 5;
    if (bitsLeft >= 8) {
      bytes.push((buffer >>> (bitsLeft - 8)) & 0xFF);
      bitsLeft -= 8;
    }
  }
  return new Uint8Array(bytes);
}

function generateBase32Secret(length = 16) {
  let s = '';
  for (let i = 0; i < length; i++) s += BASE32_ALPHABET[Math.floor(Math.random() * BASE32_ALPHABET.length)];
  return s;
}

async function computeTotp(secret, time = Date.now(), step = 30, digits = 6) {
  const key = base32Decode(secret);
  const counter = Math.floor(time / 1000 / step);
  // 8-byte big-endian
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  // set as BigUint
  view.setBigUint64(0, BigInt(counter));
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, buf));
  const offset = sig[sig.length - 1] & 0xf;
  const code = ((sig[offset] & 0x7f) << 24) | ((sig[offset + 1] & 0xff) << 16) | ((sig[offset + 2] & 0xff) << 8) | (sig[offset + 3] & 0xff);
  const otp = (code % (10 ** digits)).toString().padStart(digits, '0');
  return otp;
}

async function verifyTotp(secret, candidate) {
  // accept -1, 0, +1 windows
  const now = Date.now();
  for (let delta = -1; delta <= 1; delta++) {
    const t = now + delta * 30000;
    const expected = await computeTotp(secret, t);
    if (expected === candidate) return true;
  }
  return false;
}

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

    // Create a challengeId to be used for subsequent MFA selection/verification
    const challenge = Math.random().toString(36).substring(2, 15);
    user._lastMfaChallenge = challenge;

    return res(ctx.status(200), ctx.json({ message: 'Password set', challengeId: challenge }));
  }),

  rest.post('/api/v1/users/select-mfa-method', async (req, res, ctx) => {
    const body = await req.json();
    // Support both old (userId+method) and new (challengeId+mfaMethod) flows
    const { userId, method, challengeId, mfaMethod } = body;
    let user = null as any;
    if (userId) user = users.find((u) => u.id === userId) as any;
    else if (challengeId) user = users.find((u) => (u as any)._lastMfaChallenge === challengeId) as any;

    if (!user) return res(ctx.status(404), ctx.json({ message: 'User not found' }));

    // Normalize into internal 'authenticator' or 'passkey'
    const finalMethod = method || (mfaMethod === 'TOTP' ? 'authenticator' : mfaMethod === 'PASSKEY' ? 'passkey' : undefined);
    if (!finalMethod) return res(ctx.status(400), ctx.json({ message: 'Invalid method' }));

    user.mfaMethod = finalMethod;

    // If authenticator/TOTP, generate secret and a QR image (otpauth URL)
    if (finalMethod === 'authenticator') {
      const secret = generateBase32Secret(16);
      user.totpSecret = secret;
      const issuer = encodeURIComponent('Expense Tracker');
      const label = encodeURIComponent(user.email || user.fullName || 'user');
      const otpauth = `otpauth://totp/${issuer}:${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
      const qrImageUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(otpauth)}`;
      return res(ctx.status(200), ctx.json({ method: 'TOTP', secret: user.totpSecret, qrImageUrl, otpauthUrl: otpauth, challengeId: user._lastMfaChallenge }));
    }

    return res(ctx.status(200), ctx.json({ method: 'PASSKEY', challengeId: user._lastMfaChallenge }));
  }),

  rest.post('/api/v1/users/verify-mfa', async (req, res, ctx) => {
    const body = await req.json();
    // Accept both old and new payloads: { userId, method, code } or { challengeId, totpCode }
    const { userId, code, method, challengeId, totpCode } = body as any;
    let user = null as any;
    if (userId) user = users.find((u) => u.id === userId) as any;
    else if (challengeId) user = users.find((u) => (u as any)._lastMfaChallenge === challengeId) as any;

    if (!user) return res(ctx.status(404), ctx.json({ message: 'User not found' }));

    const finalCode = code || totpCode;
    const finalMethod = method || (user.mfaMethod || 'authenticator');

    if (finalMethod === 'authenticator') {
      try {
        const ok = await verifyTotp(user.totpSecret, finalCode);
        if (ok) {
          user.mfaVerified = true;
          return res(ctx.status(200), ctx.json({ verified: true }));
        }
        return res(ctx.status(400), ctx.json({ verified: false, message: 'Invalid code' }));
      } catch (e) {
        return res(ctx.status(500), ctx.json({ message: 'TOTP check failed' }));
      }
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
    const { email, role, team, name } = body;
    const id = uid();
    const invitedUser = {
      id,
      fullName: name || email.split('@')[0],
      email,
      role: role || 'Employee',
      team: team || '',
      token: `token-${id}`,
      invited: true,
      passwordSet: false,
      mfaMethod: null,
      mfaVerified: false,
      passkeys: [],
    };
    users.push(invitedUser as any);
    // Include token as query param on invite link so client can pick it up
    return res(ctx.status(201), ctx.json({ user: invitedUser, inviteLink: `/invite/${id}?token=${invitedUser.token}` }));
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
