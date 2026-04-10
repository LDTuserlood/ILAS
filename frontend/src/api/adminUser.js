import api from './api';

const adminUserAPI = {
  list: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  create: async (payload) => {
    try {
      const response = await api.post('/admin/users', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(`/admin/users/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  remove: async (id) => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  toggle: async (id) => {
    try {
      const response = await api.put(`/admin/users/${id}/toggle`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default adminUserAPI;


