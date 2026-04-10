import api from "./api";

export const trackAPI = {
  pageView: async (path) => {
    try {
      await api.post("/track/page-view", null, { params: { path } });
    } catch (e) {
      // ignore tracking errors
    }
  },

  searchLog: async (keyword, searchType = "general") => {
    try {
      if (!keyword || !keyword.trim()) return;
      await api.post("/track/search-log", null, {
        params: { keyword: keyword.trim(), searchType },
      });
    } catch (e) {
      // ignore tracking errors
    }
  },

  getTopSearches: async (limit = 5) => {
    try {
      const response = await api.get("/track/top-searches", {
        params: { limit },
      });
      return response.data;
    } catch (e) {
      return { success: false, data: [] };
    }
  },
};

