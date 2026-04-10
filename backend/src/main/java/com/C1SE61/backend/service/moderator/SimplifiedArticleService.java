package com.C1SE61.backend.service.moderator;

import com.C1SE61.backend.dto.response.moderator.SimplifiedArticleResponseDTO;
import com.C1SE61.backend.model.*;
import com.C1SE61.backend.repository.*;
import com.C1SE61.backend.service.log.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Comparator;


@Service
@RequiredArgsConstructor
public class SimplifiedArticleService {

    private final SimplifiedArticleRepository simplifiedRepo;
    private final ArticleRepository articleRepo;
    private final UserAccountRepository userRepo;
    private final AuditLogService auditLogService;

    /**
     * Create or update simplified article and publish immediately.
     * Moderator submits are auto-approved (no admin approval queue).
     */
    public SimplifiedArticle createOrUpdateSimplified(
            Integer articleId,
            Integer moderatorId,
            String category,
            String content
    ) {

        Article article = articleRepo.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        UserAccount moderator = userRepo.findById(moderatorId)
                .orElseThrow(() -> new RuntimeException("Moderator not found"));

        Optional<SimplifiedArticle> existingOpt =
                simplifiedRepo.findByArticle_ArticleIdAndModerator_UserId(articleId, moderatorId);

        SimplifiedArticle sa;

        if (existingOpt.isPresent()) {

            sa = existingOpt.get();

            // Always allow moderator to update their own simplified draft.
            sa.setCategory(category);
            sa.setContentSimplified(content);

            // Direct publish after edit.
            sa.setStatus(SimplifiedArticle.Status.APPROVED);

            // cập nhật thời gian gửi lại
            sa.setCreatedAt(LocalDateTime.now());

        } else {
            // Không có bản nào → Tạo mới
            sa = SimplifiedArticle.builder()
                    .article(article)
                    .moderator(moderator)
                    .category(category)
                    .contentSimplified(content)
                    .status(SimplifiedArticle.Status.APPROVED)
                    .createdAt(LocalDateTime.now())
                    .build();
        }

        SimplifiedArticle saved = simplifiedRepo.save(sa);
        try {
            // Log action by moderator (include article title)
            String action = existingOpt.isPresent() ? "Cập nhật bản rút gọn" : "Tạo bản rút gọn";
            String title = article.getArticleTitle() == null ? "" : article.getArticleTitle();
            // limit title length to avoid excessively long logs
            if (title.length() > 200) title = title.substring(0, 200) + "...";
            // Set detail to article title only so dashboard shows: "Tạo bản rút gọn - {articleTitle}"
            String detail = title;
            auditLogService.log(action, detail, saved.getModerator());
        } catch (Exception ignored) {}
        return saved;
    }


    // Lấy bản rút gọn của article (trả về approved nếu có)
    public Optional<SimplifiedArticleResponseDTO> getByArticleId(Integer articleId) {
        List<SimplifiedArticle> list = simplifiedRepo.findByArticle_ArticleId(articleId);
        if (list.isEmpty()) return Optional.empty();

        // Ưu tiên bản được duyệt
        SimplifiedArticle approved = list.stream()
                .filter(sa -> sa.getStatus() == SimplifiedArticle.Status.APPROVED)
                .findFirst()
                .orElse(null);

        if (approved != null)
            return Optional.of(SimplifiedArticleResponseDTO.fromEntity(approved));

        // Không có APPROVED → trả bản mới nhất
        SimplifiedArticle latest = list.stream()
                .max(Comparator.comparing(SimplifiedArticle::getCreatedAt))
                .orElse(null);

        return Optional.ofNullable(SimplifiedArticleResponseDTO.fromEntity(latest));
    }

    // Lấy danh sách bài của Moderator
    public List<SimplifiedArticleResponseDTO> getByModerator(Integer moderatorId) {
        return simplifiedRepo.findByModerator_UserId(moderatorId)
                .stream()
                .sorted(Comparator.comparing(SimplifiedArticle::getCreatedAt).reversed())
                .map(SimplifiedArticleResponseDTO::fromEntity)
                .toList();
    }

    public SimplifiedArticleResponseDTO approveOne(Integer simplifiedId, Integer moderatorId) {
        SimplifiedArticle target = simplifiedRepo.findById(simplifiedId)
                .orElseThrow(() -> new RuntimeException("Simplified article not found"));

        if (!target.getModerator().getUserId().equals(moderatorId)) {
            throw new RuntimeException("You are not allowed to approve this simplified article");
        }

        // Ensure only one APPROVED simplified version is visible per article.
        List<SimplifiedArticle> approvedSameArticle =
                simplifiedRepo.findByArticle_ArticleIdAndStatus(
                        target.getArticle().getArticleId(),
                        SimplifiedArticle.Status.APPROVED
                );

        List<SimplifiedArticle> changed = new ArrayList<>();
        for (SimplifiedArticle item : approvedSameArticle) {
            if (!item.getId().equals(target.getId())) {
                item.setStatus(SimplifiedArticle.Status.ARCHIVED);
                changed.add(item);
            }
        }

        target.setStatus(SimplifiedArticle.Status.APPROVED);
        changed.add(target);
        simplifiedRepo.saveAll(changed);

        return SimplifiedArticleResponseDTO.fromEntity(target);
    }

    public int approveAll(Integer moderatorId) {
        List<SimplifiedArticle> mine = simplifiedRepo.findByModerator_UserId(moderatorId);
        int updated = 0;

        for (SimplifiedArticle item : mine) {
            if (item.getStatus() != SimplifiedArticle.Status.APPROVED) {
                approveOne(item.getId(), moderatorId);
                updated++;
            }
        }

        return updated;
    }

    public int hideAllFromUser(Integer moderatorId) {
        List<SimplifiedArticle> mine = simplifiedRepo.findByModerator_UserId(moderatorId);
        int updated = 0;

        for (SimplifiedArticle item : mine) {
            if (item.getStatus() != SimplifiedArticle.Status.ARCHIVED) {
                item.setStatus(SimplifiedArticle.Status.ARCHIVED);
                updated++;
            }
        }

        if (!mine.isEmpty()) {
            simplifiedRepo.saveAll(mine);
        }

        return updated;
    }

    public SimplifiedArticleResponseDTO hideFromUser(Integer simplifiedId, Integer moderatorId) {
        SimplifiedArticle target = simplifiedRepo.findById(simplifiedId)
                .orElseThrow(() -> new RuntimeException("Simplified article not found"));

        if (!target.getModerator().getUserId().equals(moderatorId)) {
            throw new RuntimeException("You are not allowed to update this simplified article");
        }

        target.setStatus(SimplifiedArticle.Status.ARCHIVED);
        SimplifiedArticle saved = simplifiedRepo.save(target);
        return SimplifiedArticleResponseDTO.fromEntity(saved);
    }
}

