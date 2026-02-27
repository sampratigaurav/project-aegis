import api from './api';

export const authService = {
    login: async (email, password) => {
        try {
            // OAuth2PasswordRequestForm expects form-encoded data with 'username' field
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await api.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    },

    register: async (name, email, password) => {
        try {
            const response = await api.post('/auth/register', { email, password });
            return response?.data;
        } catch (error) {
            throw error;
        }
    },
};
