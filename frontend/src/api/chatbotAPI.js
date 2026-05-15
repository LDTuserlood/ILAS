import axios from "axios";

const isLocalDev =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") &&
  window.location.port === "3000";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  (isLocalDev ? "http://localhost:8080/api/chatbot" : "/api/chatbot");

// axios instance with defaults for chatbot API
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

export const sendChatMessage = async (userId, question, saveLog = true, conversationId = null) => {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const payload = { userId, question, saveLog, conversationId };

  try {
    const res = await api.post("/ask", payload, { headers });
    return res.data;
  } catch (err) {
    if (err.response?.status === 403) {
      try {
        const retry = await api.post("/ask", payload);
        return retry.data;
      } catch (retryErr) {
        console.error("sendChatMessage retry error:", {
          status: retryErr.response?.status,
          data: retryErr.response?.data,
          originalError: retryErr.message,
        });
      }
    }

    // Log detailed info for debugging 403s
    console.error("sendChatMessage error:", {
      status: err.response?.status,
      data: err.response?.data,
      headersSent: headers,
      originalError: err.message,
    });
    throw err;
  }
};

export const sendChatFeedback = async (chatId, feedbackStatus, reason = "") => {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const payload = { feedbackStatus, reason };

  const res = await api.post(`/logs/${chatId}/feedback`, payload, { headers });
  return res.data;
};

export async function getChatHistory(userId) {
  const token = localStorage.getItem("token");

  const res = await api.get(`/history/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.data;
}

export async function clearChatHistory(userId) {
  const token = localStorage.getItem("token");

  try {
    const res = await api.delete(`/history/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (err) {
    if (err?.response?.status === 403) {
      const res = await api.post(
        `/history/${userId}/clear`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return res.data;
    }
    throw err;
  }
}


const chatbotAPI = {
  sendChatMessage,
  sendChatFeedback,
};

export default chatbotAPI;
