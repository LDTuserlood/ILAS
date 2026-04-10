package com.C1SE61.backend.service.editor;

import com.C1SE61.backend.dto.response.admin.ArticleAdminDTO;
import com.C1SE61.backend.model.Article;
import com.C1SE61.backend.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class EditorArticleManagementService {

    private final ArticleRepository articleRepository;

    public Page<ArticleAdminDTO> list(String keyword, Integer lawId, Integer chapterId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Article> articles;

        if (StringUtils.hasText(keyword)) {
            articles = articleRepository.searchArticles(keyword.trim(), pageable);
        } else if (chapterId != null) {
            articles = articleRepository.findByChapterId(chapterId, pageable);
        } else if (lawId != null) {
            articles = articleRepository.findByLawId(lawId, pageable);
        } else {
            articles = articleRepository.findAll(pageable);
        }

        return articles.map(ArticleAdminDTO::new);
    }
}
