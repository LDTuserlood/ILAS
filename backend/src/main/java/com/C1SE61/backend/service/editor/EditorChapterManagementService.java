package com.C1SE61.backend.service.editor;

import com.C1SE61.backend.dto.response.admin.ChapterAdminDTO;
import com.C1SE61.backend.model.Chapter;
import com.C1SE61.backend.repository.ChapterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EditorChapterManagementService {

    private final ChapterRepository chapterRepository;

    public Page<ChapterAdminDTO> list(Integer lawId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Chapter> chapters;

        chapters = (lawId != null)
                ? chapterRepository.findByLawId(lawId, pageable)
                : chapterRepository.findAll(pageable);

        return chapters.map(ChapterAdminDTO::new);
    }
}
