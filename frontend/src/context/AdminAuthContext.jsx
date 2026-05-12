import React, { createContext, useState, useEffect } from 'react';
import { adminApi } from '../utils/adminApi';

export const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          const data = await adminApi('/auth/me');
          if (data.user.role === 'admin') {
            setAdminUser(data.user);
          } else {
            localStorage.removeItem('adminToken');
          }
        } catch (error) {
          console.error('Admin Auth init error:', error);
          localStorage.removeItem('adminToken');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const adminLogin = async (email, password) => {
    const data = await adminApi('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('adminToken', data.token);
    setAdminUser(data.user);
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminUser(null);
  };

  if (loading) return <div className="text-center mt-6">Loading...</div>;

  return (
    <AdminAuthContext.Provider value={{ adminUser, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
