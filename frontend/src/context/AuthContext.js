import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

// Hardcoded credentials
const ADMIN_EMAIL = 'admin@atlas.com';
const ADMIN_PASS  = 'admin123';
const USER_EMAIL  = 'user@atlas.com';
const USER_PASS   = 'user123';

// ─── Seller registry stored in localStorage ───────────────────────────────────
// Each entry: { email, password, name, status: 'pending'|'approved'|'rejected' }
function getSellers() {
  try { return JSON.parse(localStorage.getItem('atlas_sellers') || '[]'); } catch { return []; }
}
function saveSellers(list) {
  localStorage.setItem('atlas_sellers', JSON.stringify(list));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('atlas_user')); } catch { return null; }
  });

  // Force re-render when seller list changes
  const [sellerListVersion, setSellerListVersion] = useState(0);
  const refreshSellers = useCallback(() => setSellerListVersion(v => v + 1), []);

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
    // Check seller registry
    const sellers = getSellers();
    const seller = sellers.find(s => s.email === email && s.password === password);
    if (seller) {
      if (seller.status === 'approved') {
        const u = { email, role: 'seller', name: seller.name };
        setUser(u);
        localStorage.setItem('atlas_user', JSON.stringify(u));
        return { ok: true, role: 'seller' };
      }
      if (seller.status === 'pending') return { ok: false, reason: 'pending' };
      if (seller.status === 'rejected') return { ok: false, reason: 'rejected' };
    }
    return { ok: false };
  };

  const registerSeller = (name, email, password) => {
    const sellers = getSellers();
    if (sellers.find(s => s.email === email)) return { ok: false, reason: 'exists' };
    if (email === ADMIN_EMAIL || email === USER_EMAIL) return { ok: false, reason: 'exists' };
    sellers.push({ email, password, name, status: 'pending', createdAt: new Date().toISOString() });
    saveSellers(sellers);
    refreshSellers();
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('atlas_user');
  };

  // Admin functions
  const getPendingSellers = () => getSellers().filter(s => s.status === 'pending');
  const getAllSellers = () => getSellers();
  const approveSeller = (email) => {
    const list = getSellers().map(s => s.email === email ? { ...s, status: 'approved' } : s);
    saveSellers(list);
    refreshSellers();
  };
  const rejectSeller = (email) => {
    const list = getSellers().map(s => s.email === email ? { ...s, status: 'rejected' } : s);
    saveSellers(list);
    refreshSellers();
  };

  return (
    <AuthContext.Provider value={{
      user, login, logout, registerSeller,
      isAdmin: user?.role === 'admin',
      isSeller: user?.role === 'seller',
      isUser: user?.role === 'user',
      getPendingSellers, getAllSellers, approveSeller, rejectSeller,
      sellerListVersion,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
