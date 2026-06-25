import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllProducts, createProduct, updateProduct, deleteProduct, getApiErrorMessage } from '../services/api';
import ProductCard from '../components/ProductCard';
import ImageCropper from '../components/ImageCropper';
import './Admin.css';

const EMPTY = { name: '', description: '', price: '', imageUrl: '', sector: 'agri', stock: '' };

const SECTORS = ['agri','aqua','electrical','electronics','mechanical','civil','chemical','food','nanobio'];
const SECTOR_ICONS = {
  agri:'🌾', aqua:'🐟', electrical:'⚡', electronics:'📱',
  mechanical:'🔧', civil:'🏗️', chemical:'🧪', food:'🍜', nanobio:'🔬',
};

export default function SellerDashboard() {
  const { user } = useAuth();
  const [myProducts, setMyProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [filter, setFilter] = useState('all');
  const [cropSource, setCropSource] = useState('');
  const fileInputRef = useRef(null);

  const getMyProductIds = () => {
    try { return JSON.parse(localStorage.getItem(`seller_products_${user.email}`) || '[]'); } catch { return []; }
  };
  const addMyProductId = (id) => {
    const ids = getMyProductIds();
    if (!ids.includes(id)) localStorage.setItem(`seller_products_${user.email}`, JSON.stringify([...ids, id]));
  };
  const removeMyProductId = (id) => {
    const ids = getMyProductIds().filter(i => i !== id);
    localStorage.setItem(`seller_products_${user.email}`, JSON.stringify(ids));
  };

  const load = () => {
    setLoading(true);
    getAllProducts()
      .then(r => {
        const all = r.data || [];
        const myIds = getMyProductIds();
        setMyProducts(all.filter(p => p.sellerEmail === user.email || myIds.includes(p.id)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3500);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showMsg('Please select a valid image file.', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showMsg('Image size must be less than 5MB.', 'error'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setCropSource(reader.result);
    reader.onerror = () => showMsg('Could not read image file.', 'error');
    reader.readAsDataURL(file);
  };

  const handleCropApply = (dataUrl) => {
    setForm(prev => ({ ...prev, imageUrl: dataUrl }));
    setCropSource('');
    showMsg('Image cropped and ready to upload.');
  };

  const handleCropCancel = () => {
    setCropSource('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeSelectedImage = () => {
    setForm(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.sector) { showMsg('Please fill required fields.', 'error'); return; }
    setSaving(true);
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10) || 0,
        createdByRole: 'seller',
        sellerEmail: user.email,
        sellerName: user.name,
      };
      if (editing) {
        await updateProduct(editing, data);
        showMsg('Product updated. Visible to customers immediately.');
      } else {
        const res = await createProduct(data);
        const newId = (res.data || {}).id;
        if (newId) addMyProductId(newId);
        showMsg('Product added. Visible to customers immediately.');
      }
      setForm(EMPTY);
      setEditing(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      load();
    } catch (error) {
      console.error('Product save failed:', error);
      showMsg(getApiErrorMessage(error, 'Error saving product.'), 'error');
    }
    setSaving(false);
  };

  const handleEdit = (p) => {
    setEditing(p.id);
    setForm({ name: p.name||'', description: p.description||'', price: p.price||'', imageUrl: p.imageUrl||'', sector: p.sector||'agri', stock: p.stock||'' });
    if (fileInputRef.current) fileInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setForm(EMPTY);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      removeMyProductId(id);
      showMsg('Product deleted.');
      load();
    } catch {
      showMsg('Could not delete product.', 'error');
    }
  };

  const displayed = filter === 'all' ? myProducts : myProducts.filter(p => p.sector === filter);

  return (
    <div className="admin-page seller-dashboard-page">
      {cropSource && <ImageCropper source={cropSource} onCancel={handleCropCancel} onApply={handleCropApply} />}

      <div className="admin-header">
        <div className="container">
          <div className="admin-header-inner">
            <div>
              <h1>🏪 Seller Dashboard</h1>
              <p>Welcome, {user.name}. Add, crop, edit and manage your verified seller products.</p>
            </div>
            <div className="admin-stats">
              <div className="stat-pill"><span>{myProducts.length}</span>My Products</div>
              <div className="stat-pill"><span>{new Set(myProducts.map(p=>p.sector)).size}</span>Sectors</div>
              <div className="stat-pill warn"><span>{myProducts.filter(p=>p.stock<10&&p.stock>0).length}</span>Low Stock</div>
              <div className="stat-pill danger"><span>{myProducts.filter(p=>p.stock===0).length}</span>Out of Stock</div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-body container">
        {msg.text && <div className={`admin-msg ${msg.type === 'error' ? 'error' : ''}`}>{msg.text}</div>}

        <div className="admin-form-card premium-panel">
          <div className="form-card-header">
            <h2>{editing ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
            {editing && <button className="btn-cancel-edit" onClick={handleCancelEdit}>✕ Cancel Edit</button>}
          </div>

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-row-2">
              <div className="form-group">
                <label>Product Name <span className="req">*</span></label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Drip Irrigation Kit" />
              </div>
              <div className="form-group">
                <label>Sector <span className="req">*</span></label>
                <select value={form.sector} onChange={e => setForm({...form, sector: e.target.value})}>
                  {SECTORS.map(s => <option key={s} value={s}>{SECTOR_ICONS[s]} {s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Short product description..." rows={2} />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Price ₹ <span className="req">*</span></label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">₹</span>
                  <input type="number" required min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="4500" className="with-prefix" />
                </div>
              </div>
              <div className="form-group">
                <label>Stock Quantity</label>
                <input type="number" min="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} placeholder="50" />
              </div>
            </div>

            <div className="form-group">
              <label>Product Image Crop Upload</label>
              <div className="file-upload-box">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="image-file-input" id="sellerProductImage" />
                <label htmlFor="sellerProductImage" className="image-file-label">
                  <span className="upload-icon">✂️</span>
                  <div><strong>Choose image and crop before upload</strong><p>Adjust image size and position exactly before saving.</p></div>
                </label>
              </div>
              {form.imageUrl && (
                <div className="img-preview live-preview">
                  <img src={form.imageUrl} alt="Product preview" onError={e => { e.target.style.display='none'; }} />
                  <div className="preview-info">
                    <span>Cropped Preview</span>
                    <button type="button" className="btn-remove-image" onClick={removeSelectedImage}>Remove Image</button>
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? <><span className="btn-spinner" /> Saving...</> : editing ? '💾 Update Product' : '➕ Add Product'}
              </button>
              {editing && <button type="button" className="btn-cancel" onClick={handleCancelEdit}>Cancel</button>}
            </div>
          </form>
        </div>

        <div className="admin-list-section premium-panel">
          <div className="admin-list-header">
            <h2>My Products</h2>
            <p style={{fontSize:'13px',color:'#64748b',margin:0}}>Only products uploaded by this approved seller appear here.</p>
          </div>

          {myProducts.length > 0 && (
            <div className="admin-filter">
              <button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>All <span className="filter-count">{myProducts.length}</span></button>
              {SECTORS.map(s => {
                const count = myProducts.filter(p=>p.sector===s).length;
                return count > 0 ? (
                  <button key={s} className={filter===s?'active':''} onClick={()=>setFilter(s)}>
                    {SECTOR_ICONS[s]} {s.charAt(0).toUpperCase()+s.slice(1)} <span className="filter-count">{count}</span>
                  </button>
                ) : null;
              })}
            </div>
          )}

          {loading ? (
            <div className="admin-loading"><div className="spinner" /><p>Loading your products...</p></div>
          ) : displayed.length === 0 ? (
            <div className="admin-empty"><p>{myProducts.length === 0 ? 'You have no products yet. Add your first product above.' : 'No products in this sector.'}</p></div>
          ) : (
            <>
              <p className="admin-results">{displayed.length} product{displayed.length!==1?'s':''}</p>
              <div className="admin-grid">
                {displayed.map(p => <ProductCard key={p.id} product={p} isAdmin onEdit={handleEdit} onDelete={handleDelete} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
