import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiErrorMessage, registerUser, sendRegistrationOtp } from '../services/api';
import './AuthFlow.css';

const INITIAL = { name: '', mobile: '', email: '', password: '', confirmPassword: '', otp: '' };

export default function Register() {
  const [form, setForm] = useState(INITIAL);
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (key === 'email') setOtpSent(false);
  };

  const sendOtp = async () => {
    setError('');
    setMessage('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Enter a valid email address first.');
      return;
    }
    setLoading(true);
    try {
      const response = await sendRegistrationOtp(form.email.trim());
      setOtpSent(true);
      setMessage(response.data?.message || 'OTP sent. Check your email inbox.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send OTP.'));
    } finally {
      setLoading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!otpSent) return setError('Send the email OTP before registration.');
    if (!/^\d{10,15}$/.test(form.mobile.replace(/\D/g, ''))) return setError('Enter a valid mobile number.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (!/^\d{6}$/.test(form.otp)) return setError('Enter the 6 digit OTP from your email.');

    setLoading(true);
    try {
      await registerUser({
        name: form.name,
        mobile: form.mobile.replace(/\D/g, ''),
        email: form.email.trim(),
        password: form.password,
        otp: form.otp,
      });
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-flow-page">
      <div className="auth-flow-card">
        <span className="auth-flow-kicker">Customer registration</span>
        <h1>Create your Atlas account</h1>
        <p className="auth-flow-intro">Register once, verify your email securely, then add products to cart and place orders.</p>

        {error && <div className="auth-alert error">{error}</div>}
        {message && <div className="auth-alert success">{message}</div>}
        {otpSent && (
          <div className="otp-banner">
            <div className="otp-banner-icon">✉</div>
            <div><strong>Verification code sent</strong><p>We sent a 6-digit OTP to {form.email}. It expires in 10 minutes. Check spam if it is hiding there.</p></div>
          </div>
        )}

        <form className="auth-form" onSubmit={submit}>
          <div className="auth-grid">
            <div className="auth-field"><label>Full name</label><input required value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your full name" /></div>
            <div className="auth-field"><label>Mobile number</label><input required inputMode="tel" value={form.mobile} onChange={e => update('mobile', e.target.value.replace(/\D/g, '').slice(0, 15))} placeholder="10 digit mobile" /></div>
          </div>
          <div className="auth-field">
            <label>Email address</label>
            <div className="otp-compose">
              <input required type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" />
              <button type="button" className="auth-secondary" onClick={sendOtp} disabled={loading}>{otpSent ? 'Resend OTP' : 'Send OTP'}</button>
            </div>
          </div>
          <div className="auth-field"><label>Email OTP</label><input required inputMode="numeric" maxLength={6} value={form.otp} onChange={e => update('otp', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6 digit code" /></div>
          <div className="auth-grid">
            <div className="auth-field"><label>Password</label><input required type="password" minLength={8} value={form.password} onChange={e => update('password', e.target.value)} placeholder="Minimum 8 characters" /></div>
            <div className="auth-field"><label>Confirm password</label><input required type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} placeholder="Repeat password" /></div>
          </div>
          <button className="auth-primary" disabled={loading}>{loading ? 'Please wait...' : 'Verify OTP & Create Account'}</button>
        </form>
        <p className="auth-foot">Already registered? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
