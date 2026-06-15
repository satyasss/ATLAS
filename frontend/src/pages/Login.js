import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import './Login.css';

export default function Login() {
  const [tab, setTab]           = useState('login'); // 'login' | 'register'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);
  const { login, registerSeller, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    if (user.role === 'admin')  navigate('/admin',  { replace: true });
    else if (user.role === 'seller') navigate('/seller', { replace: true });
    else navigate('/', { replace: true });
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = login(email.trim(), password);
    setLoading(false);
    if (result.ok) {
      if (result.role === 'admin')  navigate('/admin',  { replace: true });
      else if (result.role === 'seller') navigate('/seller', { replace: true });
      else navigate('/', { replace: true });
    } else if (result.reason === 'pending') {
      setError('Your seller account is pending admin approval. Please check back soon.');
    } else if (result.reason === 'rejected') {
      setError('Your seller application was not approved. Contact admin@atlas.com for details.');
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!name.trim()) { setError('Please enter your business name.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = registerSeller(name.trim(), email.trim(), password);
    setLoading(false);
    if (result.ok) {
      setSuccess('✅ Application submitted! Admin will review and approve your account.');
      setName(''); setEmail(''); setPassword('');
    } else if (result.reason === 'exists') {
      setError('An account with this email already exists.');
    } else {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-circle c1" />
        <div className="login-bg-circle c2" />
        <div className="login-bg-circle c3" />
      </div>

      <div className="login-card">
        <div className="login-logo">
          <BrandLogo variant="login" />
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button className={tab === 'login' ? 'active' : ''} onClick={() => { setTab('login'); setError(''); setSuccess(''); }}>
            Sign In
          </button>
          <button className={tab === 'register' ? 'active' : ''} onClick={() => { setTab('register'); setError(''); setSuccess(''); }}>
            Seller Registration
          </button>
        </div>

        {tab === 'login' ? (
          <>
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to your Atlas Services account</p>

            {error && <div className="login-error"><span>⚠️</span> {error}</div>}

            <form onSubmit={handleLogin} className="login-form">
              <div className="login-field">
                <label>Email Address</label>
                <div className="input-wrap">
                  <span className="input-icon">✉️</span>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
                </div>
              </div>
              <div className="login-field">
                <label>Password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" />
                </div>
              </div>
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? <span className="login-spinner" /> : 'Sign In →'}
              </button>
            </form>

            <div className="login-hints">
              <p className="hint-title">Demo Credentials</p>
              <div className="hint-row">
                <div className="hint-badge admin">Admin</div>
                <span>admin@atlas.com / admin123</span>
              </div>
              <div className="hint-row">
                <div className="hint-badge user">User</div>
                <span>user@atlas.com / user123</span>
              </div>
              <div className="hint-row">
                <div className="hint-badge seller">Seller</div>
                <span>Register above → Admin approval required</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="login-title">Become a Seller</h1>
            <p className="login-subtitle">Register to list your products on Atlas Services</p>

            {error   && <div className="login-error"><span>⚠️</span> {error}</div>}
            {success && <div className="login-success"><span>✅</span> {success}</div>}

            <form onSubmit={handleRegister} className="login-form">
              <div className="login-field">
                <label>Business / Your Name</label>
                <div className="input-wrap">
                  <span className="input-icon">🏪</span>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ravi Agro Supplies" />
                </div>
              </div>
              <div className="login-field">
                <label>Email Address</label>
                <div className="input-wrap">
                  <span className="input-icon">✉️</span>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@business.com" />
                </div>
              </div>
              <div className="login-field">
                <label>Password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password (min 6 chars)" />
                </div>
              </div>
              <button type="submit" className="login-btn seller-btn" disabled={loading}>
                {loading ? <span className="login-spinner" /> : 'Submit Application →'}
              </button>
            </form>

            <p className="register-note">
              🔍 Your application will be reviewed by an admin. Once approved, you can log in and start listing products immediately.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
