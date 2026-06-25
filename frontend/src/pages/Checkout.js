import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder, getApiErrorMessage } from '../services/api';
import './AuthFlow.css';
import './CartCheckout.css';

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState({
    fullName: user?.name || '', phone: user?.mobile || '', addressLine1: '', addressLine2: '',
    city: '', state: '', postalCode: '', paymentMethod: 'COD',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!items.length) return navigate('/cart');
    setError('');
    setLoading(true);
    try {
      const response = await createOrder({
        ...form,
        customerEmail: user.email,
        items: items.map(item => ({ productId: item.id, quantity: item.quantity })),
      });
      setOrder(response.data);
      clearCart();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not place the order.'));
    } finally {
      setLoading(false);
    }
  };

  if (order) {
    return <div className="commerce-page"><div className="container"><div className="order-success"><h1>Order placed!</h1><p>Your order number is <strong>#{order.orderId}</strong>. Total: ₹{order.total?.toLocaleString('en-IN')}</p></div><Link className="commerce-btn" to="/products">Continue Shopping</Link></div></div>;
  }

  return (
    <div className="commerce-page">
      <div className="container">
        <div className="commerce-head"><div><h1>Secure Checkout</h1><p>Delivery details and payment preference</p></div></div>
        <form className="checkout-layout" onSubmit={submit}>
          <div className="checkout-form">
            {error && <div className="auth-alert error">{error}</div>}
            <div className="checkout-section">
              <h2>Delivery Address</h2>
              <div className="auth-form">
                <div className="auth-grid">
                  <div className="auth-field"><label>Full name</label><input required value={form.fullName} onChange={e => update('fullName', e.target.value)} /></div>
                  <div className="auth-field"><label>Phone</label><input required value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
                </div>
                <div className="auth-field"><label>Address line 1</label><input required value={form.addressLine1} onChange={e => update('addressLine1', e.target.value)} placeholder="House, street, area" /></div>
                <div className="auth-field"><label>Address line 2</label><input value={form.addressLine2} onChange={e => update('addressLine2', e.target.value)} placeholder="Landmark, apartment (optional)" /></div>
                <div className="auth-grid">
                  <div className="auth-field"><label>City</label><input required value={form.city} onChange={e => update('city', e.target.value)} /></div>
                  <div className="auth-field"><label>State</label><input required value={form.state} onChange={e => update('state', e.target.value)} /></div>
                </div>
                <div className="auth-field"><label>Postal / PIN code</label><input required value={form.postalCode} onChange={e => update('postalCode', e.target.value)} /></div>
              </div>
            </div>
            <div className="checkout-section">
              <h2>Payment</h2>
              <div className="payment-options">
                <label className="payment-option"><input type="radio" name="payment" checked={form.paymentMethod === 'COD'} onChange={() => update('paymentMethod', 'COD')} /><span><strong>Cash on Delivery</strong><small>Pay safely when your order arrives.</small></span></label>
                <label className="payment-option"><input type="radio" name="payment" checked={form.paymentMethod === 'UPI_ON_DELIVERY'} onChange={() => update('paymentMethod', 'UPI_ON_DELIVERY')} /><span><strong>UPI on Delivery</strong><small>Scan the delivery partner's verified QR code at delivery.</small></span></label>
              </div>
              <p className="payment-note">Atlas does not collect or store card numbers, CVVs, UPI PINs, or banking passwords. Online prepaid payments should be added later through Razorpay, Stripe, or another PCI-compliant gateway.</p>
            </div>
          </div>
          <aside className="order-summary">
            <h2>Your Order</h2>
            {items.map(item => <div className="summary-line" key={item.id}><span>{item.name} × {item.quantity}</span><strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong></div>)}
            <div className="summary-line total"><span>Total</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            <button className="commerce-btn" disabled={loading || !items.length}>{loading ? 'Placing Order...' : 'Place Order'}</button>
          </aside>
        </form>
      </div>
    </div>
  );
}
