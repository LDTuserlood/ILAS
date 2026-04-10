package com.C1SE61.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Section {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "section_id")
    private Integer sectionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;

    @Column(name = "section_number", length = 10)
    private String sectionNumber;

    @Column(name = "section_title", length = 255)
    private String sectionTitle;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "version_number")
    private Integer versionNumber = 1;

    @Column(name = "status", length = 20, nullable = false)
    private String status = "active";
}
