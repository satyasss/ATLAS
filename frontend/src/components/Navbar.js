import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import BrandLogo from './BrandLogo';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const loc      = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, isSeller } = useAuth();
  const { itemCount } = useCart();

  const close = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate('/login');
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    close();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : '/products');
  };

  return (
    <nav className="navbar">
      <div className="nav-inner container">
        {/* Logo */}
        <Link to="/" className="nav-logo" onClick={close}>
          <BrandLogo variant="nav" />
        </Link>

        {/* Desktop links */}
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <div className="nav-backdrop" onClick={close} />

          <div className="nav-links-inner">
            <Link to="/"         className={loc.pathname === '/' ? 'active' : ''}                         onClick={close}>Home</Link>
            <Link to="/products" className={loc.pathname.startsWith('/products') ? 'active' : ''}         onClick={close}>Categories</Link>
            <Link to="/services" className={loc.pathname === '/services' ? 'active' : ''}                 onClick={close}>Sellers</Link>
            <Link to="/about"    className={loc.pathname === '/about' ? 'active' : ''}                    onClick={close}>About Us</Link>
            <Link to="/contact"  className={`nav-contact-link ${loc.pathname === '/contact' ? 'active' : ''}`} onClick={close}>Contact</Link>

            <form className="nav-search" onSubmit={handleSearch}>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products, sectors, suppliers..."
                aria-label="Search products"
              />
              <button type="submit" aria-label="Search">⌕</button>
            </form>

            <Link to="/contact" className="nav-contact-btn" onClick={close}>📞 Contact Us</Link>
            <Link to="/cart" className={`nav-cart ${loc.pathname === '/cart' ? 'active' : ''}`} onClick={close}>
              Cart <span>{itemCount}</span>
            </Link>

            {isAdmin && (
              <Link to="/admin" className={`nav-admin ${loc.pathname === '/admin' ? 'admin-active' : ''}`} onClick={close}>
                ⚙️ Admin
              </Link>
            )}

            {isSeller && (
              <Link to="/seller" className={`nav-seller ${loc.pathname === '/seller' ? 'seller-active' : ''}`} onClick={close}>
                🏪 My Products
              </Link>
            )}

            {user ? (
              <div className="nav-user-wrap">
                <span className="nav-greeting">
                  {isAdmin ? '👑' : isSeller ? '🏪' : '👤'} {user.name}
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
