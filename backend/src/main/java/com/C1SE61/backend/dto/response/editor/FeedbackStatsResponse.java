package com.C1SE61.backend.dto.response.editor;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeedbackStatsResponse {

    private Stats stats;
    private List<RecentFeedback> recent;
    private List<MonthlyStats> monthly;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Stats {
        private long pending;
        private long resolved;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecentFeedback {
        private String content;
        private String articleTitle;
        private String status;
        private String createdAt;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlyStats {
        private String month;
        private long created;
        private long resolved;
    }
}
