import api from './api';

const API_BASE_URL = 'http://localhost:8080/api';

// Get all form templates with pagination
export const getFormTemplates = async (page = 0, size = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching form templates:', error);
    throw error;
  }
};

// Search form templates
export const searchFormTemplates = async (keyword, page = 0, size = 10) => {
  try {
    const url = keyword 
      ? `${API_BASE_URL}/forms/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`
      : `${API_BASE_URL}/forms/search?page=${page}&size=${size}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching form templates:', error);
    throw error;
  }
};

// Get form templates by category
export const getFormTemplatesByCategory = async (category, page = 0, size = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/category/${encodeURIComponent(category)}?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching form templates by category:', error);
    throw error;
  }
};

// Search form templates by category
export const searchFormTemplatesByCategory = async (category, keyword, page = 0, size = 10) => {
  try {
    const url = keyword 
      ? `${API_BASE_URL}/forms/category/${encodeURIComponent(category)}/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`
      : `${API_BASE_URL}/forms/category/${encodeURIComponent(category)}/search?page=${page}&size=${size}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching form templates by category:', error);
    throw error;
  }
};

// Get form template by ID
export const getFormTemplateById = async (templateId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/${templateId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching form template by ID:', error);
    throw error;
  }
};

// Get all categories
export const getFormCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching form categories:', error);
    throw error;
  }
};

// Increment download count
export const incrementDownloadCount = async (templateId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/${templateId}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // API trả về string, không phải JSON
    const data = await response.text();
    return { success: true, message: data };
  } catch (error) {
    console.error('Error incrementing download count:', error);
    throw error;
  }
};

// Get most downloaded templates
export const getMostDownloadedTemplates = async (page = 0, size = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/popular?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching most downloaded templates:', error);
    throw error;
  }
};

// Get recent templates
export const getRecentTemplates = async (page = 0, size = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/recent?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching recent templates:', error);
    throw error;
  }
};

// Normalize a file URL to make sure it's absolute and points to the backend host
const resolveFileUrl = (fileUrl) => {
  if (!fileUrl) return null;

  // Already absolute
  try {
    new URL(fileUrl);
    return fileUrl;
  } catch (_) {
    // not absolute -> build from backend base (strip trailing /api if present)
    const backendBase = API_BASE_URL.replace(/\/api$/, "");
    return `${backendBase}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
  }
};

// Download file
export const downloadFile = async (fileUrl, fileName) => {
  const normalizedUrl = resolveFileUrl(fileUrl);
  if (!normalizedUrl) throw new Error("No file URL provided");

  try {
    // Fetch as blob to avoid CORS/download attribute issues
    const response = await fetch(normalizedUrl, { method: "GET" });
    if (!response.ok) {
      throw new Error(`Failed to download file (status ${response.status})`);
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName || normalizedUrl.split("/").pop() || "form.docx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);

    return true;
  } catch (error) {
    console.error("Error downloading file:", error);

    // Fallback - open in new tab
    window.open(normalizedUrl, "_blank");
    return true;
  }
};

// Preview file
export const previewFile = async (fileUrl, fileName) => {
  try {
    const normalizedUrl = resolveFileUrl(fileUrl);
    if (!normalizedUrl) {
      throw new Error("No file URL provided");
    }

    // For DOCX files, use Google Docs viewer
    if (normalizedUrl.includes(".docx") || normalizedUrl.includes(".doc")) {
      const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(normalizedUrl)}&embedded=true`;
      window.open(googleDocsUrl, "_blank");
    }
    // For PDF files, open directly
    else if (normalizedUrl.includes(".pdf")) {
      window.open(normalizedUrl, "_blank");
    }
    // For other file types, try to open directly
    else {
      window.open(normalizedUrl, "_blank");
    }

    return true;
  } catch (error) {
    console.error("Error previewing file:", error);
    throw error;
  }
};
// ===========================================================
// 🆕 PHẦN DÀNH RIÊNG CHO MODERATOR FORM TEMPLATE (biên tập viên)
// ===========================================================

// 🟢 Lấy danh sách biểu mẫu của moderator
export const getFormsByModerator = async (moderatorId) => {
  try {
    const response = await api.get(`/moderator/form-templates/${moderatorId}`);
    return { data: response.data };
  } catch (error) {
    console.error("❌ Lỗi getFormsByModerator:", error);
    throw error;
  }
};

// 🟢 Tạo biểu mẫu mới
export const createForm = async (moderatorId, formData) => {
  try {
    const response = await api.post(`/moderator/form-templates/${moderatorId}`, formData);
    return { data: response.data };
  } catch (error) {
    console.error("❌ Lỗi createForm:", error);
    throw error;
  }
};

// 🟢 Cập nhật biểu mẫu
export const updateForm = async (id, formData) => {
  try {
    const response = await api.put(`/moderator/form-templates/${id}`, formData);
    return { data: response.data };
  } catch (error) {
    console.error("❌ Lỗi updateForm:", error);
    throw error;
  }
};

// 🟢 Đăng biểu mẫu (hiển thị cho user)
export const publishForm = async (id) => {
  try {
    const response = await api.put(`/moderator/form-templates/${id}/publish`);
    return { data: response.data };
  } catch (error) {
    console.error("❌ Lỗi publishForm:", error);
    throw error;
  }
};

// 🟢 Ẩn biểu mẫu khỏi user
export const hideForm = async (id) => {
  try {
    const response = await api.put(`/moderator/form-templates/${id}/hide`);
    return { data: response.data };
  } catch (error) {
    console.error("❌ Lỗi hideForm:", error);
    throw error;
  }
};

// 🟢 Xóa biểu mẫu
export const deleteForm = async (id) => {
  try {
    await api.delete(`/moderator/form-templates/${id}`);

    return true;
  } catch (error) {
    console.error("❌ Lỗi deleteForm:", error);
    throw error;
  }
};

// 🟢 Upload file đính kèm
export const uploadFormFile = async (moderatorId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(`/moderator/form-templates/${moderatorId}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return { data: response.data };
  } catch (error) {
    console.error("❌ Lỗi uploadFormFile:", error);
    throw error;
  }
};




















