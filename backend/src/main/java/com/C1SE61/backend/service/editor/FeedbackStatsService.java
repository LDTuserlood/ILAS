package com.C1SE61.backend.service.editor;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import com.C1SE61.backend.model.Feedback;
import com.C1SE61.backend.repository.FeedbackRepository;
import com.C1SE61.backend.dto.response.editor.FeedbackStatsResponse;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackStatsService {

    private final FeedbackRepository feedbackRepo;

    public FeedbackStatsResponse getStats(Integer editorId) {

        FeedbackStatsResponse response = new FeedbackStatsResponse();

        // 1) Load toàn bộ feedback editor phụ trách
        List<Feedback> list = feedbackRepo.findFeedbackByEditor(editorId);

        // 2) Summary
        long pending = list.stream().filter(f -> f.getStatus() == Feedback.Status.PENDING).count();
        long resolved = list.stream().filter(f -> f.getStatus() == Feedback.Status.RESOLVED).count();
        response.setStats(new FeedbackStatsResponse.Stats(pending, resolved));

        // 3) Recent
        var recent = list.stream()
                .sorted(Comparator.comparing(Feedback::getCreatedAt).reversed())
                .limit(5)
                .map(f -> new FeedbackStatsResponse.RecentFeedback(
                        f.getContent(),
                        f.getArticle() != null ? f.getArticle().getArticleTitle() : "(Không có điều)",
                        f.getStatus().name(),
                        f.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
                ))
                .collect(Collectors.toList());
        response.setRecent(recent);

        // 4) Monthly chart
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MM/yyyy");
        Map<String, Map<String, Long>> grouped = new TreeMap<>();

        for (Feedback f : list) {
            String month = f.getCreatedAt().format(fmt);
            grouped.putIfAbsent(month, new HashMap<>());
            var m = grouped.get(month);

            if (f.getStatus() == Feedback.Status.PENDING)
                m.put("created", m.getOrDefault("created", 0L) + 1);
            else
                m.put("resolved", m.getOrDefault("resolved", 0L) + 1);
        }

        var monthly = grouped.entrySet().stream()
                .map(e -> new FeedbackStatsResponse.MonthlyStats(
                        e.getKey(),
                        e.getValue().getOrDefault("created", 0L),
                        e.getValue().getOrDefault("resolved", 0L)
                ))
                .collect(Collectors.toList());

        response.setMonthly(monthly);

        return response;
    }
}
