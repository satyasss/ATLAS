import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAllProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

const SECTOR_COLORS = {
  agri:        { bg: '#e8f5e9', color: '#2e7d32', dot: '#4caf50', label: 'Agriculture' },
  aqua:        { bg: '#e3f2fd', color: '#1565c0', dot: '#42a5f5', label: 'Aquaculture' },
  electrical:  { bg: '#fff8e1', color: '#f57f17', dot: '#ffca28', label: 'Electrical' },
  electronics: { bg: '#f3e5f5', color: '#6a1b9a', dot: '#ab47bc', label: 'Electronics' },
  mechanical:  { bg: '#fbe9e7', color: '#bf360c', dot: '#ff7043', label: 'Mechanical' },
  civil:       { bg: '#eceff1', color: '#37474f', dot: '#78909c', label: 'Civil' },
  chemical:    { bg: '#fce4ec', color: '#880e4f', dot: '#e91e63', label: 'Chemical' },
  food:        { bg: '#fff3e0', color: '#e65100', dot: '#ff9800', label: 'Food' },
  nanobio:     { bg: '#e8eaf6', color: '#283593', dot: '#5c6bc0', label: 'Nano/Bio' },
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct]           = useState(null);
  const [relatedProducts, setRelated]   = useState([]);
  const [companyProducts, setCompany]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [added, setAdded]               = useState(false);
  const [qty, setQty]                   = useState(1);
  const [activeTab, setActiveTab]       = useState('details');

  useEffect(() => {
    setLoading(true);
    getAllProducts()
      .then(res => {
        const all = res.data || [];
        const found = all.find(p => String(p.id) === String(id));
        if (!found) { navigate('/products'); return; }
        setProduct(found);
        // related by sector (exclude self)
        setRelated(all.filter(p => p.sector === found.sector && p.id !== found.id).slice(0, 4));
        // same company/seller products
        if (found.sellerName) {
          setCompany(all.filter(p => p.sellerName === found.sellerName && p.id !== found.id).slice(0, 6));
        }
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div className="pd-loading">
      <div className="pd-spinner" />
      <p>Loading product...</p>
    </div>
  );

  if (!product) return null;

  const sc = SECTOR_COLORS[product.sector] || { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af', label: product.sector };

  return (
    <div className="pd-page">
      {/* Breadcrumb */}
      <div className="pd-breadcrumb container">
        <Link to="/">Home</Link>
        <span>›</span>
        <Link to="/products">Products</Link>
        <span>›</span>
        <Link to={`/products?sector=${product.sector}`}>{sc.label}</Link>
        <span>›</span>
        <span className="pd-crumb-current">{product.name}</span>
      </div>

      <div className="pd-body container">
        {/* Left: Image */}
        <div className="pd-left">
          <div className="pd-img-box">
            <img
              src={product.imageUrl || `https://via.placeholder.com/600x450?text=${encodeURIComponent(product.name)}`}
              alt={product.name}
              onError={e => { e.target.src = `https://via.placeholder.com/600x450?text=Product`; }}
            />
            {product.stock === 0 && <div className="pd-oos-overlay">Out of Stock</div>}
          </div>
          {/* Sector + seller badges */}
          <div className="pd-badges">
            <span className="pd-sector-badge" style={{ background: sc.bg, color: sc.color }}>
              <span className="pd-dot" style={{ background: sc.dot }} />
              {sc.label}
            </span>
            {product.createdByRole && (
              <span className={`pd-role-badge ${product.createdByRole === 'seller' ? 'seller' : 'admin'}`}>
                {product.createdByRole === 'seller' ? '✓ Verified Seller' : '🏢 Admin Listed'}
              </span>
            )}
          </div>
        </div>

        {/* Right: Info */}
        <div className="pd-right">
          <h1 className="pd-name">{product.name}</h1>

          {product.sellerName && (
            <div className="pd-seller-info">
              <span className="pd-seller-label">Sold by</span>
              <Link to={`/products?seller=${encodeURIComponent(product.sellerName)}`} className="pd-seller-link">
                🏪 {product.sellerName}
              </Link>
            </div>
          )}

          <div className="pd-price-row">
            <span className="pd-price">₹{product.price?.toLocaleString('en-IN')}</span>
            <span className={`pd-stock-tag ${product.stock === 0 ? 'out' : product.stock < 10 ? 'low' : 'ok'}`}>
              {product.stock === 0 ? '✗ Out of stock'
               : product.stock < 10 ? `⚠ Only ${product.stock} left`
               : `✓ ${product.stock} in stock`}
            </span>
          </div>

          {product.description && (
            <p className="pd-desc">{product.description}</p>
          )}

          {/* Quantity + Add to Cart */}
          {product.stock > 0 && (
            <div className="pd-actions">
              <div className="pd-qty-wrap">
                <label>Qty</label>
                <div className="pd-qty-ctrl">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
                </div>
              </div>
              <button
                className={`pd-add-btn ${added ? 'added' : ''}`}
                onClick={handleAddToCart}
              >
                {added ? '✓ Added to Cart!' : '🛒 Add to Cart'}
              </button>
            </div>
          )}

          {product.stock === 0 && (
            <div className="pd-oos-msg">This product is currently out of stock.</div>
          )}

          {/* Info tabs */}
          <div className="pd-tabs">
            <button className={activeTab === 'details' ? 'active' : ''} onClick={() => setActiveTab('details')}>Product Details</button>
            <button className={activeTab === 'delivery' ? 'active' : ''} onClick={() => setActiveTab('delivery')}>Delivery Info</button>
            <button className={activeTab === 'seller' ? 'active' : ''} onClick={() => setActiveTab('seller')}>Seller Info</button>
          </div>

          <div className="pd-tab-content">
            {activeTab === 'details' && (
              <div className="pd-detail-table">
                <div className="pd-detail-row"><span>Product ID</span><span>#{product.id}</span></div>
                <div className="pd-detail-row"><span>Category</span><span>{sc.label}</span></div>
                <div className="pd-detail-row"><span>Stock</span><span>{product.stock} units</span></div>
                <div className="pd-detail-row"><span>Listed by</span><span>{product.createdByRole === 'seller' ? 'Verified Seller' : 'Atlas Admin'}</span></div>
              </div>
            )}
            {activeTab === 'delivery' && (
              <div className="pd-delivery-info">
                <div className="pd-info-item">🚚 <div><strong>Fast Delivery</strong><p>Standard 3-7 business days across India</p></div></div>
                <div className="pd-info-item">📦 <div><strong>Secure Packaging</strong><p>All items shipped in sealed, damage-proof packaging</p></div></div>
                <div className="pd-info-item">🔄 <div><strong>Easy Returns</strong><p>7-day return policy for damaged or defective items</p></div></div>
              </div>
            )}
            {activeTab === 'seller' && (
              <div className="pd-delivery-info">
                {product.sellerName ? (
                  <>
                    <div className="pd-info-item">🏪 <div><strong>{product.sellerName}</strong><p>Verified seller on Atlas Services</p></div></div>
                    <div className="pd-info-item">✅ <div><strong>Verified Business</strong><p>Aadhaar & business documents verified by Atlas</p></div></div>
                    <Link to={`/products?seller=${encodeURIComponent(product.sellerName)}`} className="pd-view-seller-btn">
                      View all products by {product.sellerName} →
                    </Link>
                  </>
                ) : (
                  <div className="pd-info-item">🏢 <div><strong>Atlas Services</strong><p>This product is listed directly by Atlas admin</p></div></div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Company Products Section */}
      {companyProducts.length > 0 && (
        <div className="pd-related-section container">
          <div className="pd-related-header">
            <h2>More from {product.sellerName}</h2>
            <Link to={`/products?seller=${encodeURIComponent(product.sellerName)}`} className="pd-see-all">
              See all →
            </Link>
          </div>
          <div className="pd-related-grid">
            {companyProducts.map(p => (
              <MiniCard key={p.id} product={p} onAdd={() => addItem(p)} />
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pd-related-section container">
          <div className="pd-related-header">
            <h2>Related in {sc.label}</h2>
            <Link to={`/products?sector=${product.sector}`} className="pd-see-all">See all →</Link>
          </div>
          <div className="pd-related-grid">
            {relatedProducts.map(p => (
              <MiniCard key={p.id} product={p} onAdd={() => addItem(p)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniCard({ product, onAdd }) {
  const sc = SECTOR_COLORS[product.sector] || { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' };
  return (
    <Link to={`/products/${product.id}`} className="pd-mini-card">
      <div className="pd-mini-img">
        <img
          src={product.imageUrl || `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
          onError={e => { e.target.src = `https://via.placeholder.com/300x200?text=Product`; }}
        />
        {product.stock === 0 && <div className="pd-mini-oos">Out of Stock</div>}
      </div>
      <div className="pd-mini-info">
        <span className="pd-mini-sector" style={{ background: sc.bg, color: sc.color }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot, display: 'inline-block', marginRight: 4 }} />
          {sc.label || product.sector}
        </span>
        <p className="pd-mini-name">{product.name}</p>
        <div className="pd-mini-footer">
          <span className="pd-mini-price">₹{product.price?.toLocaleString('en-IN')}</span>
          {product.stock > 0 && (
            <button className="pd-mini-add" onClick={e => { e.preventDefault(); onAdd(); }}>+ Cart</button>
          )}
        </div>
      </div>
    </Link>
  );
}
