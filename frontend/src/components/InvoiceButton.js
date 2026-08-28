import React from 'react';
import './InvoiceButton.css';

const money = value => Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const text = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

const paymentLabel = method => ({
  QR_PAYMENT: 'Online QR Payment',
  UPI_ON_DELIVERY: 'UPI on Delivery',
  COD: 'Cash on Delivery'
}[method] || method || 'Not specified');

const getItems = order => {
  if (Array.isArray(order.items)) return order.items;
  try { return JSON.parse(order.itemsJson || '[]'); } catch (_) { return []; }
};

export default function InvoiceButton({ order, className = '' }) {
  const printInvoice = () => {
    const items = getItems(order);
    const orderId = order.id || order.orderId;
    const rows = items.map(item => `
      <tr><td>${text(item.name)}</td><td class="number">${text(item.quantity)}</td><td class="number">&#8377;${money(item.price)}</td><td class="number">&#8377;${money(item.lineTotal ?? item.price * item.quantity)}</td></tr>
    `).join('');
    const address = [order.addressLine1, order.addressLine2, order.city, order.state, order.postalCode].filter(Boolean).map(text).join(', ');
    const invoice = window.open('', '_blank', 'width=900,height=720');
    if (!invoice) {
      window.alert('Please allow pop-ups to open and print the invoice.');
      return;
    }
    invoice.document.write(`<!doctype html><html><head><title>Atlas Invoice ${text(orderId)}</title><style>
      *{box-sizing:border-box}body{margin:0;padding:36px;color:#172033;font:14px Arial,sans-serif}.invoice{max-width:800px;margin:auto}
      header{display:flex;justify-content:space-between;gap:24px;padding-bottom:24px;border-bottom:3px solid #0b4a9f}.brand{font-size:25px;font-weight:800;color:#0b4a9f}.title{text-align:right}.title h1{margin:0;color:#061b44}.muted{color:#64748b}
      .details{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin:28px 0}.details h2{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#64748b}.details p{margin:5px 0;line-height:1.5}
      table{width:100%;border-collapse:collapse}th,td{padding:12px;border-bottom:1px solid #dce6f3;text-align:left}th{background:#eff6ff;color:#0b4a9f;font-size:12px;text-transform:uppercase}.number{text-align:right}.total{font-size:20px;font-weight:800;color:#061b44;text-align:right;margin-top:20px}
      footer{margin-top:44px;padding-top:18px;border-top:1px solid #dce6f3;text-align:center;color:#64748b;font-size:12px}.actions{text-align:center;margin:28px}.actions button{border:0;border-radius:8px;padding:12px 20px;background:#0b4a9f;color:white;font-weight:700;cursor:pointer}
      @media print{body{padding:0}.actions{display:none}}@page{margin:18mm}
    </style></head><body><main class="invoice">
      <header><div><div class="brand">ATLAS SERVICES</div><div class="muted">Order invoice</div></div><div class="title"><h1>INVOICE</h1><p><strong>#${text(orderId)}</strong><br><span class="muted">${text(new Date(order.createdAt).toLocaleString('en-IN'))}</span></p></div></header>
      <section class="details"><div><h2>Bill to</h2><p><strong>${text(order.fullName)}</strong><br>${text(order.customerEmail)}<br>${text(order.phone)}<br>${address}</p></div><div><h2>Payment & order</h2><p>Payment: <strong>${text(paymentLabel(order.paymentMethod))}</strong><br>Status: <strong>${text(order.status)}</strong>${order.transactionId ? `<br>Transaction ID: <strong>${text(order.transactionId)}</strong>` : ''}</p></div></section>
      <table><thead><tr><th>Item</th><th class="number">Qty</th><th class="number">Price</th><th class="number">Amount</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="total">Total: &#8377;${money(order.total)}</div>
      <footer>Thank you for choosing Atlas Services.</footer><div class="actions"><button onclick="window.print()">Print / Save as PDF</button></div>
    </main></body></html>`);
    invoice.document.close();
    invoice.focus();
  };

  return <button type="button" className={`invoice-button ${className}`.trim()} onClick={printInvoice}>Invoice / PDF</button>;
}
