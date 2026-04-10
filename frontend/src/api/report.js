import api from "./api";

export const reportAPI = {
  getReport: async (range = "week", reportType = "all") => {
    try {
      const response = await api.get("/admin/reports", {
        params: { range, reportType },
      });
      return response.data;
    } catch (error) {
      console.error("Load report failed", error);
      return { success: false, data: null, message: "Không thể tải báo cáo" };
    }
  },

  exportReport: async (format = "excel", range = "week", reportType = "all") => {
    try {
      const response = await api.get("/admin/reports/export", {
        params: { format, range, reportType },
        responseType: "blob",
      });
      
      // Tạo URL download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report-ilas.${format === "pdf" ? "pdf" : "xlsx"}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: "Xuất báo cáo thành công!" };
    } catch (error) {
      console.error("Export report failed", error);
      return { success: false, message: "Xuất báo cáo thất bại" };
    }
  },
};



