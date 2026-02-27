import api from './api';

export const modelService = {
    registerModel: async (formData) => {
        try {
            const response = await api.post('/models/register', formData, {
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
