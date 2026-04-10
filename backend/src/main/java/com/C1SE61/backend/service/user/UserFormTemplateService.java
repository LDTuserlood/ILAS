package com.C1SE61.backend.service.user;

import com.C1SE61.backend.dto.common.ApiResponse;
import com.C1SE61.backend.dto.response.user.FormTemplateDTO;
import com.C1SE61.backend.model.FormTemplate;
import com.C1SE61.backend.model.SearchLog;
import com.C1SE61.backend.model.UserAccount;
import com.C1SE61.backend.repository.FormTemplateRepository;
import com.C1SE61.backend.repository.SearchLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.DecimalFormat;
import java.util.List;
import java.util.Optional;

/**
 * Service dành cho người dùng (User)
 * Xử lý lấy danh sách, tìm kiếm, phân trang, thống kê FormTemplate
 */
@Service("userFormTemplateService")
@Transactional
public class UserFormTemplateService {

    @Autowired
    private FormTemplateRepository formTemplateRepository;
    
    @Autowired
    private SearchLogRepository searchLogRepository;

    private static final FormTemplate.Status PUBLISHED_STATUS = FormTemplate.Status.APPROVED;

    /** Lấy tất cả biểu mẫu có phân trang */
    public ApiResponse<Page<FormTemplateDTO>> getAllTemplates(int page, int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<FormTemplate> templates = formTemplateRepository
                    .findByStatusOrderByCreatedAtDesc(PUBLISHED_STATUS, pageable);
            Page<FormTemplateDTO> templateDTOs = templates.map(this::convertToDTO);

            return ApiResponse.success("Lấy danh sách biểu mẫu thành công", templateDTOs);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi khi lấy danh sách biểu mẫu: " + e.getMessage());
        }
    }

    /** Tìm kiếm biểu mẫu theo từ khóa */
    public ApiResponse<Page<FormTemplateDTO>> searchTemplates(String keyword, int page, int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<FormTemplate> templates = (keyword == null || keyword.trim().isEmpty())
                    ? formTemplateRepository.findByStatusOrderByCreatedAtDesc(PUBLISHED_STATUS, pageable)
                    : formTemplateRepository.searchApprovedTemplates(keyword.trim(), PUBLISHED_STATUS, pageable);

            // Tạm thời không log để tránh lỗi giao dịch

            Page<FormTemplateDTO> templateDTOs = templates.map(this::convertToDTO);
            return ApiResponse.success("Tìm kiếm biểu mẫu thành công", templateDTOs);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi khi tìm kiếm biểu mẫu: " + e.getMessage());
        }
    }

    /** Lấy biểu mẫu theo danh mục */
    public ApiResponse<Page<FormTemplateDTO>> getTemplatesByCategory(String category, int page, int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<FormTemplate> templates = formTemplateRepository.findByCategory(category, PUBLISHED_STATUS, pageable);
            Page<FormTemplateDTO> templateDTOs = templates.map(this::convertToDTO);

            return ApiResponse.success("Lấy biểu mẫu theo danh mục thành công", templateDTOs);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi khi lấy biểu mẫu theo danh mục: " + e.getMessage());
        }
    }

    /** Tìm kiếm biểu mẫu theo danh mục và từ khóa */
    public ApiResponse<Page<FormTemplateDTO>> searchTemplatesByCategory(String category, String keyword, int page, int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<FormTemplate> templates = (keyword == null || keyword.trim().isEmpty())
                    ? formTemplateRepository.findByCategory(category, PUBLISHED_STATUS, pageable)
                    : formTemplateRepository.findByCategoryAndSearch(category, keyword.trim(), PUBLISHED_STATUS, pageable);

            Page<FormTemplateDTO> templateDTOs = templates.map(this::convertToDTO);
            return ApiResponse.success("Tìm kiếm biểu mẫu theo danh mục thành công", templateDTOs);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi khi tìm kiếm biểu mẫu theo danh mục: " + e.getMessage());
        }
    }

    /** Lấy chi tiết biểu mẫu */
    public ApiResponse<FormTemplateDTO> getTemplateById(Integer templateId) {
        try {
            Optional<FormTemplate> template = formTemplateRepository.findByTemplateIdAndStatus(templateId, PUBLISHED_STATUS);
            if (template.isEmpty()) {
                return ApiResponse.error("Không tìm thấy biểu mẫu với ID: " + templateId);
            }

            FormTemplateDTO dto = convertToDTO(template.get());
            return ApiResponse.success("Lấy thông tin biểu mẫu thành công", dto);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi khi lấy thông tin biểu mẫu: " + e.getMessage());
        }
    }

    /** Lấy danh sách danh mục biểu mẫu */
    public ApiResponse<List<String>> getAllCategories() {
        try {
            List<String> categories = formTemplateRepository.findDistinctCategories(PUBLISHED_STATUS);
            return ApiResponse.success("Lấy danh sách danh mục thành công", categories);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi khi lấy danh mục biểu mẫu: " + e.getMessage());
        }
    }

    /** Ghi nhận lượt tải xuống (placeholder) */
    public ApiResponse<String> incrementDownloadCount(Integer templateId) {
        Optional<FormTemplate> templateOpt = formTemplateRepository.findById(templateId);
        if (templateOpt.isEmpty()) {
            return ApiResponse.error("Không tìm thấy biểu mẫu với ID: " + templateId);
        }
        return ApiResponse.success("Đã ghi nhận lượt tải xuống");
    }

    /** Lấy biểu mẫu phổ biến (placeholder) */
    public ApiResponse<Page<FormTemplateDTO>> getMostDownloadedTemplates(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<FormTemplate> templates = formTemplateRepository.findByStatusOrderByCreatedAtDesc(PUBLISHED_STATUS, pageable);
        return ApiResponse.success("Lấy biểu mẫu phổ biến thành công", templates.map(this::convertToDTO));
    }

    /** Lấy biểu mẫu mới nhất */
    public ApiResponse<Page<FormTemplateDTO>> getRecentTemplates(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<FormTemplate> templates = formTemplateRepository.findRecentTemplates(PUBLISHED_STATUS, pageable);
        return ApiResponse.success("Lấy biểu mẫu mới nhất thành công", templates.map(this::convertToDTO));
    }

    /** Helper: Entity → DTO */
    private FormTemplateDTO convertToDTO(FormTemplate template) {
        FormTemplateDTO dto = new FormTemplateDTO();
        dto.setTemplateId(template.getTemplateId());
        dto.setTitle(template.getTitle());
        dto.setDescription(template.getDescription());
        dto.setCategory(template.getCategory());
        dto.setFileUrl(template.getFileUrl());

        // Derive file metadata (name, type, size) so user view matches editor upload
        populateFileMetadata(dto);

        dto.setStatus(template.getStatus() != null ? template.getStatus().name() : "draft");
        dto.setCreatedAt(template.getCreatedAt());

        if (template.getRelatedArticle() != null) {
            dto.setRelatedArticleId(template.getRelatedArticle().getArticleId());
            dto.setRelatedArticleTitle(template.getRelatedArticle().getArticleTitle());
        }

        if (template.getEditor() != null) {
            dto.setEditorId(template.getEditor().getUserId());
            dto.setEditorName(template.getEditor().getFullName());
        }
        return dto;
    }

    /** Populate file name, extension and size from the stored upload URL. */
    private void populateFileMetadata(FormTemplateDTO dto) {
        String fileUrl = dto.getFileUrl();
        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }

        String fileName = extractFileName(fileUrl);
        dto.setFileName(fileName);
        dto.setFileType(extractExtension(fileName));

        if (fileName != null) {
            Path localPath = Paths.get("uploads").resolve(fileName);
            if (Files.exists(localPath)) {
                try {
                    long sizeBytes = Files.size(localPath);
                    dto.setFileSize(sizeBytes);
                    dto.setFormattedFileSize(formatFileSize(sizeBytes));
                } catch (Exception ignored) {
                    // If reading file size fails, we keep metadata null to avoid breaking the API.
                }
            }
        }
    }

    private String extractFileName(String url) {
        try {
            URI uri = new URI(url);
            String path = uri.getPath();
            if (path != null) {
                Path p = Paths.get(path);
                Path fileName = p.getFileName();
                return fileName != null ? fileName.toString() : null;
            }
        } catch (URISyntaxException ignored) {
            // Fallback to simple parsing below
        }
        int lastSlash = url.lastIndexOf('/');
        return lastSlash >= 0 && lastSlash < url.length() - 1
                ? url.substring(lastSlash + 1)
                : url;
    }

    private String extractExtension(String fileName) {
        if (fileName == null) {
            return null;
        }
        int dot = fileName.lastIndexOf('.');
        if (dot > 0 && dot < fileName.length() - 1) {
            return fileName.substring(dot + 1);
        }
        return null;
    }

    private String formatFileSize(long sizeBytes) {
        double size = sizeBytes;
        String unit = "B";
        if (sizeBytes >= 1_048_576) { // >= 1MB
            size = sizeBytes / 1_048_576.0;
            unit = "MB";
        } else if (sizeBytes >= 1024) {
            size = sizeBytes / 1024.0;
            unit = "KB";
        }
        return new DecimalFormat("#,##0.##").format(size) + " " + unit;
    }
    
    /**
     * Helper method để log search queries
     */
    private void logSearch(String keyword, String searchType, UserAccount user) {
        try {
            if (keyword != null && !keyword.trim().isEmpty() && searchLogRepository != null) {
                SearchLog searchLog = SearchLog.builder()
                        .keyword(keyword.trim())
                        .searchType(searchType)
                        .user(user)
                        .build();
                searchLogRepository.save(searchLog);
            }
        } catch (Exception e) {
            // Log error nhưng không throw để không ảnh hưởng đến search functionality
            // Có thể do bảng search_log chưa được tạo hoặc repository chưa sẵn sàng
            System.err.println("Error logging search (non-critical): " + e.getMessage());
            e.printStackTrace();
        }
    }
}
