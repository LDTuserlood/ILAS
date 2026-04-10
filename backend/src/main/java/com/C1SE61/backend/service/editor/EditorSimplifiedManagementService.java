package com.C1SE61.backend.service.editor;

import com.C1SE61.backend.dto.response.user.SimplifiedArticleDTO;
import com.C1SE61.backend.model.SimplifiedArticle;
import com.C1SE61.backend.repository.SimplifiedArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class EditorSimplifiedManagementService {

    private final SimplifiedArticleRepository simplifiedArticleRepository;

    public Page<SimplifiedArticleDTO> listByStatus(SimplifiedArticle.Status status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SimplifiedArticle> data = simplifiedArticleRepository.findByStatus(status, pageable);
        return data.map(SimplifiedArticleDTO::new);
    }

    public SimplifiedArticleDTO approve(Integer id) {
        SimplifiedArticle sa = get(id);
        sa.setStatus(SimplifiedArticle.Status.APPROVED);
        return new SimplifiedArticleDTO(simplifiedArticleRepository.save(sa));
    }

    public SimplifiedArticleDTO reject(Integer id) {
        SimplifiedArticle sa = get(id);
        sa.setStatus(SimplifiedArticle.Status.REJECTED);
        return new SimplifiedArticleDTO(simplifiedArticleRepository.save(sa));
    }

    private SimplifiedArticle get(Integer id) {
        return simplifiedArticleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Simplified article not found with id: " + id));
    }
}
