import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CartCheckout.css';

export default function Cart() {
  const { items, updateQuantity, removeItem, itemCount, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const continueToCheckout = () => navigate(user ? '/checkout' : '/login');

  return (
    <div className="commerce-page">
      <div className="container">
        <div className="commerce-head"><div><h1>Your Cart</h1><p>{itemCount} item{itemCount === 1 ? '' : 's'} ready for checkout</p></div></div>
        {items.length === 0 ? (
          <div className="empty-cart"><h2>Your cart is empty</h2><p>There are far too many useful things in the catalogue for this state to persist.</p><Link className="commerce-btn" to="/products">Browse Products</Link></div>
        ) : (
          <div className="cart-layout">
            <div className="cart-list">
              {items.map(item => (
                <div className="cart-row" key={item.id}>
                  <img src={item.imageUrl || 'https://via.placeholder.com/160x120?text=Product'} alt={item.name} />
                  <div>
                    <h3>{item.name}</h3><p>₹{item.price?.toLocaleString('en-IN')} each</p>
                    <div className="cart-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                      <strong>{item.quantity}</strong>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      <button className="remove" onClick={() => removeItem(item.id)}>Remove</button>
                    </div>
                  </div>
                  <div className="cart-line-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
            <aside className="order-summary">
              <h2>Order Summary</h2>
              <div className="summary-line"><span>Subtotal</span><strong>₹{subtotal.toLocaleString('en-IN')}</strong></div>
              <div className="summary-line"><span>Delivery</span><strong>Calculated at checkout</strong></div>
              <div className="summary-line total"><span>Total</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              <button className="commerce-btn" onClick={continueToCheckout}>{user ? 'Proceed to Checkout' : 'Sign in to Checkout'}</button>
              <Link className="commerce-btn secondary" to="/products">Continue Shopping</Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
