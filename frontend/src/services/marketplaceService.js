import api from './api';

export const marketplaceService = {
    getModels: async () => {
        try {
            const response = await api.get('/marketplace');
            return response?.data;
        } catch (error) {
            throw error;
        }
    },
};
