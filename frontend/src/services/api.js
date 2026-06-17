import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
});

export const getAllProducts      = ()           => API.get('/products');
export const getProductsBySector = (sector)     => API.get(`/products/sector/${sector}`);
export const createProduct       = (data)       => API.post('/products', data);
export const updateProduct       = (id, data)   => API.put(`/products/${id}`, data);
export const deleteProduct       = (id)         => API.delete(`/products/${id}`);
