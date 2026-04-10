package com.C1SE61.backend.service.log;

import com.C1SE61.backend.model.SearchLog;
import com.C1SE61.backend.model.UserAccount;
import com.C1SE61.backend.repository.SearchLogRepository;
import com.C1SE61.backend.dto.response.admin.TopSearchDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class SearchLogService {

    @Autowired
    private SearchLogRepository searchLogRepository;

    /**
     * Lưu keyword tìm kiếm. Dùng transaction riêng để không ảnh hưởng tới nghiệp vụ chính.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logKeyword(String keyword, String searchType, UserAccount user) {
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                return;
            }

            String normalizedKeyword = keyword.trim();
            if (normalizedKeyword.length() > 255) {
                normalizedKeyword = normalizedKeyword.substring(0, 255);
            }
            String normalizedType = (searchType == null || searchType.isBlank())
                    ? "general"
                    : searchType.trim();

            SearchLog log = SearchLog.builder()
                    .keyword(normalizedKeyword)
                    .query(normalizedKeyword)
                    .searchType(normalizedType)
                    .user(user)
                    .build();

            searchLogRepository.save(log);
        } catch (Exception e) {
            // Không làm hỏng luồng chính nếu log lỗi
            System.err.println("Skip logging search keyword due to: " + e.getMessage());
        }
    }

    /**
     * Lấy danh sách top keyword tìm kiếm, giới hạn theo tham số truyền vào.
     */
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    public List<TopSearchDTO> getTopSearches(int limit) {
        int topLimit = (limit <= 0) ? 5 : Math.min(limit, 20);
        Pageable pageable = PageRequest.of(0, topLimit);

        List<Object[]> rows = searchLogRepository.findTopSearchKeywords(pageable);
        if (rows == null || rows.isEmpty()) {
            return List.of();
        }

        return rows.stream()
                .map(row -> {
                    if (row == null || row.length < 2 || row[0] == null) {
                        return null;
                    }
                    String key = row[0].toString();
                    Long count = row[1] instanceof Number ? ((Number) row[1]).longValue() : 0L;
                    return new TopSearchDTO(key, count);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}

