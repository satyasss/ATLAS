import React from 'react';
import './BrandLogo.css';

export default function BrandLogo({ variant = 'nav' }) {
  return (
    <span className={`brand-logo brand-logo--${variant}`} aria-label="Atlas Services">
      <span className="brand-logo-stage">
        <span className="brand-logo-surface">
          <span className="brand-logo-word">ATLAS</span>
          <span className="brand-logo-shine" aria-hidden="true" />
          <span className="brand-logo-reflection" aria-hidden="true">ATLAS</span>
        </span>
      </span>
      <span className="brand-logo-services">SERVICES</span>
    </span>
  );
}
