import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

// Demo credentials for this local project
const ADMIN_EMAIL = 'admin@atlas.com';
const ADMIN_PASS = 'admin123';
const USER_EMAIL = 'user@atlas.com';
const USER_PASS = 'user123';

const SELLERS_KEY = 'atlas_sellers';
const USER_KEY = 'atlas_user';

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function getSellers() {
  return readJson(SELLERS_KEY, []);
}

function saveSellers(list) {
  try {
    localStorage.setItem(SELLERS_KEY, JSON.stringify(list));
    return true;
  } catch (error) {
    console.error('Unable to save sellers', error);
    return false;
  }
}

function normalizeEmail(email = '') {
  return email.trim().toLowerCase();
}

function makeSellerId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `seller_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readJson(USER_KEY, null));
  const [sellerListVersion, setSellerListVersion] = useState(0);

  const refreshSellers = useCallback(() => setSellerListVersion(v => v + 1), []);

  const login = (email, password) => {
    const cleanEmail = normalizeEmail(email);

    if (cleanEmail === ADMIN_EMAIL && password === ADMIN_PASS) {
      const u = { email: cleanEmail, role: 'admin', name: 'Admin' };
      setUser(u);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      return { ok: true, role: 'admin' };
    }

    if (cleanEmail === USER_EMAIL && password === USER_PASS) {
      const u = { email: cleanEmail, role: 'user', name: 'User' };
      setUser(u);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      return { ok: true, role: 'user' };
    }

    const seller = getSellers().find(s => normalizeEmail(s.email) === cleanEmail && s.password === password);
    if (seller) {
      if (seller.status === 'approved') {
        const u = {
          email: seller.email,
          role: 'seller',
          name: seller.businessName || seller.name,
          sellerId: seller.id,
          mobile: seller.mobile,
        };
        setUser(u);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        return { ok: true, role: 'seller' };
      }
      if (seller.status === 'pending') return { ok: false, reason: 'pending' };
      if (seller.status === 'rejected') return { ok: false, reason: 'rejected', rejectReason: seller.rejectReason };
    }

    return { ok: false };
  };

  const registerSeller = (payload) => {
    const cleanEmail = normalizeEmail(payload.email);
    const sellers = getSellers();

    if (!cleanEmail || !payload.password || !payload.businessName || !payload.mobile) {
      return { ok: false, reason: 'missing' };
    }
    if (cleanEmail === ADMIN_EMAIL || cleanEmail === USER_EMAIL || sellers.some(s => normalizeEmail(s.email) === cleanEmail)) {
      return { ok: false, reason: 'exists' };
    }
    if (!payload.emailVerified) return { ok: false, reason: 'otp' };
    if (!payload.documents?.aadhaar) return { ok: false, reason: 'aadhaar' };

    const now = new Date().toISOString();
    const seller = {
      id: makeSellerId(),
      name: payload.ownerName?.trim() || payload.businessName.trim(),
      businessName: payload.businessName.trim(),
      ownerName: payload.ownerName?.trim() || '',
      email: cleanEmail,
      mobile: payload.mobile.trim(),
      password: payload.password,
      status: 'pending',
      emailVerified: true,
      rejectReason: '',
      documents: payload.documents,
      createdAt: now,
      updatedAt: now,
    };

    const saved = saveSellers([...sellers, seller]);
    if (!saved) return { ok: false, reason: 'storage' };
    refreshSellers();
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  };

  const getPendingSellers = () => getSellers().filter(s => s.status === 'pending');
  const getAllSellers = () => getSellers();

  const approveSeller = (email) => {
    const cleanEmail = normalizeEmail(email);
    const list = getSellers().map(s => normalizeEmail(s.email) === cleanEmail
      ? { ...s, status: 'approved', rejectReason: '', updatedAt: new Date().toISOString() }
      : s
    );
    const saved = saveSellers(list);
    if (saved) refreshSellers();
    return saved;
  };

  const rejectSeller = (email, reason = 'Rejected by admin') => {
    const cleanEmail = normalizeEmail(email);
    const list = getSellers().map(s => normalizeEmail(s.email) === cleanEmail
      ? { ...s, status: 'rejected', rejectReason: reason, updatedAt: new Date().toISOString() }
      : s
    );
    const saved = saveSellers(list);
    if (saved) refreshSellers();
    return saved;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      registerSeller,
      isAdmin: user?.role === 'admin',
      isSeller: user?.role === 'seller',
      isUser: user?.role === 'user',
      getPendingSellers,
      getAllSellers,
      approveSeller,
      rejectSeller,
      sellerListVersion,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
