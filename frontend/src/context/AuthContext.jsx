import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null);

  useEffect(() => {
    // Check for existing token and user data on app load
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('auth_user');
    
    if (token && userData) {
      setAuthToken(token);
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setAuthToken(token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    localStorage.setItem('auth_token', token);
  };

  const staffLogin = (userData, token) => {
    setUser(userData);
    setAuthToken(token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    localStorage.setItem('auth_token', token);
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    setRedirectAfterLogin(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  };

  const setRedirectPath = (path) => {
    setRedirectAfterLogin(path);
  };

  const clearRedirectPath = () => {
    setRedirectAfterLogin(null);
  };

  const value = {
    user,
    login,
    staffLogin,
    logout,
    loading,
    isAuthenticated: !!user,
    redirectAfterLogin,
    setRedirectPath,
    clearRedirectPath
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
