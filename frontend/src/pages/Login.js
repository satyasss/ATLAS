import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import './Login.css';

const emptySeller = {
  businessName: '',
  ownerName: '',
  mobile: '',
  email: '',
  password: '',
  otp: '',
  agree: false,
  documents: {
    aadhaar: null,
    businessProof: null,
  },
};

function makeOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function fileToData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      dataUrl: reader.result,
      uploadedAt: new Date().toISOString(),
    });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Login() {
  const [tab, setTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [sellerForm, setSellerForm] = useState(emptySeller);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, registerSeller, user } = useAuth();
  const navigate = useNavigate();

  const cleanSellerEmail = useMemo(() => sellerForm.email.trim().toLowerCase(), [sellerForm.email]);
  const cleanMobile = useMemo(() => sellerForm.mobile.replace(/\D/g, ''), [sellerForm.mobile]);

  if (user) {
    const target = user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/seller' : '/';
    return <Navigate to={target} replace />;
  }

  const updateSeller = (key, value) => {
    setSellerForm(prev => ({ ...prev, [key]: value }));
    if (key === 'email') {
      setOtpVerified(false);
      setOtpCode('');
    }
  };

  const updateDocument = async (key, file) => {
    setError('');
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setError('Please upload Aadhaar / document as JPG, PNG, WEBP or PDF.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Document size must be below 2MB so it can be saved safely in this local demo.');
      return;
    }
    try {
      const data = await fileToData(file);
      setSellerForm(prev => ({
        ...prev,
        documents: { ...prev.documents, [key]: data },
      }));
    } catch {
      setError('Could not read the selected document. Please try again.');
    }
  };

  const sendOtp = () => {
    setError('');
    setSuccess('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanSellerEmail)) {
      setError('Enter a valid seller email before sending OTP.');
      return;
    }
    if (!/^\d{10}$/.test(cleanMobile)) {
      setError('Enter a valid 10 digit mobile number before sending OTP.');
      return;
    }
    const code = makeOtp();
    setOtpCode(code);
    setOtpVerified(false);
    setSellerForm(prev => ({ ...prev, otp: '' }));
    setSuccess(`Email OTP generated for demo: ${code}. In live backend this should be sent to ${cleanSellerEmail}.`);
  };

  const verifyOtp = () => {
    setError('');
    setSuccess('');
    if (!otpCode) {
      setError('Please click Send OTP first.');
      return;
    }
    if (sellerForm.otp.trim() !== otpCode) {
      setError('Invalid OTP. Please check and enter the 6 digit code.');
      return;
    }
    setOtpVerified(true);
    setSuccess('Email OTP verified successfully.');
  };

  const resetRegister = () => {
    setSellerForm(emptySeller);
    setOtpCode('');
    setOtpVerified(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const result = login(loginEmail, loginPassword);
    setLoading(false);

    if (result.ok) {
      if (result.role === 'admin') navigate('/admin', { replace: true });
      else if (result.role === 'seller') navigate('/seller', { replace: true });
      else navigate('/', { replace: true });
    } else if (result.reason === 'pending') {
      setError('Your seller account is pending admin approval. Admin must verify your documents first.');
    } else if (result.reason === 'rejected') {
      setError(result.rejectReason ? `Your seller application was rejected: ${result.rejectReason}` : 'Your seller application was not approved.');
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!sellerForm.businessName.trim()) { setError('Please enter your business name.'); return; }
    if (!sellerForm.ownerName.trim()) { setError('Please enter owner name.'); return; }
    if (!/^\d{10}$/.test(cleanMobile)) { setError('Please enter a valid 10 digit mobile number.'); return; }
    if (!otpVerified) { setError('Please verify your email OTP before submitting.'); return; }
    if (sellerForm.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (!sellerForm.documents.aadhaar) { setError('Please upload Aadhaar document for fraud verification.'); return; }
    if (!sellerForm.agree) { setError('Please accept the seller verification declaration.'); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = registerSeller({
      businessName: sellerForm.businessName,
      ownerName: sellerForm.ownerName,
      mobile: cleanMobile,
      email: cleanSellerEmail,
      password: sellerForm.password,
      emailVerified: otpVerified,
      documents: sellerForm.documents,
    });
    setLoading(false);

    if (result.ok) {
      setSuccess('Application submitted. Admin can now view your Aadhaar/document and approve or reject your seller account.');
      resetRegister();
      setTab('login');
    } else if (result.reason === 'exists') {
      setError('An account with this email already exists.');
    } else if (result.reason === 'storage') {
      setError('Browser storage is full. Please upload smaller documents below 2MB and try again.');
    } else {
      setError('Registration failed. Please check all fields and try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-circle c1" />
        <div className="login-bg-circle c2" />
        <div className="login-bg-circle c3" />
      </div>

      <div className={`login-card ${tab === 'register' ? 'seller-register-card' : ''}`}>
        <div className="login-logo">
          <BrandLogo variant="login" />
        </div>

        <div className="login-tabs">
          <button type="button" className={tab === 'login' ? 'active' : ''} onClick={() => { setTab('login'); setError(''); setSuccess(''); }}>
            Sign In
          </button>
          <button type="button" className={tab === 'register' ? 'active' : ''} onClick={() => { setTab('register'); setError(''); setSuccess(''); }}>
            Seller Registration
          </button>
        </div>

        {tab === 'login' ? (
          <>
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to Atlas Services dashboard</p>

            {error && <div className="login-error"><span>⚠️</span> {error}</div>}
            {success && <div className="login-success"><span>✅</span> {success}</div>}

            <form onSubmit={handleLogin} className="login-form">
              <div className="login-field">
                <label>Email Address</label>
                <div className="input-wrap">
                  <span className="input-icon">✉️</span>
                  <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
                </div>
              </div>
              <div className="login-field">
                <label>Password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" />
                </div>
              </div>
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? <span className="login-spinner" /> : 'Sign In →'}
              </button>
            </form>

            <div className="login-hints">
              <p className="hint-title">Demo Credentials</p>
              <div className="hint-row"><div className="hint-badge admin">Admin</div><span>admin@atlas.com / admin123</span></div>
              <div className="hint-row"><div className="hint-badge user">User</div><span>user@atlas.com / user123</span></div>
              <div className="hint-row"><div className="hint-badge seller">Seller</div><span>Register → upload Aadhaar → admin approval</span></div>
            </div>
          </>
        ) : (
          <>
            <h1 className="login-title">Verified Seller Registration</h1>
            <p className="login-subtitle">Email OTP + mobile number + Aadhaar document verification</p>

            {error && <div className="login-error"><span>⚠️</span> {error}</div>}
            {success && <div className="login-success"><span>✅</span> {success}</div>}

            <form onSubmit={handleRegister} className="login-form seller-form">
              <div className="login-grid-2">
                <div className="login-field">
                  <label>Business Name</label>
                  <div className="input-wrap"><span className="input-icon">🏪</span><input type="text" required value={sellerForm.businessName} onChange={e => updateSeller('businessName', e.target.value)} placeholder="Ravi Agro Supplies" /></div>
                </div>
                <div className="login-field">
                  <label>Owner Name</label>
                  <div className="input-wrap"><span className="input-icon">👤</span><input type="text" required value={sellerForm.ownerName} onChange={e => updateSeller('ownerName', e.target.value)} placeholder="Owner full name" /></div>
                </div>
              </div>

              <div className="login-grid-2">
                <div className="login-field">
                  <label>Mobile Number</label>
                  <div className="input-wrap"><span className="input-icon">📱</span><input type="tel" required maxLength={10} value={sellerForm.mobile} onChange={e => updateSeller('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10 digit mobile" /></div>
                </div>
                <div className="login-field">
                  <label>Password</label>
                  <div className="input-wrap"><span className="input-icon">🔒</span><input type="password" required minLength={6} value={sellerForm.password} onChange={e => updateSeller('password', e.target.value)} placeholder="Min 6 characters" /></div>
                </div>
              </div>

              <div className="login-field">
                <label>Email ID + OTP</label>
                <div className="otp-row">
                  <div className="input-wrap otp-email"><span className="input-icon">✉️</span><input type="email" required value={sellerForm.email} onChange={e => updateSeller('email', e.target.value)} placeholder="you@business.com" /></div>
                  <button type="button" className="otp-btn" onClick={sendOtp}>Send OTP</button>
                </div>
              </div>

              <div className="otp-row">
                <div className="input-wrap otp-email"><span className="input-icon">🔐</span><input type="text" inputMode="numeric" maxLength={6} value={sellerForm.otp} onChange={e => updateSeller('otp', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6 digit OTP" /></div>
                <button type="button" className={`otp-btn ${otpVerified ? 'verified' : ''}`} onClick={verifyOtp}>{otpVerified ? 'Verified' : 'Verify OTP'}</button>
              </div>

              <div className="seller-docs">
                <div className="doc-upload">
                  <label htmlFor="aadhaarDoc">Aadhaar Document <span>*</span></label>
                  <input id="aadhaarDoc" type="file" accept="image/*,application/pdf" onChange={e => updateDocument('aadhaar', e.target.files?.[0])} />
                  <p>{sellerForm.documents.aadhaar ? `Selected: ${sellerForm.documents.aadhaar.name}` : 'Upload Aadhaar JPG/PNG/PDF below 2MB'}</p>
                </div>
                <div className="doc-upload">
                  <label htmlFor="businessProof">Business Proof / GST / PAN</label>
                  <input id="businessProof" type="file" accept="image/*,application/pdf" onChange={e => updateDocument('businessProof', e.target.files?.[0])} />
                  <p>{sellerForm.documents.businessProof ? `Selected: ${sellerForm.documents.businessProof.name}` : 'Optional but recommended'}</p>
                </div>
              </div>

              <label className="seller-declaration">
                <input type="checkbox" checked={sellerForm.agree} onChange={e => updateSeller('agree', e.target.checked)} />
                <span>I confirm these details and documents are correct. Admin can approve or reject after verification.</span>
              </label>

              <button type="submit" className="login-btn seller-btn" disabled={loading}>
                {loading ? <span className="login-spinner" /> : 'Submit Seller Application →'}
              </button>
            </form>

            <p className="register-note">
              After submission, seller login is locked until the admin opens Seller Applications, checks Aadhaar/documents and approves the account.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
