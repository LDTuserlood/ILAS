package com.C1SE61.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "laws")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Law {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "law_id")
    private Integer lawId;

    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 500, message = "Tiêu đề không được vượt quá 500 ký tự")
    @Column(nullable = false, length = 500)
    private String title;

    @Size(max = 100, message = "Mã văn bản không được vượt quá 100 ký tự")
    @Column(unique = true, length = 100)
    private String code;

    @Size(max = 100, message = "Loại văn bản không được vượt quá 100 ký tự")
    @Column(name = "law_type", length = 100)
    private String lawType;

    @Column(name = "issued_date")
    private LocalDate issuedDate;

    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @Size(max = 500, message = "URL nguồn không được vượt quá 500 ký tự")
    @Column(name = "source_url", length = 500)
    private String sourceUrl;

    @Column(name = "last_crawled_at")
    private LocalDateTime lastCrawledAt = LocalDateTime.now();

    @Column(name = "status", length = 20)
    private String status = "active";

    @Column(name = "amended_by")
    private Integer amendedBy;

    @Column(name = "version_number")
    private Integer versionNumber = 1;

    @OneToMany(mappedBy = "law", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Chapter> chapters;

    @PrePersist
    protected void onCreate() {
        lastCrawledAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastCrawledAt = LocalDateTime.now();
    }

    public boolean isActive() {
        return "active".equalsIgnoreCase(this.status);
    }
}
