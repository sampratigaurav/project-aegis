import axios from 'axios';

if (!import.meta.env.VITE_API_URL) {
    console.warn('⚠️ VITE_API_URL is missing from environment variables. API calls may fail.');
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 180000,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('aegis_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const formattedError = {
            message: 'An unexpected error occurred.',
            status: error.response?.status || 0,
            originalError: error,
        };

        if (error.response) {
            formattedError.message = error.response.data?.detail || error.response.data?.message || error.response.statusText;

            // On 401, just clear the token. Do NOT redirect.
            // ProtectedRoute will handle redirect naturally on next render.
            if (error.response.status === 401) {
                localStorage.removeItem('aegis_token');
            }
        } else if (error.request) {
            formattedError.message = 'Network error. Please check your connection or try again.';
        } else {
            formattedError.message = error.message;
        }

        return Promise.reject(formattedError);
    }
);

export default api;
