import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main container">
        <div className="footer-brand">
          <div className="footer-logo">
            <svg viewBox="0 0 32 22" width="28" fill="none">
              <rect x="0" y="3" width="22" height="16" rx="2.5" fill="#fff" opacity="0.8"/>
              <rect x="22" y="7" width="10" height="12" rx="1.5" fill="#c7dcff" opacity="0.7"/>
              <rect x="0" y="3" width="22" height="4.5" rx="2" fill="#2e7de9"/>
              <circle cx="6" cy="21" r="2.5" fill="#fff" opacity="0.7"/>
              <circle cx="16" cy="21" r="2.5" fill="#fff" opacity="0.7"/>
              <circle cx="28" cy="21" r="2.5" fill="#fff" opacity="0.7"/>
            </svg>
            <span>ATLAS</span>
          </div>
          <p>Your trusted delivery and logistics partner for agriculture, aquaculture, electrical, industrial &amp; specialty supplies across 9 sectors.</p>
          <div className="footer-social">
            <a href="#" className="social-btn">📘</a>
            <a href="#" className="social-btn">📸</a>
            <a href="#" className="social-btn">💼</a>
            <a href="#" className="social-btn">🐦</a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/products">Products</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-col">
          <h4>Sectors</h4>
          <Link to="/products?sector=agri">🌾 Agriculture</Link>
          <Link to="/products?sector=aqua">🐟 Aquaculture</Link>
          <Link to="/products?sector=electrical">⚡ Electrical</Link>
          <Link to="/products?sector=electronics">📱 Electronics</Link>
          <Link to="/products?sector=mechanical">🔧 Mechanical</Link>
          <Link to="/products?sector=civil">🏗️ Civil</Link>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <div className="footer-contact-item">
            <span>📞</span>
            <span>+91 98765 43210</span>
          </div>
          <div className="footer-contact-item">
            <span>📧</span>
            <span>info@atlasdelivery.com</span>
          </div>
          <div className="footer-contact-item">
            <span>📍</span>
            <span>Hyderabad, Telangana, India</span>
          </div>
          <div className="footer-contact-item">
            <span>🟢</span>
            <span>WhatsApp: +91 98765 43210</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© 2025 Atlas Delivery Services. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
