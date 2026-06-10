import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Hardcoded credentials (no backend auth needed)
const ADMIN_EMAIL = 'admin@atlas.com';
const ADMIN_PASS  = 'admin123';
const USER_EMAIL  = 'user@atlas.com';
const USER_PASS   = 'user123';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('atlas_user')); } catch { return null; }
  });

  const login = (email, password) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      const u = { email, role: 'admin', name: 'Admin' };
      setUser(u);
      localStorage.setItem('atlas_user', JSON.stringify(u));
      return { ok: true, role: 'admin' };
    }
    if (email === USER_EMAIL && password === USER_PASS) {
      const u = { email, role: 'user', name: 'User' };
      setUser(u);
      localStorage.setItem('atlas_user', JSON.stringify(u));
      return { ok: true, role: 'user' };
    }
    return { ok: false };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('atlas_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
