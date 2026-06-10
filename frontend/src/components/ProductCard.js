import React from 'react';
import './ProductCard.css';

const SECTOR_COLORS = {
  agri:        { bg: '#e8f5e9', color: '#2e7d32', dot: '#4caf50' },
  aqua:        { bg: '#e3f2fd', color: '#1565c0', dot: '#42a5f5' },
  electrical:  { bg: '#fff8e1', color: '#f57f17', dot: '#ffca28' },
  electronics: { bg: '#f3e5f5', color: '#6a1b9a', dot: '#ab47bc' },
  mechanical:  { bg: '#fbe9e7', color: '#bf360c', dot: '#ff7043' },
  civil:       { bg: '#eceff1', color: '#37474f', dot: '#78909c' },
  chemical:    { bg: '#fce4ec', color: '#880e4f', dot: '#e91e63' },
  food:        { bg: '#fff3e0', color: '#e65100', dot: '#ff9800' },
  nanobio:     { bg: '#e8eaf6', color: '#283593', dot: '#5c6bc0' },
};

export default function ProductCard({ product, onEdit, onDelete, isAdmin }) {
  const sc = SECTOR_COLORS[product.sector] || { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' };

  return (
    <div className="product-card">
      <div className="product-img-wrap">
        <img
          src={product.imageUrl || `https://via.placeholder.com/400x240?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
          loading="lazy"
          onError={e => { e.target.src = `https://via.placeholder.com/400x240?text=Product`; }}
        />
        <div
          className="sector-badge"
          style={{ background: sc.bg, color: sc.color }}
        >
          <span className="sector-dot" style={{ background: sc.dot }} />
          {product.sector?.charAt(0).toUpperCase() + product.sector?.slice(1)}
        </div>
        {product.stock === 0 && <div className="oos-overlay">Out of Stock</div>}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {product.description && (
          <p className="product-desc">{product.description}</p>
        )}
        <div className="product-meta">
          <span className="price">₹{product.price?.toLocaleString('en-IN')}</span>
          <span className={`stock-tag ${product.stock === 0 ? 'out' : product.stock < 10 ? 'low' : 'ok'}`}>
            {product.stock === 0 ? 'Out of stock'
             : product.stock < 10 ? `⚠️ ${product.stock} left`
             : `✓ ${product.stock} in stock`}
          </span>
        </div>

        {isAdmin && (
          <div className="admin-actions">
            <button className="btn-edit" onClick={() => onEdit(product)}>
              <span>✏️</span> Edit
            </button>
            <button className="btn-delete" onClick={() => onDelete(product.id)}>
              <span>🗑️</span> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
