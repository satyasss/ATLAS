import React from 'react';
import './BrandLogo.css';

export default function BrandLogo({ variant = 'nav' }) {
  const logoSource = variant === 'footer' ? '/atlas-logo-transparent.png' : '/at.jpeg';

  return (
    <span className={`brand-logo brand-logo--${variant}`} aria-label="Atlas Services">
      <img src={logoSource} alt="Atlas Services" />
    </span>
  );
}
