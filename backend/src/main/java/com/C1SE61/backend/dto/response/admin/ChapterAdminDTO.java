package com.C1SE61.backend.dto.response.admin;

import com.C1SE61.backend.model.Chapter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChapterAdminDTO {
    private Integer chapterId;
    private Integer lawId;
    private String lawTitle;
    private String chapterNumber;
    private String chapterTitle;
    private Integer sortOrder;
    private Integer versionNumber;
    private String status;

    public ChapterAdminDTO(Chapter chapter) {
        if (chapter == null) return;
        this.chapterId = chapter.getChapterId();
        this.chapterNumber = chapter.getChapterNumber();
        this.chapterTitle = chapter.getChapterTitle();
        this.sortOrder = chapter.getSortOrder();
        this.versionNumber = chapter.getVersionNumber();
        this.status = chapter.getStatus() != null ? chapter.getStatus().name() : null;
        if (chapter.getLaw() != null) {
            this.lawId = chapter.getLaw().getLawId();
            this.lawTitle = chapter.getLaw().getTitle();
        }
    }
}

