package com.C1SE61.backend.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private PeriodInfo period;
    private Summary stats;
    private List<DailyMetric> weeklyData;
    private List<CategoryShare> categoryDistribution;
    private List<TopContentItem> topContents;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PeriodInfo {
        private String range;
        private LocalDateTime start;
        private LocalDateTime end;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private long totalUsers;
        private long totalContent;
        private long totalForms;
        private long totalFeedback;

        private long newUsers;
        private long newContent;
        private long newForms;
        private long newFeedback;

        private double usersChange;
        private double contentChange;
        private double formsChange;
        private double feedbackChange;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyMetric {
        private String label;
        private long users;
        private long content;
        private long forms;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryShare {
        private String name;
        private long value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopContentItem {
        private String title;
        private long views;
        private long downloads;
    }
}


