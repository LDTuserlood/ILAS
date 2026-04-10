package com.C1SE61.backend.service.user;

import com.C1SE61.backend.dto.response.user.ArticleDTO;
import com.C1SE61.backend.dto.response.user.LawDTO;
import com.C1SE61.backend.model.Article;
import com.C1SE61.backend.model.Law;
import com.C1SE61.backend.model.SearchLog;
import com.C1SE61.backend.model.UserAccount;
import com.C1SE61.backend.repository.ArticleRepository;
import com.C1SE61.backend.repository.LawRepository;
import com.C1SE61.backend.repository.SearchLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class LawService {
    
    @Autowired
    private LawRepository lawRepository;
    
    @Autowired
    private ArticleRepository articleRepository;
    
    @Autowired
    private SearchLogRepository searchLogRepository;
    
    // @Autowired
    // private DataPersistenceService dataPersistenceService;
    
    /**
     * Tìm kiếm luật theo keyword - chỉ luật active
     */
    public Page<LawDTO> searchLaws(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        if (keyword == null || keyword.trim().isEmpty()) {
            // Khi keyword rỗng/null, trả về trang rỗng để frontend hiển thị thông báo
            return Page.empty(pageable);
        }

        Page<Law> laws = lawRepository.searchLaws(keyword.trim(), pageable);
        // Tạm thời không log để tránh lỗi giao dịch
        return laws.map(LawDTO::new);
    }
    
    /**
     * Lấy danh sách luật với phân trang - chỉ luật active
     */
    public Page<LawDTO> getAllLaws(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Law> laws = lawRepository.findAllActive(pageable);
        return laws.map(LawDTO::new);
    }
    
    /**
     * Lấy tất cả articles với phân trang - chỉ articles active và thuộc luật active
     */
    public Page<ArticleDTO> getAllArticles(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Article> articles = articleRepository.findAllActive(pageable);
        return articles.map(this::convertToArticleDTO);
    }
    
    public Optional<LawDTO> getLawById(Integer id) {
        return lawRepository.findById(id)
                .filter(law -> law.getStatus() != null && "active".equalsIgnoreCase(law.getStatus()))
                .map(LawDTO::new);
    }
    public Optional<LawDTO> getLawByCode(String code) {
        return lawRepository.findByCode(code)
                .filter(law -> law.getStatus() != null && "active".equalsIgnoreCase(law.getStatus()))
                .map(LawDTO::new);
    }

    
    /**
     * Tìm kiếm articles theo keyword
     */
    public Page<ArticleDTO> searchArticles(String keyword, int page, int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Article> articles;

            if (keyword == null || keyword.trim().isEmpty()) {
                // Khi keyword rỗng/null, trả về trang rỗng để frontend hiển thị thông báo
                return Page.empty(pageable);
            }

            articles = articleRepository.searchArticles(keyword.trim(), pageable);
            // Tạm thời không log để tránh lỗi giao dịch

            return articles.map(this::convertToArticleDTO);
        } catch (Exception e) {
            System.err.println("Error in searchArticles: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    /**
     * Tìm kiếm articles trong một luật cụ thể
     */
    public Page<ArticleDTO> searchArticlesInLaw(Integer lawId, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Article> articles;

        if (keyword == null || keyword.trim().isEmpty()) {
            // Khi keyword rỗng/null, trả về trang rỗng để frontend hiển thị thông báo
            return Page.empty(pageable);
        }

        articles = articleRepository.searchArticlesInLaw(lawId, keyword.trim(), pageable);
        return articles.map(this::convertToArticleDTO);
    }
    
    /**
     * Lấy danh sách articles của một luật
     */
    public List<ArticleDTO> getArticlesByLawId(Integer lawId) {
        List<Article> articles = articleRepository.findByLawId(lawId);
        return articles.stream()
                      .map(this::convertToArticleDTO)
                      .collect(Collectors.toList());
    }
    
    /**
     * Lấy thông tin article theo ID (chỉ khi law.status = 'active')
     */
    public Optional<ArticleDTO> getArticleById(Integer id) {
        return articleRepository.findById(id)
                .filter(article -> article.getStatus() != null && "active".equalsIgnoreCase(article.getStatus()))
                .filter(article -> article.getLaw() != null && 
                        article.getLaw().getStatus() != null && 
                        "active".equalsIgnoreCase(article.getLaw().getStatus()))
                .map(this::convertToArticleDTO);
    }
    
    /**
     * Tìm kiếm article theo số điều trong một luật
     */
    public List<ArticleDTO> getArticlesByLawIdAndArticleNumber(Integer lawId, String articleNumber) {
        List<Article> articles = articleRepository.findByLawIdAndArticleNumber(lawId, articleNumber);
        return articles.stream()
                      .map(this::convertToArticleDTO)
                      .collect(Collectors.toList());
    }
    
    /**
     * Tìm kiếm tổng hợp (luật và articles)
     */
    public SearchResultDTO searchAll(String keyword, int page, int size) {
        SearchResultDTO result = new SearchResultDTO();
        
        // Tìm kiếm luật
        Page<LawDTO> laws = searchLaws(keyword, page, size);
        result.setLaws(laws.getContent());
        result.setTotalLaws(laws.getTotalElements());
        
        // Tìm kiếm articles
        Page<ArticleDTO> articles = searchArticles(keyword, page, size);
        result.setArticles(articles.getContent());
        result.setTotalArticles(articles.getTotalElements());
        
        // Không log ở searchAll để tránh lỗi giao dịch
        
        result.setTotalResults(laws.getTotalElements() + articles.getTotalElements());
        result.setCurrentPage(page);
        result.setTotalPages(Math.max(laws.getTotalPages(), articles.getTotalPages()));
        
        return result;
    }
    
    /**
     * Phương thức trợ giúp để chuyển đổi Article sang ArticleDTO một cách an toàn
     */
    private ArticleDTO convertToArticleDTO(Article article) {
        if (article == null) {
            return null;
        }
        
        ArticleDTO dto = new ArticleDTO();
        dto.setArticleId(article.getArticleId());
        dto.setArticleNumber(article.getArticleNumber());
        dto.setArticleTitle(article.getArticleTitle());
        dto.setContent(article.getContent());
        
        // Xử lý null pointer cho Law
        if (article.getLaw() != null) {
            dto.setLawId(article.getLaw().getLawId());
            dto.setLawTitle(article.getLaw().getTitle());
        }
        
        // Xử lý null pointer cho Chapter
        if (article.getChapter() != null) {
            dto.setChapterId(article.getChapter().getChapterId());
            dto.setChapterTitle(article.getChapter().getChapterTitle());
        }
        
        return dto;
    }

    /**
     * Tìm kiếm articles với xếp hạng theo mức độ liên quan
     */
    public Page<ArticleDTO> searchArticlesWithRelevance(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Article> articles = articleRepository.searchWithRelevance(keyword, pageable);
        return articles.map(this::convertToArticleDTO);
    }
    
    /**
     * Tìm kiếm theo số điều chính xác
     */
    public Page<ArticleDTO> searchByArticleNumber(String articleNumber, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Article> articles = articleRepository.findByArticleNumber(articleNumber, pageable);
        return articles.map(this::convertToArticleDTO);
    }
    
    /**
     * Tìm kiếm theo chương
     */
    public Page<ArticleDTO> searchByChapter(Integer chapterId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Article> articles = articleRepository.findByChapterId(chapterId, pageable);
        return articles.map(this::convertToArticleDTO);
    }
    
    /**
     * Tìm kiếm luật theo loại văn bản
     */
    public Page<LawDTO> searchLawsByType(String lawType, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Law> laws = lawRepository.findByLawTypeContainingIgnoreCase(lawType, pageable);
        return laws.map(LawDTO::new);
    }
    
    /**
     * Tìm kiếm luật theo khoảng thời gian ban hành
     */
    public Page<LawDTO> searchLawsByIssuedDateRange(java.time.LocalDate startDate, java.time.LocalDate endDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Law> laws = lawRepository.findByIssuedDateBetween(startDate, endDate, pageable);
        return laws.map(LawDTO::new);
    }
    
    /**
     * Tìm kiếm luật theo khoảng thời gian có hiệu lực
     */
    public Page<LawDTO> searchLawsByEffectiveDateRange(java.time.LocalDate startDate, java.time.LocalDate endDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Law> laws = lawRepository.findByEffectiveDateBetween(startDate, endDate, pageable);
        return laws.map(LawDTO::new);
    }
    
    /**
     * Tạo Pageable với sorting
     */
    // createPageable/createSort removed along with advanced search
    
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
    
    /**
     * DTO cho kết quả tìm kiếm tổng hợp
     */
    public static class SearchResultDTO {
        private List<LawDTO> laws;
        private List<ArticleDTO> articles;
        private Long totalLaws;
        private Long totalArticles;
        private Long totalResults;
        private int currentPage;
        private int totalPages;
        
        // Getters and Setters
        public List<LawDTO> getLaws() { return laws; }
        public void setLaws(List<LawDTO> laws) { this.laws = laws; }
        
        public List<ArticleDTO> getArticles() { return articles; }
        public void setArticles(List<ArticleDTO> articles) { this.articles = articles; }
        
        public Long getTotalLaws() { return totalLaws; }
        public void setTotalLaws(Long totalLaws) { this.totalLaws = totalLaws; }
        
        public Long getTotalArticles() { return totalArticles; }
        public void setTotalArticles(Long totalArticles) { this.totalArticles = totalArticles; }
        
        public Long getTotalResults() { return totalResults; }
        public void setTotalResults(Long totalResults) { this.totalResults = totalResults; }
        
        public int getCurrentPage() { return currentPage; }
        public void setCurrentPage(int currentPage) { this.currentPage = currentPage; }
        
        public int getTotalPages() { return totalPages; }
        public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
    }
}




