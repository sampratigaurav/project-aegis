import api from './api';

export const verifyService = {
    verifyModel: async (formData) => {
        try {
            const response = await api.post('/models/verify', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    },
};
