import axiosInstance from '../utils/axiosConfig';

const settingService = {
  getSettings: async () => {
    try {
      const response = await axiosInstance.get('/api/settings');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      throw error;
    }
  },

  updateSettings: async (language, theme) => {
    try {
      const response = await axiosInstance.put('/api/settings', {
        language,
        theme
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }
};

export default settingService;
