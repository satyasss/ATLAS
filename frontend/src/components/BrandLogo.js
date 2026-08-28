import React from 'react';
import './BrandLogo.css';

export default function BrandLogo({ variant = 'nav' }) {
  return (
    <span className={`brand-logo brand-logo--${variant}`} aria-label="Atlas Services">
      <img src="/atlas-mark-peach-a-light.png" alt="Atlas" />
      <span className="brand-logo-subtitle" aria-hidden="true">SERVICES.in</span>
    </span>
  );
}
