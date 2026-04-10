import React, { createContext, useState, useContext, useEffect } from "react";
import authAPI from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendAvailable, setBackendAvailable] = useState(true);

  // ✅ Khi app load lần đầu, đọc user từ localStorage
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const username = localStorage.getItem("username");
      const fullName = localStorage.getItem("fullName");
      const role = localStorage.getItem("role");

      if (token && userId && role) {
        setUser({ token, userId, username, fullName, role });
      }
      setBackendAvailable(true);
    } catch (err) {
      console.error("❌ Lỗi khi lấy thông tin user:", err);
      setBackendAvailable(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Xử lý đăng nhập
  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const res = await authAPI.login(credentials);

      // Check if response has error structure
      if (res && res.success === false) {
        const message = res.message || "Đăng nhập thất bại";
        setError(message);
        return { success: false, message };
      }

      if (res?.token) {
        // Chuẩn hóa dữ liệu user
        const formattedUser = {
          token: res.token,
          userId: res.userId,
          username: res.username,
          fullName: res.fullName,
          role: res.roleName, // 🔥 Quan trọng
        };

        // Lưu vào localStorage
        localStorage.setItem("token", res.token);
        localStorage.setItem("userId", res.userId);
        localStorage.setItem("username", res.username);
        localStorage.setItem("fullName", res.fullName);
        localStorage.setItem("role", res.roleName);

        // Cập nhật Context state
        setUser(formattedUser);
        setBackendAvailable(true);

        console.log("✅ Đăng nhập thành công:", formattedUser);
        return { success: true, user: formattedUser };
      } else {
        return { success: false, message: "Sai thông tin đăng nhập" };
      }
    } catch (err) {
      console.error("❌ Lỗi login:", err);
      const message = err.message || "Không thể kết nối đến server";
      setError(message);
      setBackendAvailable(false);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Đăng xuất
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("fullName");
    localStorage.removeItem("role");
    setUser(null);
  };

  // ✅ Đăng ký tài khoản
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.register(userData);

      // Check if response has error structure
      if (res && res.success === false) {
        const message = res.message || "Đăng ký thất bại";
        setError(message);
        return { success: false, message };
      }

      if (res?.token) {
        const formattedUser = {
          token: res.token,
          userId: res.userId,
          username: res.username,
          fullName: res.fullName,
          role: res.roleName,
        };

        localStorage.setItem("token", res.token);
        localStorage.setItem("userId", res.userId);
        localStorage.setItem("username", res.username);
        localStorage.setItem("fullName", res.fullName);
        localStorage.setItem("role", res.roleName);

        setUser(formattedUser);
        setBackendAvailable(true);
        return { success: true, user: formattedUser };
      }

      return { success: false, message: "Đăng ký thất bại" };
    } catch (err) {
      const message = err.message || "Không thể kết nối đến server";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cung cấp dữ liệu cho toàn app
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    backendAvailable,
    login,
    logout,
    register,
  };

  console.log("🎯 AuthContext:", {
    user,
    isAuthenticated: !!user,
    backendAvailable,
    loading,
  });

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ✅ Hook tiện lợi cho các component khác
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default AuthContext;
