import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage, getOrders } from '../services/api';
import './MyOrders.css';

const STEPS = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const label = (value = '') => value.replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrders()
      .then(response => setOrders(response.data || []))
      .catch(err => setError(getApiErrorMessage(err, 'Could not load your orders.')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="my-orders-page">
      <div className="container">
        <div className="orders-page-head">
          <div><span>Delivery tracking</span><h1>My Orders</h1><p>Track every order and view its latest delivery update.</p></div>
          <Link to="/products">Continue shopping</Link>
        </div>

        {loading && <div className="orders-state">Loading your orders…</div>}
        {error && <div className="orders-state error">{error}</div>}
        {!loading && !error && orders.length === 0 && (
          <div className="orders-state"><h2>No orders yet</h2><p>Your placed orders will appear here.</p><Link to="/products">Browse products</Link></div>
        )}

        <div className="customer-orders-list">
          {orders.map(order => {
            let items = [];
            try { items = JSON.parse(order.itemsJson || '[]'); } catch (_) {}
            const cancelled = order.status === 'CANCELLED';
            const currentIndex = STEPS.indexOf(order.status);
            return (
              <article className="customer-order-card" key={order.id}>
                <header>
                  <div><small>Order number</small><h2>#{order.id}</h2></div>
                  <div><small>Placed on</small><strong>{new Date(order.createdAt).toLocaleString('en-IN')}</strong></div>
                  <div className="customer-order-total"><small>Total</small><strong>₹{order.total?.toLocaleString('en-IN')}</strong></div>
                </header>

                <div className={`current-tracking ${cancelled ? 'cancelled' : ''}`}>
                  <span>{cancelled ? 'Order cancelled' : label(order.status)}</span>
                  <p>{order.trackingDetails || 'Order received and awaiting confirmation.'}</p>
                  {order.updatedAt && <small>Updated {new Date(order.updatedAt).toLocaleString('en-IN')}</small>}
                </div>

                {!cancelled && (
                  <div className="tracking-steps">
                    {STEPS.map((step, index) => (
                      <div className={`tracking-step ${index <= currentIndex ? 'complete' : ''} ${index < currentIndex ? 'past' : ''}`} key={step}>
                        <i>{index < currentIndex ? '✓' : index + 1}</i><span>{label(step)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="customer-order-bottom">
                  <div><h3>Items</h3>{items.map((item, index) => <p key={index}>{item.name} × {item.quantity} <strong>₹{item.lineTotal?.toLocaleString('en-IN')}</strong></p>)}</div>
                  <div><h3>Delivering to</h3><p>{order.addressLine1}{order.addressLine2 ? `, ${order.addressLine2}` : ''}</p><p>{order.city}, {order.state} – {order.postalCode}</p></div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
