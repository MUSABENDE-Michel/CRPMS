import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/apiClient';

// Create context
export const AuthContext = createContext(null);

// Export the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.data.success) {
        setUser(response.data.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (username, password) => {
    const response = await authAPI.login({ username, password });
    if (response.data.success) {
      setUser(response.data.data);
      setIsAuthenticated(true);
      return response.data;
    }
    throw new Error(response.data.message || 'Login failed');
  }, []);

  const register = useCallback(async (username, password, confirmPassword, securityQuestion, securityAnswer) => {
    const response = await authAPI.register({
      username,
      password,
      confirmPassword,
      securityQuestion,
      securityAnswer,
    });
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || 'Registration failed');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const value = {
    user,
    setUser,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};