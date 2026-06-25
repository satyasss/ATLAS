import axios from 'axios';

const configuredBaseUrl = process.env.REACT_APP_API_URL?.trim();

const normalizeApiBaseUrl = (value) => {
  let baseUrl = (value || 'http://localhost:8080').replace(/\/+$/, '');

  // Accept the Render root URL, /api, or /api/products without creating
  // paths such as /products/products.
  baseUrl = baseUrl.replace(/\/api\/products$/i, '');
  baseUrl = baseUrl.replace(/\/api$/i, '');

  return `${baseUrl}/api`;
};

const API = axios.create({
  baseURL: normalizeApiBaseUrl(configuredBaseUrl),
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getApiErrorMessage = (error, fallback = 'Request failed.') => {
  const responseMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    (typeof error?.response?.data === 'string' ? error.response.data : '');

  if (error?.response?.status === 404) {
    const requestUrl = `${error?.config?.baseURL || ''}${error?.config?.url || ''}`;
    return `API endpoint not found: ${requestUrl}`;
  }
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
