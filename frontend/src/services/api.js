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

API.interceptors.request.use((config) => {
  try {
    const session = JSON.parse(localStorage.getItem('atlas_user') || 'null');
    if (session?.token) config.headers.Authorization = `Bearer ${session.token}`;
  } catch {
    // Ignore a malformed local session; the backend will reject protected calls.
  }
  return config;
});

API.interceptors.response.use(
  response => response,
  error => {
    if (error?.response?.status === 401 && !error?.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('atlas_user');
    }
    return Promise.reject(error);
  }
);

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

export const sendRegistrationOtp = (email)      => API.post('/auth/registration-otp', { email });
export const registerUser        = (data)       => API.post('/auth/register', data);
export const loginUser           = (data)       => API.post('/auth/login', data);
export const sendSellerOtp       = (email)      => API.post('/auth/seller-registration-otp', { email });
export const registerSellerApi   = (data)       => API.post('/auth/register-seller', data);
export const sendPasswordOtp     = (email)      => API.post('/auth/forgot-password-otp', { email });
export const resetPassword       = (data)       => API.post('/auth/reset-password', data);

export const createOrder         = (data)       => API.post('/orders', data);
export const getOrders           = (email)      => API.get('/orders', { params: { email } });
export const getAllSellers       = ()           => API.get('/sellers');
export const updateSellerStatus  = (id, status, reason = '') => API.put(`/sellers/${id}/status`, { status, reason });
export const getApprovedSellers  = ()           => API.get('/sellers/approved');
