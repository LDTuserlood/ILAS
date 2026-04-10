package com.C1SE61.backend.dto.response.editor;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LawStatsResponse {
    private String editorName;
    private Stats stats;
    private List<RecentWork> recentWorks;
    private List<MonthlyActivity> activityTimeline;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Stats {
        private long pending;
        private long rejected;
        private long approved;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecentWork {
        private Integer id;
        private String articleTitle;
        private String status;
        private LocalDateTime createdAt;
    }
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlyActivity {
        private String month; 
        private long pendingCount;
        private long rejectedCount;
        private long approvedCount;
    }
}
