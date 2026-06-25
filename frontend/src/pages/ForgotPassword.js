import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiErrorMessage, resetPassword, sendPasswordOtp } from '../services/api';
import './AuthFlow.css';

export default function ForgotPassword() {
  const [form, setForm] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const sendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await sendPasswordOtp(form.email.trim());
      setOtpSent(true);
      setMessage(response.data?.message || 'Password reset OTP sent.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send password reset OTP.'));
    } finally {
      setLoading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!otpSent) return setError('Send the reset OTP first.');
    if (form.newPassword.length < 8) return setError('Password must be at least 8 characters.');
    if (form.newPassword !== form.confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    try {
      await resetPassword({ email: form.email.trim(), otp: form.otp, newPassword: form.newPassword });
      navigate('/login', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not reset password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-flow-page">
      <div className="auth-flow-card">
        <span className="auth-flow-kicker">Account recovery</span>
        <h1>Reset your password</h1>
        <p className="auth-flow-intro">We will email a short-lived verification code to your registered address.</p>
        {error && <div className="auth-alert error">{error}</div>}
        {message && <div className="auth-alert success">{message}</div>}
        {otpSent && <div className="otp-banner"><div className="otp-banner-icon">🔐</div><div><strong>Reset code is on its way</strong><p>Enter the 6-digit code below and choose a fresh password.</p></div></div>}
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-field"><label>Registered email</label><div className="otp-compose"><input required type="email" value={form.email} onChange={e => update('email', e.target.value)} /><button type="button" className="auth-secondary" onClick={sendOtp} disabled={loading}>Send OTP</button></div></div>
          <div className="auth-field"><label>OTP</label><input required maxLength={6} inputMode="numeric" value={form.otp} onChange={e => update('otp', e.target.value.replace(/\D/g, '').slice(0, 6))} /></div>
          <div className="auth-grid">
            <div className="auth-field"><label>New password</label><input required type="password" minLength={8} value={form.newPassword} onChange={e => update('newPassword', e.target.value)} /></div>
            <div className="auth-field"><label>Confirm password</label><input required type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} /></div>
          </div>
          <button className="auth-primary" disabled={loading}>{loading ? 'Updating...' : 'Reset Password'}</button>
        </form>
        <p className="auth-foot"><Link to="/login">Back to sign in</Link></p>
      </div>
    </div>
  );
}
