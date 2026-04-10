package com.C1SE61.backend.dto.response.user;

import java.time.LocalDateTime;

public class FormTemplateDTO {

    private Integer templateId;
    private String title;
    private String description;
    private String category;
    private String fileUrl;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String formattedFileSize;
    private String status;
    private Integer relatedArticleId;
    private String relatedArticleTitle;
    private Integer editorId;
    private String editorName;
    private LocalDateTime createdAt;

    // ===== Constructors =====
    public FormTemplateDTO() {}

    public FormTemplateDTO(Integer templateId, String title, String description, String category,
                           String fileUrl, String status, Integer relatedArticleId,
                           String relatedArticleTitle, Integer editorId, String editorName,
                           LocalDateTime createdAt) {
        this.templateId = templateId;
        this.title = title;
        this.description = description;
        this.category = category;
        this.fileUrl = fileUrl;
        this.fileName = null;
        this.fileType = null;
        this.fileSize = null;
        this.formattedFileSize = null;
        this.status = status;
        this.relatedArticleId = relatedArticleId;
        this.relatedArticleTitle = relatedArticleTitle;
        this.editorId = editorId;
        this.editorName = editorName;
        this.createdAt = createdAt;
    }

    // ===== Getters and Setters =====
    public Integer getTemplateId() { return templateId; }
    public void setTemplateId(Integer templateId) { this.templateId = templateId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getFormattedFileSize() { return formattedFileSize; }
    public void setFormattedFileSize(String formattedFileSize) { this.formattedFileSize = formattedFileSize; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getRelatedArticleId() { return relatedArticleId; }
    public void setRelatedArticleId(Integer relatedArticleId) { this.relatedArticleId = relatedArticleId; }

    public String getRelatedArticleTitle() { return relatedArticleTitle; }
    public void setRelatedArticleTitle(String relatedArticleTitle) { this.relatedArticleTitle = relatedArticleTitle; }

    public Integer getEditorId() { return editorId; }
    public void setEditorId(Integer editorId) { this.editorId = editorId; }

    public String getEditorName() { return editorName; }
    public void setEditorName(String editorName) { this.editorName = editorName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
