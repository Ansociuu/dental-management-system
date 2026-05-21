import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, getMe } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('mec_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('mec_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const res = await getMe();
          setUser(res.data);
          localStorage.setItem('mec_user', JSON.stringify(res.data));
        } catch (error) {
          console.error('Lỗi khi tải thông tin người dùng:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    if (res.success && res.token) {
      localStorage.setItem('mec_token', res.token);
      localStorage.setItem('mec_user', JSON.stringify(res.data));
      setToken(res.token);
      setUser(res.data);
      return res.data;
    } else {
      throw new Error(res.message || 'Đăng nhập không thành công');
    }
  };

  const logout = () => {
    localStorage.removeItem('mec_token');
    localStorage.removeItem('mec_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};
