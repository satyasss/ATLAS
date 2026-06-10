import React from 'react';
import './About.css';

export default function About() {
  return (
    <div className="about-page">
      <div className="about-header">
        <div className="container">
          <h1>About Atlas</h1>
          <p>Fast & Reliable Delivery Services for Your Business</p>
        </div>
      </div>

      <div className="about-body container">
        <div className="about-intro">
          <div className="about-text">
            <h2>Your Trusted Delivery Partner</h2>
            <p>Atlas Delivery Services has been serving businesses across agriculture, aquaculture, electrical, and industrial sectors. We understand that timely delivery of the right products is critical to your operations.</p>
            <p>From irrigation equipment to biotech lab supplies, from construction materials to food products — we deliver it all with speed, care, and reliability.</p>
          </div>
          <div className="about-img">
            <img src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&q=80" alt="delivery" />
          </div>
        </div>

        <div className="about-stats">
          {[
            { num: '9+', label: 'Sectors Served' },
            { num: '500+', label: 'Products Available' },
            { num: '1000+', label: 'Happy Customers' },
            { num: '24h', label: 'Delivery Turnaround' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <span className="stat-num">{s.num}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="about-values">
          <h2>Why Choose Atlas?</h2>
          <div className="values-grid">
            {[
              { icon: '🚀', title: 'Fast Delivery', desc: 'Same-day and next-day delivery options available across all sectors.' },
              { icon: '✅', title: 'Quality Assured', desc: 'All products sourced from verified suppliers with quality certification.' },
              { icon: '💰', title: 'Competitive Pricing', desc: 'Best prices on bulk orders with volume discounts for regular customers.' },
              { icon: '🛡️', title: 'Reliable Support', desc: '24/7 customer support via phone, WhatsApp, and email.' },
            ].map((v, i) => (
              <div key={i} className="value-card">
                <span>{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
