package com.C1SE61.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "chapters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chapter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chapter_id")
    private Integer chapterId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "law_id", nullable = false)
    private Law law;

    @Column(name = "chapter_number", length = 10)
    private String chapterNumber;

    @Column(name = "chapter_title", length = 255)
    private String chapterTitle;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "version_number")
    private Integer versionNumber = 1;

    // Đổi Enum -> String để khớp với DB ENUM('active','archived')
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('active','archived')")
    private ChapterStatus status = ChapterStatus.active;


    @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Article> articles;

    @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Section> sections;

    public enum ChapterStatus {
        active,
        archived
    }
}


