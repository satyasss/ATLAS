import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllProducts, getProductsBySector } from '../services/api';
import ProductCard from '../components/ProductCard';
import './Products.css';

const SECTORS = [
  { key: 'all',        label: 'All Products',  icon: '📦' },
  { key: 'agri',       label: 'Agriculture',   icon: '🌾' },
  { key: 'aqua',       label: 'Aquaculture',   icon: '🐟' },
  { key: 'electrical', label: 'Electrical',    icon: '⚡' },
  { key: 'electronics',label: 'Electronics',   icon: '📱' },
  { key: 'mechanical', label: 'Mechanical',    icon: '🔧' },
  { key: 'civil',      label: 'Civil',         icon: '🏗️' },
  { key: 'chemical',   label: 'Chemical',      icon: '🧪' },
  { key: 'food',       label: 'Food',          icon: '🍜' },
  { key: 'nanobio',    label: 'Nano/Bio',      icon: '🔬' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const activeSector = searchParams.get('sector') || 'all';

  const fetchProducts = async (sector) => {
    setLoading(true);
    try {
      const res = sector === 'all' ? await getAllProducts() : await getProductsBySector(sector);
      setProducts(res.data || []);
    } catch {
      setProducts([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(activeSector); }, [activeSector]);

  const filtered = products.filter(p =>
    !search ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="products-page">
      {/* Header */}
      <div className="products-header">
        <div className="container">
          <h1>Our Products</h1>
          <p>Browse our wide range of industrial, agricultural & specialty supplies</p>
        </div>
      </div>

      <div className="products-body container">
        {/* Sector tabs */}
        <div className="sector-tabs">
          {SECTORS.map(s => (
            <button
              key={s.key}
              className={`sector-tab ${activeSector === s.key ? 'active' : ''}`}
              onClick={() => setSearchParams(s.key === 'all' ? {} : { sector: s.key })}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="search-wrap">
          <div className="search-inner">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="loading-wrap">
            <div className="spinner" />
            <p>Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>No products found {search ? `for "${search}"` : 'in this sector'}.</p>
            {search && (
              <button className="btn-green" onClick={() => setSearch('')} style={{ marginTop: 14 }}>
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="results-count">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''}
              {activeSector !== 'all' ? ` in ${SECTORS.find(s => s.key === activeSector)?.label}` : ''}
            </p>
            <div className="product-grid">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} isAdmin={false} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
