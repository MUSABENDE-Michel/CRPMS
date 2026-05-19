import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { authAPI } from '../api/apiClient';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (isMounted.current) {
        if (response.data.success) {
          setUser(response.data.data);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      if (isMounted.current) {
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - runs only once on mount

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
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};