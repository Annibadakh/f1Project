import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import "./App.css";
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Components from './pages/Components';
import ComponentDetail from './pages/ComponentDetail';
import Inventory from './pages/Inventory';
import Notifications from './pages/Notifications';

import LoadingSpinner from './components/LoadingSpinner';
import { ToastProvider } from './components/Toast'; // <-- Import ToastProvider, NOT Toaster

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

// Public route component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>  {/* <-- Wrap your app with ToastProvider */}
            <Router>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                <Routes>
                  <Route 
                    path="/login" 
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    } 
                  />
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Routes>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/components" element={<Components />} />
                            <Route path="/components/:id" element={<ComponentDetail />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="/" element={<Navigate to="/dashboard" />} />
                          </Routes>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
                {/* Remove <Toaster /> from here */}
              </div>
            </Router>
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
