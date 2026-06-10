import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const loc      = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const close = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-inner container">
        {/* Logo */}
        <Link to="/" className="nav-logo" onClick={close}>
          <div className="logo-icon">
            <svg viewBox="0 0 32 22" width="32" fill="none">
              <rect x="0" y="3" width="22" height="16" rx="2.5" fill="#fff" opacity="0.9"/>
              <rect x="22" y="7" width="10" height="12" rx="1.5" fill="#c7dcff"/>
              <rect x="22.5" y="8.5" width="7" height="6" rx="1" fill="#7ab4f5"/>
              <circle cx="6"  cy="20" r="3" fill="#fff"/>
              <circle cx="16" cy="20" r="3" fill="#fff"/>
              <circle cx="28" cy="20" r="3" fill="#fff"/>
              <rect x="0" y="3" width="22" height="4.5" rx="2" fill="#2e7de9"/>
            </svg>
          </div>
          <span className="logo-text">ATLAS</span>
          <span className="logo-sub">DELIVERY</span>
        </Link>

        {/* Desktop links */}
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {/* Backdrop for mobile */}
          <div className="nav-backdrop" onClick={close} />

          <div className="nav-links-inner">
            <Link to="/"         className={loc.pathname === '/' ? 'active' : ''}                           onClick={close}>Home</Link>
            <Link to="/services" className={loc.pathname === '/services' ? 'active' : ''}                   onClick={close}>Services</Link>
            <Link to="/products" className={loc.pathname.startsWith('/products') ? 'active' : ''}           onClick={close}>Products</Link>
            <Link to="/about"    className={loc.pathname === '/about' ? 'active' : ''}                      onClick={close}>About</Link>
            <Link to="/contact"  className={loc.pathname === '/contact' ? 'active' : ''}                    onClick={close}>Contact</Link>

            {isAdmin && (
              <Link to="/admin" className={`nav-admin ${loc.pathname === '/admin' ? 'admin-active' : ''}`}  onClick={close}>
                ⚙️ Admin
              </Link>
            )}

            {user ? (
              <div className="nav-user-wrap">
                <span className="nav-greeting">
                  {isAdmin ? '👑' : '👤'} {user.name}
                </span>
                <button className="nav-logout" onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <Link to="/login" className="nav-login-btn" onClick={close}>Login</Link>
            )}
          </div>
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
