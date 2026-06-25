import React, { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);
const CART_KEY = 'atlas_cart';

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  const save = (next) => {
    setItems(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  };

  const addItem = (product) => {
    if (!product || product.stock === 0) return;
    const existing = items.find(item => item.id === product.id);
    const quantity = Math.min((existing?.quantity || 0) + 1, product.stock || 1);
    save(existing
      ? items.map(item => item.id === product.id ? { ...item, quantity } : item)
      : [...items, { ...product, quantity: 1 }]
    );
  };

  const updateQuantity = (id, quantity) => {
    const product = items.find(item => item.id === id);
    if (!product) return;
    const safeQuantity = Math.max(1, Math.min(Number(quantity) || 1, product.stock || 1));
    save(items.map(item => item.id === id ? { ...item, quantity: safeQuantity } : item));
  };

  const removeItem = (id) => save(items.filter(item => item.id !== id));
  const clearCart = () => save([]);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
