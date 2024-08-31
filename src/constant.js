const API_BASE_URL = 'http://localhost:3002'; // Your backend URL

const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
})

export { API_BASE_URL, getHeaders };