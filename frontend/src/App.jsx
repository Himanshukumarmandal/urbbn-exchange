import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { AdminAuthProvider, AdminAuthContext } from './context/AdminAuthContext';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Deposit from './pages/Deposit';
import Profile from './pages/Profile';
import Withdraw from './pages/Withdraw';
import Exchange from './pages/Exchange';
import BottomNav from './components/BottomNav';

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const UserProtectedRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  
  if (!user) return <Navigate to="/login" />;
  
  return (
    <>
      <div className="main-content">
        {children}
      </div>
      <BottomNav />
    </>
  );
};

const AdminProtectedRoute = ({ children }) => {
  const { adminUser } = React.useContext(AdminAuthContext);
  
  if (!adminUser) return <Navigate to="/admin/login" />;
  
  return (
    <div className="main-content">
      {children}
    </div>
  );
};

function App() {
  return (
    <AdminAuthProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* User Routes */}
            <Route path="/login" element={<div className="main-content"><Login /></div>} />
            <Route path="/signup" element={<div className="main-content"><Signup /></div>} />
            <Route 
              path="/dashboard" 
              element={<UserProtectedRoute><Dashboard /></UserProtectedRoute>} 
            />
            {/* Redirect root and unknown routes to dashboard for convenience */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
            <Route 
              path="/deposit" 
              element={<UserProtectedRoute><Deposit /></UserProtectedRoute>} 
            />
            <Route 
              path="/profile" 
              element={<UserProtectedRoute><Profile /></UserProtectedRoute>} 
            />
            <Route 
              path="/withdraw" 
              element={<UserProtectedRoute><Withdraw /></UserProtectedRoute>} 
            />
            <Route 
              path="/exchange" 
              element={<UserProtectedRoute><Exchange /></UserProtectedRoute>} 
            />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard" 
              element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} 
            />
            {/* Redirect /admin to /admin/dashboard */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AdminAuthProvider>
  );
}

export default App;
