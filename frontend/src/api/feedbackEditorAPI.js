import api from "./api";

export const getAllFeedbackEditor = async () => {
  const res = await api.get("/editor/feedback");
  return res.data; 
};

export const markFeedbackForwarded = async (id) => {
  const res = await api.post(`/editor/feedback/${id}/forward`);
  return res.data;
};

export const markFeedbackResolved = async (id) => {
  try {
    const res = await api.post(`/editor/feedback/${id}/resolve`);
    return res.data;
  } catch (error) {
    // Fallback for legacy endpoint using PUT in some environments
    const res = await api.put(`/editor/feedback/${id}/resolve`);
    return res.data;
  }
};
