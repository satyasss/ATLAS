import React from 'react';
import './ProductCard.css';

const SECTOR_COLORS = {
  agri:        { bg: '#e8f5e9', color: '#2e7d32', dot: '#4caf50' },
  aqua:        { bg: '#e3f2fd', color: '#1565c0', dot: '#42a5f5' },
  electrical:  { bg: '#fff8e1', color: '#f57f17', dot: '#ffca28' },
  electronics: { bg: '#e8f5e9', color: '#2e7d32', dot: '#4caf50' },
  mechanical:  { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  civil:       { bg: '#cffafe', color: '#0891b2', dot: '#06b6d4' },
  chemical:    { bg: '#ccfbf1', color: '#0d9488', dot: '#14b8a6' },
  food:        { bg: '#ffedd5', color: '#ea580c', dot: '#f97316' },
  nanobio:     { bg: '#e8eaf6', color: '#283593', dot: '#5c6bc0' },
};

export default function ProductCard({ product, onEdit, onDelete, onAddToCart, isAdmin }) {
  const sc = SECTOR_COLORS[product.sector] || { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' };

  const sectorLabel = () => {
    const map = {
      agri: 'Agritech', aqua: 'Aquatech', electrical: 'Electrical',
      electronics: 'Electronics', mechanical: 'Machanical', civil: 'Civil',
      chemical: 'Chemical', food: 'Food Products', nanobio: 'Nano/Bio',
    };
    return map[product.sector] || (product.sector?.charAt(0).toUpperCase() + product.sector?.slice(1));
  };

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
          {sectorLabel()}
        </div>
        {product.createdByRole && (
          <div className={`seller-badge ${product.createdByRole === 'seller' ? 'seller' : 'admin'}`}>
            {product.createdByRole === 'seller' ? 'Verified Seller' : 'Admin Listed'}
          </div>
        )}
        {product.stock === 0 && <div className="oos-overlay">Out of Stock</div>}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {product.sellerName && (
          <div className="seller-line">Sold by <strong>{product.sellerName}</strong></div>
        )}

        <div className="product-meta">
          <span className="price">₹{product.price?.toLocaleString('en-IN')}</span>
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
        {!isAdmin && (
          <button className="btn-add-cart" disabled={product.stock === 0} onClick={() => onAddToCart?.(product)}>
            {product.stock === 0 ? 'Out of Stock' : '+ Cart'}
          </button>
        )}
      </div>
    </div>
  );
}
