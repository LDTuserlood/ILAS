package com.C1SE61.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "articles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "article_id")
    private Integer articleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "law_id", nullable = false)
    private Law law;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id")
    private Chapter chapter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private Section section;

    @Column(name = "article_number", length = 50)
    private String articleNumber;

    @Column(name = "article_title", length = 500)
    private String articleTitle;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "status", length = 20, nullable = false)
    private String status = "active";

    @Column(name = "version_number")
    private Integer versionNumber = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "previous_article_id")
    private Article previousArticle;

    @Column(name = "sort_order")
    private Integer sortOrder;
}
