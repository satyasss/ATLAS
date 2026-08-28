import React from 'react';
import './BrandLogo.css';

export default function BrandLogo({ variant = 'nav' }) {
  const logoSrc = variant === 'footer' ? '/atlas-mark-peach.png' : '/at.jpeg';

  return (
    <span className={`brand-logo brand-logo--${variant}`}>
      <img src={logoSrc} alt="Atlas" />
      <span className="brand-logo-subtitle">SERVICES.in</span>
    </span>
  );
}
