import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import Expenses from './pages/Expenses/Expenses';
import Team from './pages/Team/Team';
import Reports from './pages/Reports/Reports';
import Cards from './pages/Cards/Cards';
import Settings from './pages/Settings/Settings';
import ProfilePage from './pages/Profile/ProfilePage';
import SetPassword from './pages/SetupPassword/SetPassword';
import MFASetup from './pages/MFA/MFASetup.tsx';
import AuthenticatorSetup from './pages/MFA/AuthenticatorSetup.tsx';
import VerifyMFA from './pages/MFA/VerifyMFA.tsx';
import MFASuccess from './pages/MFA/MFASuccess.tsx';
import ProtectedRoute from './components/layout/ProtectedRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/mfa/verify-code" element={<VerifyMFA />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/set-password" element={<ProtectedRoute><SetPassword /></ProtectedRoute>} />
          <Route path="/mfa/setup" element={<ProtectedRoute><MFASetup /></ProtectedRoute>} />
          <Route path="/mfa/authenticator-setup" element={<ProtectedRoute><AuthenticatorSetup /></ProtectedRoute>} />
          <Route path="/mfa/success" element={<ProtectedRoute><MFASuccess /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;