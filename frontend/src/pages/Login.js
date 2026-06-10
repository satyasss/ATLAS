import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login, user }         = useAuth();
  const navigate                = useNavigate();

  // Already logged in? redirect
  if (user) {
    if (user.role === 'admin') navigate('/admin', { replace: true });
    else navigate('/', { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 500)); // small UX delay
    const result = login(email.trim(), password);
    setLoading(false);
    if (result.ok) {
      if (result.role === 'admin') navigate('/admin', { replace: true });
      else navigate('/', { replace: true });
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="login-page">
      {/* Decorative background */}
      <div className="login-bg">
        <div className="login-bg-circle c1" />
        <div className="login-bg-circle c2" />
        <div className="login-bg-circle c3" />
      </div>

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg viewBox="0 0 40 28" width="48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="4" width="28" height="20" rx="3" fill="#fff" opacity="0.9"/>
              <rect x="28" y="9" width="12" height="15" rx="2" fill="#e8f0fe"/>
              <rect x="29" y="11" width="9" height="8" rx="1.5" fill="#7ab4f5"/>
              <circle cx="8" cy="26" r="3.5" fill="#1a3a7a"/>
              <circle cx="20" cy="26" r="3.5" fill="#1a3a7a"/>
              <circle cx="36" cy="26" r="3.5" fill="#1a3a7a"/>
              <rect x="0" y="4" width="28" height="5" rx="2" fill="#1a5abf"/>
            </svg>
          </div>
          <span className="login-logo-text">ATLAS</span>
        </div>

        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to your Atlas account</p>

        {error && (
          <div className="login-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label>Email Address</label>
            <div className="input-wrap">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="login-field">
            <label>Password</label>
            <div className="input-wrap">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="login-spinner" />
            ) : (
              'Sign In →'
            )}
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
        </div>
      </div>
    </div>
  );
}
