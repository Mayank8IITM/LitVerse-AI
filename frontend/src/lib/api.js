import axios from 'axios';
import Cookies from 'js-cookie';

// Create an Axios instance with base URL pointing to the FastAPI backend
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Global API Limit Handling
    if (error.response) {
      const status = error.response.status;
      const dataStr = JSON.stringify(error.response.data || "").toLowerCase();
      
      const isRateLimit = status === 429 || 
                          (status === 500 && (dataStr.includes('quota') || dataStr.includes('limit') || dataStr.includes('exhausted') || dataStr.includes('429')));
      
      if (isRateLimit) {
        alert("Sorry for the inconvenience. We are using Free APIs and the API limit has been reached. Please try again later!");
      }
    } else if (error.message && error.message.toLowerCase().includes('network error')) {
      console.warn("Network error or CORS issue");
    }
    
    return Promise.reject(error);
  }
);

export default api;
