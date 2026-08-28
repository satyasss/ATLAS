import React from 'react';
import './BrandLogo.css';

export default function BrandLogo({ variant = 'nav' }) {
  return (
    <span className={`brand-logo brand-logo--${variant}`}>
      <img src="/at.jpeg" alt="Atlas" />
      <span className="brand-logo-subtitle">SERVICES.in</span>
    </span>
  );
}
