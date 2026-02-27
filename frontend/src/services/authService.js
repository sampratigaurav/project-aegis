import api from './api';

export const authService = {
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            return response?.data;
        } catch (error) {
            throw error;
        }
    },

    register: async (name, email, password) => {
        try {
            const response = await api.post('/auth/register', { name, email, password });
            return response?.data;
        } catch (error) {
            throw error;
        }
    },
};
