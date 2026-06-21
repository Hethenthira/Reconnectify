import { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from storage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = useCallback(async (formData) => {
    setError(null);
    try {
      const response = await authAPI.register(formData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setUser(user);
      return user;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setUser(user);
      return user;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    try {
      const response = await userAPI.updateProfile(updates);
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Profile update failed';
      setError(message);
      throw new Error(message);
    }
  }, [user]);

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';
  const isAlumni = user?.role === 'alumni';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        isAuthenticated,
        isAdmin,
        isAlumni,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
