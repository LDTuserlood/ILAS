package com.C1SE61.backend.service.editor;

import com.C1SE61.backend.dto.response.editor.SimplifiedArticleResponseDTO;
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
     * Editor submits are auto-approved (no admin approval queue).
     */
    public SimplifiedArticle createOrUpdateSimplified(
            Integer articleId,
            Integer editorId,
            String category,
            String content
    ) {

        Article article = articleRepo.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        UserAccount editor = userRepo.findById(editorId)
                .orElseThrow(() -> new RuntimeException("Editor not found"));

        Optional<SimplifiedArticle> existingOpt =
                simplifiedRepo.findByArticle_ArticleIdAndEditor_UserId(articleId, editorId);

        SimplifiedArticle sa;

        if (existingOpt.isPresent()) {

            sa = existingOpt.get();

            // Always allow editor to update their own simplified draft.
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
                    .editor(editor)
                    .category(category)
                    .contentSimplified(content)
                    .status(SimplifiedArticle.Status.APPROVED)
                    .createdAt(LocalDateTime.now())
                    .build();
        }

        SimplifiedArticle saved = simplifiedRepo.save(sa);
        try {
            // Log action by editor (include article title)
            String action = existingOpt.isPresent() ? "Cập nhật bản rút gọn" : "Tạo bản rút gọn";
            String title = article.getArticleTitle() == null ? "" : article.getArticleTitle();
            // limit title length to avoid excessively long logs
            if (title.length() > 200) title = title.substring(0, 200) + "...";
            // Set detail to article title only so dashboard shows: "Tạo bản rút gọn - {articleTitle}"
            String detail = title;
            auditLogService.log(action, detail, saved.getEditor());
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

    // Lấy danh sách bài của Editor
    public List<SimplifiedArticleResponseDTO> getByEditor(Integer editorId) {
        return simplifiedRepo.findByEditor_UserId(editorId)
                .stream()
                .sorted(Comparator.comparing(SimplifiedArticle::getCreatedAt).reversed())
                .map(SimplifiedArticleResponseDTO::fromEntity)
                .toList();
    }

    public SimplifiedArticleResponseDTO approveOne(Integer simplifiedId, Integer editorId) {
        SimplifiedArticle target = simplifiedRepo.findById(simplifiedId)
                .orElseThrow(() -> new RuntimeException("Simplified article not found"));

        if (!target.getEditor().getUserId().equals(editorId)) {
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

    public int approveAll(Integer editorId) {
        List<SimplifiedArticle> mine = simplifiedRepo.findByEditor_UserId(editorId);
        int updated = 0;

        for (SimplifiedArticle item : mine) {
            approveOne(item.getId(), editorId);
            updated++;
        }

        return updated;
    }

    public int hideAllFromUser(Integer editorId) {
        List<SimplifiedArticle> mine = simplifiedRepo.findByEditor_UserId(editorId);
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

    public SimplifiedArticleResponseDTO hideFromUser(Integer simplifiedId, Integer editorId) {
        SimplifiedArticle target = simplifiedRepo.findById(simplifiedId)
                .orElseThrow(() -> new RuntimeException("Simplified article not found"));

        if (!target.getEditor().getUserId().equals(editorId)) {
            throw new RuntimeException("You are not allowed to update this simplified article");
        }

        target.setStatus(SimplifiedArticle.Status.ARCHIVED);
        SimplifiedArticle saved = simplifiedRepo.save(target);
        return SimplifiedArticleResponseDTO.fromEntity(saved);
    }
}
