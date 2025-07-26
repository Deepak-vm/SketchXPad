import axios from 'axios';
import { HTTP_URL } from "../config";

const api = axios.create({
    baseURL: HTTP_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for auth tokens if needed
api.interceptors.request.use(
    (config) => {
        // Add auth token if exists
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;