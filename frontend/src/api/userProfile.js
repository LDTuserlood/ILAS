import api from "./api";

const handleRequest = async (promise) => {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message || "Lỗi kết nối server" };
  }
};

const userProfileAPI = {
  getProfile: (userId) => handleRequest(api.get(`/users/${userId}`)),

  createProfile: (data) => handleRequest(api.post("/users", data)),

  updateProfile: (userId, data) => handleRequest(api.put(`/users/${userId}`, data)),

  deleteProfile: (userId) => handleRequest(api.delete(`/users/${userId}`)),

  checkEmail: (email, userId = null) => {
    const params = { email };
    if (userId) params.userId = userId;
    return handleRequest(api.get("/users/check-email", { params }));
  },
};

export default userProfileAPI;
