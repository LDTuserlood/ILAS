import api from './api';

const feedbackAPI = {
  /**
   * Gửi feedback mới
   * @param {Object} data - { content, lawId?, articleId?, userId? }
   */
  createFeedback: async (data) => {
    try {
      const response = await api.post('/feedback', data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể gửi phản hồi',
      };
    }
  },

  /**
   * Lấy tất cả feedback (Admin/Editor)
   */
  getAllFeedbacks: async (page = 0, size = 10) => {
    try {
      const response = await api.get(`/feedback?page=${page}&size=${size}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy danh sách phản hồi',
      };
    }
  },

  /**
   * Lấy feedback theo trạng thái (Admin/Editor)
   */
  getFeedbacksByStatus: async (status, page = 0, size = 10) => {
    try {
      const response = await api.get(`/feedback/status/${status}?page=${page}&size=${size}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy phản hồi theo trạng thái',
      };
    }
  },

  /**
   * Lấy feedback theo user ID
   */
  getFeedbacksByUserId: async (userId) => {
    try {
      const response = await api.get(`/feedback/user/${userId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy phản hồi của user',
      };
    }
  },

  /**
   * Cập nhật trạng thái feedback (Admin/Editor)
   */
  updateFeedbackStatus: async (feedbackId, status) => {
    try {
      const response = await api.put(`/feedback/${feedbackId}/status?status=${status}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái phản hồi',
      };
    }
  },
};

export { feedbackAPI };

