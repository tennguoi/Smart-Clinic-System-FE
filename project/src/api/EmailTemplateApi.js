import axiosInstance from '../utils/axiosConfig';

const EmailTemplateApi = {
  getAllTemplates: async () => {
    const response = await axiosInstance.get('/api/admin/email-templates');
    return response.data;
  },

  getTemplateById: async (id) => {
    const response = await axiosInstance.get(`/api/admin/email-templates/${id}`);
    return response.data;
  },

  updateTemplate: async (id, data) => {
    const response = await axiosInstance.put(`/api/admin/email-templates/${id}`, data);
    return response.data;
  },

  resetTemplate: async (id) => {
    const response = await axiosInstance.post(`/api/admin/email-templates/${id}/reset`);
    return response.data;
  }
};

export default EmailTemplateApi;
