import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('orix_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('orix_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const productsAPI = {
  getAll:      (params) => api.get('/products', { params }),
  getById:     (id)     => api.get(`/products/${id}`),
  getFeatured: ()       => api.get('/products/featured'),
  search:      (q)      => api.get('/products/search', { params: { q } }),
}

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
}

export const ordersAPI = {
  create:      (data) => api.post('/orders', data),
  getMyOrders: ()     => api.get('/orders/my'),
  getById:     (id)   => api.get(`/orders/${id}`),
}

export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe:    ()     => api.get('/auth/me'),
}

export const paymentAPI = {
  initPayme: (orderId) => api.post('/payment/payme/init', { orderId }),
  initClick: (orderId) => api.post('/payment/click/init', { orderId }),
  getStatus: (orderId) => api.get(`/payment/status/${orderId}`),
}

export const smsAPI = {
  sendOTP:   (phone)       => api.post('/sms/otp/send',   { phone }),
  verifyOTP: (phone, code) => api.post('/sms/otp/verify', { phone, code }),
  testSMS:   (phone, msg)  => api.post('/sms/test',       { phone, message: msg }),
}

export const paymentAPIExtra = {
  validate: (code, orderTotal) => api.post('/coupons/validate', { code, orderTotal }),
  apply:    (code, orderId)    => api.post('/coupons/apply',    { code, orderId }),
}

export default api
