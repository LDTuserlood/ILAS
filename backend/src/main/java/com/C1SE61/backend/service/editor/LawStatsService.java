package com.C1SE61.backend.service.editor;

import com.C1SE61.backend.dto.response.editor.LawStatsResponse;
import com.C1SE61.backend.model.SimplifiedArticle;
import com.C1SE61.backend.model.UserAccount;
import com.C1SE61.backend.repository.SimplifiedArticleRepository;
import com.C1SE61.backend.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LawStatsService {

    private final SimplifiedArticleRepository simplifiedRepo;
    private final UserAccountRepository userRepo;

    public LawStatsResponse getLawStatsData(Integer editorId) {
        UserAccount editor = userRepo.findById(editorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy editor"));

        List<SimplifiedArticle> list = simplifiedRepo.findByEditor_UserId(editorId);

        long pending = list.stream().filter(s -> s.getStatus() == SimplifiedArticle.Status.PENDING).count();
        long rejected = list.stream().filter(s -> s.getStatus() == SimplifiedArticle.Status.REJECTED).count();
        long approved = list.stream().filter(s -> s.getStatus() == SimplifiedArticle.Status.APPROVED).count();

        // Danh sách 5 bài gần nhất
        List<LawStatsResponse.RecentWork> recentWorks = list.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(sa -> new LawStatsResponse.RecentWork(
                        sa.getId(),
                        sa.getArticle().getArticleTitle(),
                        sa.getStatus().name(),
                        sa.getCreatedAt()
                ))
                .collect(Collectors.toList());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        // Gom nhóm các bài theo tháng
        Map<String, List<SimplifiedArticle>> grouped = list.stream()
                .collect(Collectors.groupingBy(sa -> sa.getCreatedAt().format(formatter)));

        List<LawStatsResponse.MonthlyActivity> timeline = grouped.entrySet().stream()
                .map(entry -> {
                    String month = entry.getKey();
                    List<SimplifiedArticle> articles = entry.getValue();

                    long pendingCount = articles.stream().filter(a -> a.getStatus() == SimplifiedArticle.Status.PENDING).count();
                    long rejectedCount = articles.stream().filter(a -> a.getStatus() == SimplifiedArticle.Status.REJECTED).count();
                    long approvedCount = articles.stream().filter(a -> a.getStatus() == SimplifiedArticle.Status.APPROVED).count();

                    return new LawStatsResponse.MonthlyActivity(month, pendingCount, rejectedCount, approvedCount);
                })
                .sorted((a, b) -> a.getMonth().compareTo(b.getMonth()))
                .collect(Collectors.toList());

        // Tạo thống kê tổng
        LawStatsResponse.Stats summaryStats =
                new LawStatsResponse.Stats(pending, rejected, approved);

        return LawStatsResponse.builder()
                .editorName(editor.getFullName() != null ? editor.getFullName() : editor.getUsername())
                .stats(summaryStats)
                .recentWorks(recentWorks)
                .activityTimeline(timeline)
                .build();

    }
}
