import React, { createContext, useContext, useState } from 'react';
import {
  getAllSellers as getAllSellersApi,
  loginUser,
  registerSellerApi,
  sendSellerOtp,
  updateSellerStatus,
} from '../services/api';

const AuthContext = createContext(null);
const USER_KEY = 'atlas_user';

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);
  const [sellerListVersion, setSellerListVersion] = useState(0);

  const login = async (email, password) => {
    try {
      const response = await loginUser({ email: email.trim().toLowerCase(), password });
      const session = response.data;
      setUser(session);
      localStorage.setItem(USER_KEY, JSON.stringify(session));
      return { ok: true, role: session.role };
    } catch (error) {
      return {
        ok: false,
        reason: error?.response?.status === 403 ? 'approval' : 'invalid',
        message: error?.response?.data?.message || error?.response?.data?.error || 'Invalid email or password.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  };

  const sendSellerRegistrationOtp = async (email) => {
    const response = await sendSellerOtp(email);
    return response.data;
  };

  const registerSeller = async (payload) => {
    const response = await registerSellerApi({
      businessName: payload.businessName,
      ownerName: payload.ownerName,
      mobile: payload.mobile,
      email: payload.email,
      password: payload.password,
      otp: payload.otp,
      aadhaarName: payload.documents?.aadhaar?.name || '',
      aadhaarDataUrl: payload.documents?.aadhaar?.dataUrl || '',
      businessProofName: payload.documents?.businessProof?.name || '',
      businessProofDataUrl: payload.documents?.businessProof?.dataUrl || '',
    });
    return response.data;
  };

  const getAllSellers = async () => (await getAllSellersApi()).data || [];

  const approveSeller = async (id) => {
    await updateSellerStatus(id, 'approved');
    setSellerListVersion(v => v + 1);
  };

  const rejectSeller = async (id, reason = 'Rejected by admin') => {
    await updateSellerStatus(id, 'rejected', reason);
    setSellerListVersion(v => v + 1);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      registerSeller,
      sendSellerRegistrationOtp,
      isAdmin: user?.role === 'admin',
      isSeller: user?.role === 'seller',
      isUser: user?.role === 'user',
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
