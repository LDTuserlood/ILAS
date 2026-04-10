import axios from "axios";

const API_BASE = "http://localhost:8080/api/chatbot";

// axios instance with defaults for chatbot API
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const sendChatMessage = async (userId, question, saveLog = true) => {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const res = await api.post("/ask", { userId, question, saveLog }, { headers });
    return res.data;
  } catch (err) {
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

export async function getChatHistory(userId) {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API_BASE}/history/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.data;
}


export default {
  sendChatMessage,
};
