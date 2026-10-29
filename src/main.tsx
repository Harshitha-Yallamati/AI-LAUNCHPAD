import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.css';
import { AdminLayout } from './components/Layout';
import { ToastContainer } from './components/ui';
import { useStore } from './lib/store';
import LandingPage from './pages/LandingPage';
import RegistrationSuccess from './pages/RegistrationSuccess';
import Dashboard from './pages/Dashboard';
import Registrations from './pages/Registrations';
import Ambassadors from './pages/Ambassadors';
import Analytics from './pages/Analytics';
import Budget from './pages/Budget';
import Settings from './pages/Settings';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/registration-success" element={<RegistrationSuccess />} />
      <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
      <Route path="/registrations" element={<AdminRoute><Registrations /></AdminRoute>} />
      <Route path="/ambassadors" element={<AdminRoute><Ambassadors /></AdminRoute>} />
      <Route path="/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
      <Route path="/budget" element={<AdminRoute><Budget /></AdminRoute>} />
      <Route path="/settings" element={<AdminRoute><Settings /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter><App /></BrowserRouter>
    <ToastContainer />
  </React.StrictMode>,
);
