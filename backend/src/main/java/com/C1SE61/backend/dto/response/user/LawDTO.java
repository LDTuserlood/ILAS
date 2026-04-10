package com.C1SE61.backend.dto.response.user;

import com.C1SE61.backend.model.Law;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class LawDTO {

    private Integer id;
    private String title;
    private String code;
    private String lawType;
    private LocalDate issuedDate;
    private LocalDate effectiveDate;
    private String sourceUrl;
    private String status;
    private Integer amendedBy;
    private Integer versionNumber;
    private LocalDateTime lastCrawledAt;

    // ===== Constructors =====
    public LawDTO() {}

    public LawDTO(Law law) {
        if (law != null) {
            this.id = law.getLawId();
            this.title = law.getTitle();
            this.code = law.getCode();
            this.lawType = law.getLawType();
            this.issuedDate = law.getIssuedDate();
            this.effectiveDate = law.getEffectiveDate();
            this.sourceUrl = law.getSourceUrl();
            this.status = (law.getStatus() != null)
                    ? law.getStatus()
                    : "active"; // ✅ Giá trị mặc định giống DB
            this.amendedBy = law.getAmendedBy();
            this.versionNumber = law.getVersionNumber();
            this.lastCrawledAt = law.getLastCrawledAt();
        }
    }

    // ===== Getters & Setters =====
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getLawType() { return lawType; }
    public void setLawType(String lawType) { this.lawType = lawType; }

    public LocalDate getIssuedDate() { return issuedDate; }
    public void setIssuedDate(LocalDate issuedDate) { this.issuedDate = issuedDate; }

    public LocalDate getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(LocalDate effectiveDate) { this.effectiveDate = effectiveDate; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getAmendedBy() { return amendedBy; }
    public void setAmendedBy(Integer amendedBy) { this.amendedBy = amendedBy; }

    public Integer getVersionNumber() { return versionNumber; }
    public void setVersionNumber(Integer versionNumber) { this.versionNumber = versionNumber; }

    public LocalDateTime getLastCrawledAt() { return lastCrawledAt; }
    public void setLastCrawledAt(LocalDateTime lastCrawledAt) { this.lastCrawledAt = lastCrawledAt; }

    @Override
    public String toString() {
        return "LawDTO{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", code='" + code + '\'' +
                ", lawType='" + lawType + '\'' +
                ", issuedDate=" + issuedDate +
                ", effectiveDate=" + effectiveDate +
                ", sourceUrl='" + sourceUrl + '\'' +
                ", status='" + status + '\'' +
                ", amendedBy=" + amendedBy +
                ", versionNumber=" + versionNumber +
                ", lastCrawledAt=" + lastCrawledAt +
                '}';
    }
}
