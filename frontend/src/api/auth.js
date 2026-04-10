import api from './api';

const authAPI = {
  // Đăng ký
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      // Extract error message from ApiResponse structure
      const errorData = error.response?.data;
      if (errorData?.message) {
        throw new Error(errorData.message);
      } else if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else {
        throw new Error(error.message || 'Đăng ký thất bại');
      }
    }
  },

  // Đăng nhập
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      console.log("Login response:", response.data);
      return response.data;
    } catch (error) {
      // Extract error message from ApiResponse structure
      const errorData = error.response?.data;
      if (errorData?.message) {
        throw new Error(errorData.message);
      } else if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else {
        throw new Error(error.message || 'Đăng nhập thất bại');
      }
    }
  },

  // Lấy thông tin user theo ID
  getUser: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ✅ Lấy thông tin user hiện tại từ token
  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cập nhật thông tin user
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/auth/user/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Đổi mật khẩu
  changePassword: async (userId, currentPassword, newPassword) => {
    try {
      const response = await api.post(`/auth/change-password/${userId}`, {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lưu thông tin user vào localStorage
  saveUserToStorage: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
  },

  // Lấy thông tin user từ localStorage
  getUserFromStorage: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Lấy token từ localStorage
  getToken: () => localStorage.getItem('token'),

  // Xóa thông tin user khỏi localStorage
  clearUserFromStorage: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  // Kiểm tra user đã đăng nhập chưa
  isLoggedIn: () => {
    const user = authAPI.getUserFromStorage();
    const token = authAPI.getToken();
    return user && token;
  },
};

export default authAPI;
