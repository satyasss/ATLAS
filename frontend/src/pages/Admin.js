import React, { useEffect, useRef, useState } from 'react';
import { getAllProducts, createProduct, updateProduct, deleteProduct, getApiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import ImageCropper from '../components/ImageCropper';
import './Admin.css';

const EMPTY = { name: '', description: '', price: '', imageUrl: '', sector: 'agri', stock: '' };

const SECTORS = ['agri','aqua','electrical','electronics','mechanical','civil','chemical','food','nanobio'];
const SECTOR_ICONS = {
  agri:'🌾', aqua:'🐟', electrical:'⚡', electronics:'📱',
  mechanical:'🔧', civil:'🏗️', chemical:'🧪', food:'🍜', nanobio:'🔬',
};

function documentEntries(seller = {}) {
  return [
    ['Aadhaar', { name: seller.aadhaarName, dataUrl: seller.aadhaarDataUrl }],
    ['Business Proof / GST / PAN', { name: seller.businessProofName, dataUrl: seller.businessProofDataUrl }],
  ].filter(([, doc]) => doc.dataUrl);
}

export default function Admin() {
  const { user, getAllSellers, approveSeller, rejectSeller, sellerListVersion } = useAuth();

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const [sellers, setSellers] = useState([]);
  const [cropSource, setCropSource] = useState('');
  const fileInputRef = useRef(null);

  const load = () => {
    setLoading(true);
    getAllProducts()
      .then(r => { setProducts(r.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    getAllSellers()
      .then(setSellers)
      .catch(error => showMsg(getApiErrorMessage(error, 'Could not load sellers.'), 'error'));
  }, [sellerListVersion]); // eslint-disable-line

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
        stock: parseInt(form.stock,10) || 0,
        createdByRole: 'admin',
        sellerName: user?.name || 'Atlas Admin',
        sellerEmail: user?.email || '',
      };
      if (editing) {
        await updateProduct(editing, data);
        showMsg('Product updated successfully.');
      } else {
        await createProduct(data);
        showMsg('Product added successfully.');
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
    setForm({
      name: p.name || '',
      description: p.description || '',
      price: p.price || '',
      imageUrl: p.imageUrl || '',
      sector: p.sector || 'agri',
      stock: p.stock || '',
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setForm(EMPTY);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      showMsg('Product deleted.');
      load();
    } catch {
      showMsg('Could not delete product.', 'error');
    }
  };

  const handleApprove = async (seller) => {
    try {
      await approveSeller(seller.id);
      showMsg(`Seller ${seller.email} approved. They can now login and upload products.`);
    } catch (error) {
      showMsg(getApiErrorMessage(error, 'Could not approve seller.'), 'error');
    }
  };

  const handleReject = async (seller) => {
    const reason = window.prompt('Enter reject reason for this seller:', 'Document verification failed') || 'Rejected by admin';
    try {
      await rejectSeller(seller.id, reason);
      showMsg(`Seller ${seller.email} rejected.`, 'error');
    } catch (error) {
      showMsg(getApiErrorMessage(error, 'Could not reject seller.'), 'error');
    }
  };

  const displayed = (filter === 'all' ? products : products.filter(p => p.sector === filter))
    .filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: products.length,
    sectors: new Set(products.map(p => p.sector)).size,
    lowStock: products.filter(p => p.stock < 10 && p.stock > 0).length,
    outStock: products.filter(p => p.stock === 0).length,
  };

  const pendingCount = sellers.filter(s => s.status === 'pending').length;

  return (
    <div className="admin-page">
      {cropSource && <ImageCropper source={cropSource} onCancel={handleCropCancel} onApply={handleCropApply} />}

      <div className="admin-header">
        <div className="container">
          <div className="admin-header-inner">
            <div>
              <h1>Admin Dashboard</h1>
              <p>Manage products, seller KYC documents, approvals and inventory</p>
            </div>
            <div className="admin-stats">
              <div className="stat-pill"><span>{stats.total}</span>Products</div>
              <div className="stat-pill"><span>{stats.sectors}</span>Sectors</div>
              <div className="stat-pill warn"><span>{stats.lowStock}</span>Low Stock</div>
              <div className="stat-pill danger"><span>{stats.outStock}</span>Out of Stock</div>
              {pendingCount > 0 && <div className="stat-pill seller-pending"><span>{pendingCount}</span>Pending Sellers</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-tabs-bar">
        <div className="container">
          <div className="admin-tabs">
            <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>📦 Products</button>
            <button className={activeTab === 'sellers' ? 'active' : ''} onClick={() => setActiveTab('sellers')}>
              🛡️ Seller KYC {pendingCount > 0 && <span className="pending-dot">{pendingCount}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="admin-body container">
        {msg.text && <div className={`admin-msg ${msg.type === 'error' ? 'error' : ''}`}>{msg.text}</div>}

        {activeTab === 'products' && (
          <>
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
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="image-file-input" id="productImage" />
                    <label htmlFor="productImage" className="image-file-label">
                      <span className="upload-icon">✂️</span>
                      <div><strong>Choose image and crop before upload</strong><p>PNG, JPG, JPEG, WEBP up to 5MB. Crop modal opens automatically.</p></div>
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
                <h2>Product Catalogue</h2>
                <div className="admin-search-wrap">
                  <input type="text" placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} className="admin-search" />
                </div>
              </div>

              <div className="admin-filter">
                <button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>All <span className="filter-count">{products.length}</span></button>
                {SECTORS.map(s => {
                  const count = products.filter(p=>p.sector===s).length;
                  return count > 0 ? (
                    <button key={s} className={filter===s?'active':''} onClick={()=>setFilter(s)}>
                      {SECTOR_ICONS[s]} {s.charAt(0).toUpperCase()+s.slice(1)} <span className="filter-count">{count}</span>
                    </button>
                  ) : null;
                })}
              </div>

              {loading ? (
                <div className="admin-loading"><div className="spinner" /><p>Loading products...</p></div>
              ) : displayed.length === 0 ? (
                <div className="admin-empty"><p>No products found. Add some above.</p></div>
              ) : (
                <>
                  <p className="admin-results">{displayed.length} product{displayed.length!==1?'s':''}</p>
                  <div className="admin-grid">
                    {displayed.map(p => <ProductCard key={p.id} product={p} isAdmin onEdit={handleEdit} onDelete={handleDelete} />)}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {activeTab === 'sellers' && (
          <div className="admin-form-card premium-panel">
            <div className="form-card-header kyc-header">
              <div>
                <h2>🛡️ Seller KYC Applications</h2>
                <p>Open Aadhaar/documents, verify the seller and approve or reject access.</p>
              </div>
            </div>

            {sellers.length === 0 ? (
              <div className="admin-empty"><p>No seller applications yet.</p></div>
            ) : (
              <div className="seller-list">
                {['pending','approved','rejected'].map(status => {
                  const group = sellers.filter(s => s.status === status);
                  if (group.length === 0) return null;
                  return (
                    <div key={status} className="seller-group">
                      <h3 className={`seller-group-title ${status}`}>
                        {status === 'pending' ? '⏳ Pending Approval' : status === 'approved' ? '✅ Approved Sellers' : '❌ Rejected Sellers'}
                        <span className="seller-count">{group.length}</span>
                      </h3>

                      {group.map(s => (
                        <div key={s.email} className="seller-row seller-row-rich">
                          <div className="seller-main">
                            <div className="seller-info">
                              <div className="seller-avatar">{(s.businessName || s.name || 'S').charAt(0).toUpperCase()}</div>
                              <div>
                                <strong>{s.businessName || s.name}</strong>
                                <span>{s.email} • {s.mobile}</span>
                                <small>Owner: {s.ownerName || s.name} • Applied: {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '-'}</small>
                                {s.rejectReason && <small className="reject-reason">Reason: {s.rejectReason}</small>}
                              </div>
                            </div>

                            <div className="seller-doc-grid">
                              {documentEntries(s).map(([label, doc]) => (
                                <a key={label} className="doc-chip" href={doc.dataUrl} target="_blank" rel="noreferrer">
                                  <span>📄</span>
                                  <div><strong>{label}</strong><small>{doc.name}</small></div>
                                </a>
                              ))}
                              {documentEntries(s).length === 0 && <span className="doc-missing">No documents uploaded</span>}
                            </div>
                          </div>

                          <div className="seller-actions">
                            {status === 'pending' && (
                              <>
                                <button className="btn-approve" onClick={() => handleApprove(s)}>✓ Approve</button>
                                <button className="btn-reject" onClick={() => handleReject(s)}>✕ Reject</button>
                              </>
                            )}
                            {status === 'approved' && <button className="btn-reject" onClick={() => handleReject(s)}>Revoke / Reject</button>}
                            {status === 'rejected' && <button className="btn-approve" onClick={() => handleApprove(s)}>Re-approve</button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
