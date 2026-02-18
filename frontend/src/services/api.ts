import axios from 'axios';
import type { ApiResponse } from '../types/api';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor — attach auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 — attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { data } = await axios.post<ApiResponse<{ accessToken: string }>>(
                    `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                if (data.success && data.data) {
                    localStorage.setItem('accessToken', data.data.accessToken);
                    originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
                    return api(originalRequest);
                }
            } catch {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
