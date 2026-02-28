import axios from 'axios';

if (!import.meta.env.VITE_API_URL) {
    console.warn('⚠️ VITE_API_URL is missing from environment variables. API calls may fail.');
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 180000, // 3 minutes — blockchain transactions can take 30-120s
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
        // Graceful formatting
        const formattedError = {
            message: 'An unexpected error occurred.',
            status: error.response?.status || 500,
            originalError: error,
        };

        if (error.response) {
            // The request was made and the server responded with a status code outside 2xx
            formattedError.message = error.response.data?.detail || error.response.data?.message || error.response.statusText;

            // Handle 401 Unauthorized globally
            if (error.response.status === 401) {
                localStorage.removeItem('aegis_token');
                // Only redirect if we're on a protected page (not during upload/verify flows)
                const path = window.location.pathname;
                if (path !== '/login' && path !== '/signup') {
                    // Use setTimeout to avoid interrupting ongoing error handling
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 100);
                }
            }
        } else if (error.request) {
            // The request was made but no response was received
            formattedError.message = 'Network error. Please check your connection.';
        } else {
            // Something happened in setting up the request
            formattedError.message = error.message;
        }

        return Promise.reject(formattedError);
    }
);

export default api;
