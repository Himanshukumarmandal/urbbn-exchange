import React, { createContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('userToken');
      if (token) {
        try {
          const data = await api('/auth/me');
          setUser(data.user);
        } catch (error) {
          console.error('Auth init error:', error);
          localStorage.removeItem('userToken');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('userToken', data.token);
    setUser(data.user);
  };

  const signup = async (email, password) => {
    const data = await api('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('userToken', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    setUser(null);
  };

  if (loading) return <div className="text-center mt-6">Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
