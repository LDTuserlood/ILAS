import api from './api';


// API functions
export const authAPI = {
  // Đăng ký
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Đăng nhập
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cập nhật profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Đổi password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Xác thực token
  validateToken: async (token) => {
    try {
      const response = await api.post('/auth/validate', { token });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Law API functions
export const lawAPI = {
  // Tìm kiếm luật
  searchLaws: async (keyword, page = 0, size = 10) => {
    try {
      const response = await api.get('/laws/search', {
        params: { keyword, page, size }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy danh sách luật
  getAllLaws: async (page = 0, size = 10) => {
    try {
      const response = await api.get('/laws', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy thông tin luật theo ID
  getLawById: async (id) => {
    try {
      const response = await api.get(`/laws/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy thông tin luật theo code
  getLawByCode: async (code) => {
    try {
      const response = await api.get(`/laws/code/${code}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Tìm kiếm articles
  searchArticles: async (keyword, page = 0, size = 10) => {
    try {
      const response = await api.get('/laws/articles/search', {
        params: { keyword, page, size }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Tìm kiếm articles trong một luật
  searchArticlesInLaw: async (lawId, keyword, page = 0, size = 10) => {
    try {
      const response = await api.get(`/laws/${lawId}/articles/search`, {
        params: { keyword, page, size }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy danh sách articles của một luật
  getArticlesByLawId: async (lawId) => {
    try {
      const response = await api.get(`/laws/${lawId}/articles`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy tất cả articles (active) với phân trang
  getAllArticles: async (page = 0, size = 10) => {
    try {
      const response = await api.get('/laws/articles', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy thông tin article theo ID
  getArticleById: async (id) => {
    try {
      const response = await api.get(`/laws/articles/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Tìm kiếm article theo số điều
  getArticlesByLawIdAndArticleNumber: async (lawId, articleNumber) => {
    try {
      const response = await api.get(`/laws/${lawId}/articles/number/${articleNumber}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Tìm kiếm tổng hợp
  searchAll: async (keyword, page = 0, size = 10) => {
    try {
      const response = await api.get('/laws/search-all', {
        params: { keyword, page, size }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Tìm kiếm nâng cao cho luật
  

  // Tìm kiếm articles với ranking theo relevance
  searchArticlesWithRelevance: async (keyword, page = 0, size = 10) => {
    try {
      const response = await api.get('/laws/articles/search-relevance', {
        params: { keyword, page, size }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },


  // Tìm kiếm theo số điều chính xác
  searchByArticleNumber: async (articleNumber, page = 0, size = 10) => {
    try {
      const response = await api.get(`/laws/articles/number/${articleNumber}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Tìm kiếm theo chương
  searchByChapter: async (chapterId, page = 0, size = 10) => {
    try {
      const response = await api.get(`/laws/articles/chapter/${chapterId}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Tìm kiếm luật theo loại văn bản
  searchLawsByType: async (lawType, page = 0, size = 10) => {
    try {
      const response = await api.get(`/laws/type/${lawType}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Tìm kiếm luật theo khoảng thời gian ban hành
  searchLawsByIssuedDateRange: async (startDate, endDate, page = 0, size = 10) => {
    try {
      const response = await api.get('/laws/issued-date', {
        params: { startDate, endDate, page, size }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Tìm kiếm luật theo khoảng thời gian có hiệu lực
  searchLawsByEffectiveDateRange: async (startDate, endDate, page = 0, size = 10) => {
    try {
      const response = await api.get('/laws/effective-date', {
        params: { startDate, endDate, page, size }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy giải thích điều luật (simplified article) - chỉ lấy bài đã được APPROVED
  getSimplifiedArticle: async (articleId) => {
    try {
      const response = await api.get(`/laws/articles/${articleId}/simplified`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Editor Law Management API
export const editorLawManagementAPI = {
  list: async (keyword, page = 0, size = 10) => {
    try {
      const response = await api.get('/editor/laws', {
        params: { keyword, page, size }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  create: async (payload) => {
    const response = await api.post('/editor/laws', payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await api.put(`/editor/laws/${id}`, payload);
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`/editor/laws/${id}`);
    return response.data;
  }
};

// Backward compatibility alias
export const adminLawAPI = editorLawManagementAPI;

// Editor Simplified Management API
export const editorSimplifiedManagementAPI = {
  list: async (status = 'PENDING', page = 0, size = 10) => {
    const response = await api.get('/editor/simplified-management', {
      params: { status, page, size }
    });
    return response.data;
  },
  approve: async (id) => {
    const response = await api.put(`/editor/simplified-management/${id}/approve`);
    return response.data;
  },
  reject: async (id) => {
    const response = await api.put(`/editor/simplified-management/${id}/reject`);
    return response.data;
  }
};

// Backward compatibility alias
export const adminSimplifiedAPI = editorSimplifiedManagementAPI;

export default api;







