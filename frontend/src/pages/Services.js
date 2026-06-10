import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Services.css';

const SERVICES = [
  { icon: '🌾', title: 'Agriculture Delivery', desc: 'We deliver farm machinery, seeds, fertilizers, irrigation equipment, and all agri-inputs directly to your farm or warehouse.', color: '#16a34a' },
  { icon: '🐟', title: 'Aquaculture Supplies', desc: 'Fish feed, aerators, nets, water quality testing kits, and all aquaculture inputs delivered to your ponds and hatcheries.', color: '#0284c7' },
  { icon: '⚡', title: 'Electrical Services', desc: 'MCBs, cables, distribution boxes, lighting, and all electrical materials delivered for your projects.', color: '#ea580c' },
  { icon: '📱', title: 'Electronics', desc: 'Microcontrollers, CCTV systems, solar controllers, single-board computers and all electronic components.', color: '#7c3aed' },
  { icon: '🔧', title: 'Mechanical Tools', desc: 'Drills, grinders, hydraulic jacks, bearings, and all industrial mechanical tools and spare parts.', color: '#b45309' },
  { icon: '🏗️', title: 'Civil Materials', desc: 'TMT bars, cement, waterproofing compounds, plywood, and all construction materials delivered to site.', color: '#64748b' },
  { icon: '🧪', title: 'Chemical & Lab', desc: 'Lab glassware, pH solutions, protective equipment, and chemical supplies for industrial and research use.', color: '#be123c' },
  { icon: '🍜', title: 'Food & FMCG', desc: 'Rice, cooking oils, spices, dry fruits, and packaged food goods delivered to retailers and wholesalers.', color: '#d97706' },
  { icon: '🔬', title: 'Nano/Bio Tech', desc: 'Nano-silver solutions, bioreactors, DNA extraction kits, micropipettes, and biotech lab supplies.', color: '#0f766e' },
];

export default function Services() {
  const navigate = useNavigate();

  return (
    <div className="services-page">
      <div className="services-header">
        <div className="container">
          <h1>Our Services</h1>
          <p>Comprehensive delivery solutions across 9 sectors</p>
        </div>
      </div>

      <div className="services-body container">
        <div className="services-grid">
          {SERVICES.map((s, i) => (
            <div key={i} className="service-full-card" onClick={() => navigate(`/products?sector=${['agri','aqua','electrical','electronics','mechanical','civil','chemical','food','nanobio'][i]}`)}>
              <div className="sfcard-icon" style={{ background: `${s.color}15`, border: `2px solid ${s.color}30` }}>
                <span style={{ fontSize: 36 }}>{s.icon}</span>
              </div>
              <div className="sfcard-body">
                <h3 style={{ color: s.color }}>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="sfcard-link">Browse Products →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
