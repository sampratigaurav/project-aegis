import api from './api';

export const modelService = {
    registerModel: async (formData) => {
        try {
            // Don't set Content-Type manually — axios auto-generates the
            // multipart boundary when it detects a FormData body.
            const response = await api.post('/models/register', formData);
            return response?.data;
        } catch (error) {
            throw error;
        }
    },
};
