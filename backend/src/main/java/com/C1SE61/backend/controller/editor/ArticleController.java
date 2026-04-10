package com.C1SE61.backend.controller.editor;

import com.C1SE61.backend.model.Article;
import com.C1SE61.backend.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;
import java.util.*;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ArticleController {

    private final ArticleRepository articleRepo;

    @GetMapping
    public ResponseEntity<?> getActiveArticles() {
        // Lấy chỉ các điều luật có status = 'active'
        List<Article> activeList = articleRepo.findByStatus("active");

        // Trả về danh sách DTO rút gọn, không trả trực tiếp entity để tránh lỗi Lazy
        List<Map<String, Object>> response = activeList.stream()
            .map(a -> {
                String raw = a.getContent();
                String preview = (raw != null && raw.length() > 200)
                        ? raw.substring(0, 200) + "..."
                        : raw;

                return Map.<String, Object>of(
                    "articleId", a.getArticleId(),
                    "articleNumber", a.getArticleNumber(),
                    "articleTitle", a.getArticleTitle(),
                    "content", preview
                );
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }



    // Lấy điều luật cụ thể theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return articleRepo.findById(id)
                .map(a -> Map.of(
                    "articleId", a.getArticleId(),
                    "articleNumber", a.getArticleNumber(),
                    "articleTitle", a.getArticleTitle(),
                    "content", a.getContent()
                ))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
