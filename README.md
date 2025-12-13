# ExpensesFlow — Frontend (dev)

Quickstarter frontend built with React + Vite + TypeScript.

What I added so far
- Project dependencies updated in `package.json` (routing, axios, recharts, forms, zod, MSW, etc.)
- MSW mocks in `src/mocks` with realistic endpoints
- `AuthContext` (login/signup/logout, localStorage)
- Core layout: `Sidebar`, `Topbar`, `Layout`, protected routes
- Pages: `Dashboard`, `Expenses`, `Team`, `Reports`, `Cards`, `Settings`, `Auth` (login/signup)
- Basic Recharts line + donut components

Run (Windows PowerShell)
```powershell
npm install
npm run dev
```

Passkey & MFA flows (local dev)
--------------------------------
This project includes MSW mock endpoints for a production-like MFA/passkey flow. Useful endpoints (mocked) are:

- POST /api/v1/users/register
- POST /api/v1/users/setup-password
- POST /api/v1/users/select-mfa-method
- POST /api/v1/users/verify-mfa
- POST /api/v1/users/passkey-auth-options
- POST /api/v1/users/passkey-auth-verify
- POST /api/v1/users/login
- GET  /api/v1/users
- GET  /api/v1/users/{id}
- POST /api/v1/users/invite

How to test locally:

1. Start dev server

```powershell
npm install
npm run dev
```

Note: If you change `.env` (for example to set `VITE_API_BASE_URL`), restart the dev server so Vite picks up the new environment variables.

2. Signup a user and you will be redirected to `Set Password` to create a password.
3. After setting password you will be taken to `MFA Setup` where you can choose `Authenticator App` (enter code `123456` to verify) or `Passkey` which will use the browser's WebAuthn prompt.
4. Login: if the user has MFA enabled the login response will indicate `mfaRequired` — the UI redirects you to the right flow (code or passkey auth).

Notes:
- The MSW mocks are a development convenience and purposely simplify cryptographic verification. For production you must perform server-side attestation/assertion validation (e.g., using `@simplewebauthn/server`) and store credential public keys and counters.
- The passkey flows use `@simplewebauthn/browser` to trigger the browser prompt. Make sure you run the app via `https` or `localhost` as required by WebAuthn.

Notes & next steps
- MSW starts automatically in dev mode. Ensure `import.meta.env.DEV` is true for local run.
- I still need to finish: expense edit modal, filters & sorting, recent transactions list, team activity feed, mobile sidebar behavior, polish styles to exactly match the screenshot.

If you want, I'll continue and implement the remaining features now (full CRUD UI for expenses, role-based dashboard variants, activity feed, mobile responsiveness and polish). Say "Continue" and I'll proceed to the next set of tasks.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
