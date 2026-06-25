import axios from 'axios';

const configuredBaseUrl = process.env.REACT_APP_API_URL?.trim();

const API = axios.create({
  baseURL: (configuredBaseUrl || 'http://localhost:8080/api').replace(/\/+$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getApiErrorMessage = (error, fallback = 'Request failed.') => {
  const responseMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    (typeof error?.response?.data === 'string' ? error.response.data : '');

  if (responseMessage) return responseMessage;
  if (error?.code === 'ERR_NETWORK') {
    return 'Cannot reach the server. Check REACT_APP_API_URL and the Render service.';
  }
  return error?.message || fallback;
};

export const getAllProducts      = ()           => API.get('/products');
export const getProductsBySector = (sector)     => API.get(`/products/sector/${sector}`);
export const createProduct       = (data)       => API.post('/products', data);
export const updateProduct       = (id, data)   => API.put(`/products/${id}`, data);
export const deleteProduct       = (id)         => API.delete(`/products/${id}`);
