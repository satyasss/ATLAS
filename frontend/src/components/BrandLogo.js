import React from 'react';
import './BrandLogo.css';

export default function BrandLogo({ variant = 'nav' }) {
  return (
    <span className={`brand-logo brand-logo--${variant}`} aria-label="Atlas Services">
      <img src="/atlas-logo.png" alt="Atlas Services" />
    </span>
  );
}
