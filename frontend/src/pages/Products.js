import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAllProducts, getProductsBySector, getApprovedSellers } from '../services/api';
import { useCart } from '../context/CartContext';
import './Products.css';

const SECTORS = [
  { key: 'all',        label: 'All Products',  icon: '📦' },
  { key: 'agri',       label: 'Agritech',      icon: '🌾' },
  { key: 'aqua',       label: 'Aquatech',      icon: '💧' },
  { key: 'electrical', label: 'Electrical',    icon: '⚡' },
  { key: 'electronics',label: 'Electronics',   icon: '💻' },
  { key: 'mechanical', label: 'Machanical',    icon: '⚙️' },
  { key: 'civil',      label: 'Civil',         icon: '🏗️' },
  { key: 'chemical',   label: 'Chemical',      icon: '🧪' },
  { key: 'food',       label: 'Food Products', icon: '🥗' },
  { key: 'nanobio',    label: 'Nano/Bio',      icon: '🔬' },
];

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

export default function Products() {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [sortBy, setSortBy]             = useState('default');

  const activeSector  = searchParams.get('sector') || 'all';
  const activeSeller  = searchParams.get('seller') || '';
  const urlSearch     = searchParams.get('search') || '';
  const activeSectorTheme = SECTOR_COLORS[activeSector] || { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' };

  const [approvedSellers, setApprovedSellers] = useState([]);

  // Load ALL products or approved sellers depending on route
  useEffect(() => {
    setLoading(true);
    // We always load products to compute category product counts, and conditionally load approved sellers
    const req = (activeSector === 'all' || activeSeller)
      ? getAllProducts()
      : getProductsBySector(activeSector);
    
    req
      .then(res => {
        setAllProducts(res.data || []);
        if (activeSector !== 'all' && !activeSeller) {
          getApprovedSellers()
            .then(sRes => {
              setApprovedSellers(sRes.data || []);
            })
            .catch(() => setApprovedSellers([]))
            .finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setAllProducts([]);
        setLoading(false);
      });
  }, [activeSector, activeSeller]);

  // Sync URL search param to state on mount
  useEffect(() => {
    if (urlSearch) setSearch(urlSearch);
  }, [urlSearch]);

  // All unique sellers
  const sellers = useMemo(() => {
    const names = [...new Set(allProducts.map(p => p.sellerName).filter(Boolean))];
    return names.sort();
  }, [allProducts]);

  const filtered = useMemo(() => {
    let list = allProducts;

    // Sector filter (when all products loaded for seller view)
    if (activeSeller && activeSector !== 'all') {
      list = list.filter(p => p.sector === activeSector);
    }

    // Seller filter
    if (activeSeller) {
      list = list.filter(p => p.sellerName === activeSeller);
    }

    // Text search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.sellerName?.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'price-asc')  list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sortBy === 'name')       list = [...list].sort((a, b) => a.name?.localeCompare(b.name));
    if (sortBy === 'stock')      list = [...list].sort((a, b) => (b.stock || 0) - (a.stock || 0));

    return list;
  }, [allProducts, activeSeller, activeSector, search, sortBy]);

  const setSector = (key) => {
    const params = {};
    if (key !== 'all') params.sector = key;
    if (activeSeller) params.seller = activeSeller;
    setSearchParams(params);
  };

  const setSeller = (name) => {
    const params = {};
    if (activeSector !== 'all') params.sector = activeSector;
    if (name) params.seller = name;
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setSearchParams({});
  };

  const hasFilters = activeSector !== 'all' || activeSeller || search;

  return (
    <div className="products-page">
      {/* Header */}
      <div className="products-header">
        <div className="container">
          <h1>Our Products</h1>
          <p>Browse our wide range of industrial, agricultural &amp; specialty supplies</p>
        </div>
      </div>

      <div className="products-body container">
        {/* Sector tabs */}
        <div className="sector-tabs">
          {SECTORS.map(s => (
            <button
              key={s.key}
              className={`sector-tab ${activeSector === s.key && !activeSeller ? 'active' : ''}`}
              onClick={() => setSector(s.key)}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        <div className="products-filter-row">
          {/* Search */}
          <div className="search-wrap" style={{ flex: 1 }}>
            <div className="search-inner">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search products by name, description, or seller..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch('')}>✕</button>
              )}
            </div>
          </div>

          {/* Sort */}
          <select
            className="products-sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name A–Z</option>
            <option value="stock">Most in Stock</option>
          </select>
        </div>

        {/* Company / Seller Filter */}
        {sellers.length > 0 && (
          <div className="company-filter-wrap">
            <span className="company-filter-label">🏪 Filter by Company:</span>
            <div className="company-filter-chips">
              <button
                className={`company-chip ${!activeSeller ? 'active' : ''}`}
                onClick={() => setSeller('')}
              >
                All Companies
              </button>
              {sellers.map(name => (
                <button
                  key={name}
                  className={`company-chip ${activeSeller === name ? 'active' : ''}`}
                  onClick={() => setSeller(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active filters bar */}
        {hasFilters && (
          <div className="active-filters-bar">
            <span>Filters:</span>
            {activeSector !== 'all' && (
              <span className="filter-tag">{SECTORS.find(s => s.key === activeSector)?.label} <button onClick={() => setSector('all')}>✕</button></span>
            )}
            {activeSeller && (
              <span className="filter-tag">🏪 {activeSeller} <button onClick={() => setSeller('')}>✕</button></span>
            )}
            {search && (
              <span className="filter-tag">Search: "{search}" <button onClick={() => setSearch('')}>✕</button></span>
            )}
            <button className="clear-all-filters" onClick={clearFilters}>Clear All</button>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="loading-wrap">
            <div className="spinner" />
            <p>Loading...</p>
          </div>
        ) : activeSector !== 'all' && !activeSeller ? (
          <div className="company-cards-section">
            <h2 className="company-cards-heading">Verified {SECTORS.find(s => s.key === activeSector)?.label || 'Sector'} Companies</h2>
            <p className="company-cards-sub">Select a registered supplier to browse their products</p>
            
            {approvedSellers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏪</div>
                <p>No verified companies registered yet.</p>
              </div>
            ) : (
              <div className="company-grid">
                {approvedSellers.map(company => {
                  // Fallback colors for name initials avatar
                  const colors = [
                    ['#10b981', '#059669'], // green
                    ['#3b82f6', '#2563eb'], // blue
                    ['#8b5cf6', '#7c3aed'], // purple
                    ['#f59e0b', '#d97706'], // orange
                    ['#ec4899', '#db2777'], // pink
                  ];
                  const charCodeSum = (company.businessName || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const colorPair = colors[charCodeSum % colors.length];
                  const hasLogo = company.logoDataUrl && company.logoDataUrl.startsWith('data:');
                  
                  // Compute product count for this seller in this sector
                  const productCount = allProducts.filter(p => 
                    p.sellerName === company.businessName && 
                    (activeSector === 'all' || p.sector === activeSector)
                  ).length;
                  
                  return (
                    <div 
                      key={company.id} 
                      className="company-card"
                      style={{ '--company-accent': activeSectorTheme.color, '--company-tint': activeSectorTheme.bg }}
                      onClick={() => setSeller(company.businessName)}
                    >
                      <div className="company-logo-area-only">
                        {hasLogo ? (
                          <img src={company.logoDataUrl} alt={company.businessName} className="company-logo-img-only" />
                        ) : (
                          <div className="company-logo-fallback-only" style={{ background: `linear-gradient(135deg, ${colorPair[0]}, ${colorPair[1]})` }}>
                            {(company.businessName || 'C').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>No products found{search ? ` for "${search}"` : ''}.</p>
            <button className="btn-green" onClick={clearFilters} style={{ marginTop: 14 }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <p className="results-count">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''}
              {activeSeller ? ` from ${activeSeller}` : ''}
              {activeSector !== 'all' ? ` in ${SECTORS.find(s => s.key === activeSector)?.label}` : ''}
            </p>
            <div className="product-grid">
              {filtered.map(p => (
                <ClickableProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={() => addItem(p)}
                  onNavigate={() => navigate(`/products/${p.id}`)}
                  onSellerClick={(e, seller) => { e.stopPropagation(); setSeller(seller); }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ClickableProductCard({ product, onAddToCart, onNavigate, onSellerClick }) {
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
    <div className="product-card clickable-card" onClick={onNavigate} style={{ cursor: 'pointer' }}>
      <div className="product-img-wrap">
        <img
          src={product.imageUrl || `https://via.placeholder.com/400x240?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
          loading="lazy"
          onError={e => { e.target.src = `https://via.placeholder.com/400x240?text=Product`; }}
        />
        <div className="sector-badge" style={{ background: sc.bg, color: sc.color }}>
          <span className="sector-dot" style={{ background: sc.dot }} />
          {sectorLabel()}
        </div>
        {product.createdByRole && (
          <div className={`seller-badge ${product.createdByRole === 'seller' ? 'seller' : 'admin'}`}>
            {product.createdByRole === 'seller' ? 'Verified Seller' : 'Admin Listed'}
          </div>
        )}
        {product.stock === 0 && <div className="oos-overlay">Out of Stock</div>}
        <div className="card-view-overlay">👁 View Details</div>
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {product.sellerName && (
          <div className="seller-line">
            Sold by{' '}
            <strong
              className="seller-name-link"
              onClick={e => onSellerClick(e, product.sellerName)}
            >
              {product.sellerName}
            </strong>
          </div>
        )}

        <div className="product-meta">
          <span className="price">₹{product.price?.toLocaleString('en-IN')}</span>
          <button
            className="btn-add-cart"
            disabled={product.stock === 0}
            onClick={e => { e.stopPropagation(); onAddToCart(); }}
          >
            {product.stock === 0 ? 'Out of Stock' : '+ Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
