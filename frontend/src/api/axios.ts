// Centralized API Service
import axios from 'axios';
import API_URL from '../config';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Crucial for HttpOnly cookies
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // For CSRF protection
    },
});

// Add a response interceptor to handle 401s (expired tokens)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Optional: Redirect to login or clear auth state
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
