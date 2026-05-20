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
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class LawService {
    private static final String PYTHON_NATURAL_SEARCH_API = "http://127.0.0.1:5000/api/search/natural";
    
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
        SearchResultDTO naturalResult = searchNaturalLanguage(keyword, page, size);
        if (naturalResult != null) {
            return naturalResult;
        }

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

    public SearchResultDTO searchNaturalLanguage(String keyword, int page, int size) {
        String searchTerm = keyword != null ? keyword.trim() : "";
        if (searchTerm.isEmpty() || page > 0) {
            return null;
        }

        try {
            RestTemplate rest = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("query", searchTerm);
            body.put("limit", Math.max(size * 2, 12));

            ResponseEntity<Map> response = rest.postForEntity(
                    PYTHON_NATURAL_SEARCH_API,
                    new HttpEntity<>(body, headers),
                    Map.class
            );

            Map<?, ?> payload = response.getBody();
            if (payload == null || !(payload.get("results") instanceof List<?> rawResults)) {
                return null;
            }

            String rewrittenQuery = payload.get("rewrittenQuery") != null ? payload.get("rewrittenQuery").toString() : null;

            List<Integer> articleIds = new ArrayList<>();
            Map<Integer, Double> articleScores = new HashMap<>();
            for (Object raw : rawResults) {
                if (!(raw instanceof Map<?, ?> item)) continue;
                Object rawId = item.get("articleId");
                Integer articleId = toInteger(rawId);
                if (articleId != null && !articleIds.contains(articleId)) {
                    articleIds.add(articleId);
                }
                if (articleId != null) {
                    articleScores.put(articleId, toDouble(item.get("score")));
                }
            }

            if (articleIds.isEmpty()) {
                SearchResultDTO empty = new SearchResultDTO();
                empty.setLaws(List.of());
                empty.setArticles(List.of());
                empty.setTotalLaws(0L);
                empty.setTotalArticles(0L);
                empty.setTotalResults(0L);
                empty.setCurrentPage(0);
                empty.setTotalPages(0);
                empty.setRewrittenQuery(rewrittenQuery);
                empty.setSearchMode("natural");
                return empty;
            }

            List<Article> fetched = articleRepository.findActiveByArticleIds(articleIds);
            Map<Integer, Article> byId = fetched.stream()
                    .collect(Collectors.toMap(Article::getArticleId, article -> article));

            Map<Integer, LawCandidate> lawScores = new LinkedHashMap<>();
            int order = 0;

            for (Integer articleId : articleIds) {
                Article article = byId.get(articleId);
                if (article == null) continue;

                if (article.getLaw() != null) {
                    Integer lawId = article.getLaw().getLawId();
                    double score = articleScores.getOrDefault(articleId, 0.0);
                    int currentOrder = order;
                    LawCandidate candidate = lawScores.computeIfAbsent(
                            lawId,
                            id -> new LawCandidate(new LawDTO(article.getLaw()), currentOrder)
                    );
                    candidate.add(score);
                }
                order++;
            }

            if (lawScores.isEmpty()) {
                SearchResultDTO empty = new SearchResultDTO();
                empty.setLaws(List.of());
                empty.setArticles(List.of());
                empty.setTotalLaws(0L);
                empty.setTotalArticles(0L);
                empty.setTotalResults(0L);
                empty.setCurrentPage(0);
                empty.setTotalPages(0);
                empty.setRewrittenQuery(rewrittenQuery);
                empty.setSearchMode("natural");
                return empty;
            }

            List<LawCandidate> rankedLaws = new ArrayList<>(lawScores.values());
            rankedLaws.sort((a, b) -> {
                int byScore = Double.compare(b.score, a.score);
                if (byScore != 0) return byScore;
                return Integer.compare(a.firstOrder, b.firstOrder);
            });

            double topScore = rankedLaws.get(0).score;
            boolean multiLawQuery = isMultiLawQuery(searchTerm);
            List<LawDTO> selectedLaws = new ArrayList<>();

            for (LawCandidate candidate : rankedLaws) {
                if (selectedLaws.isEmpty()) {
                    selectedLaws.add(candidate.law);
                    continue;
                }

                boolean closeEnough = topScore > 0 && candidate.score >= topScore * 0.82;
                if (multiLawQuery && closeEnough && selectedLaws.size() < 3) {
                    selectedLaws.add(candidate.law);
                }
            }

            SearchResultDTO result = new SearchResultDTO();
            result.setLaws(selectedLaws);
            result.setArticles(List.of());
            result.setTotalLaws((long) selectedLaws.size());
            result.setTotalArticles(0L);
            result.setTotalResults((long) selectedLaws.size());
            result.setCurrentPage(0);
            result.setTotalPages(1);
            result.setRewrittenQuery(rewrittenQuery);
            result.setSearchMode("natural");
            return result;

        } catch (RestClientException e) {
            System.err.println("Natural language law search unavailable: " + e.getMessage());
            return null;
        } catch (Exception e) {
            System.err.println("Natural language law search failed: " + e.getMessage());
            return null;
        }
    }

    private Integer toInteger(Object value) {
        if (value instanceof Integer integer) return integer;
        if (value instanceof Number number) return number.intValue();
        if (value instanceof String text) {
            try {
                return Integer.parseInt(text);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private double toDouble(Object value) {
        if (value instanceof Number number) return number.doubleValue();
        if (value instanceof String text) {
            try {
                return Double.parseDouble(text);
            } catch (NumberFormatException ignored) {
                return 0.0;
            }
        }
        return 0.0;
    }

    private boolean isMultiLawQuery(String keyword) {
        String text = keyword == null ? "" : keyword.toLowerCase();
        return text.contains(" và ")
                || text.contains(",")
                || text.contains(";")
                || text.contains("đồng thời")
                || text.contains("vừa ")
                || text.contains("nhiều")
                || text.contains("liên quan đến");
    }

    private static class LawCandidate {
        private final LawDTO law;
        private final int firstOrder;
        private double score;
        private int matches;

        private LawCandidate(LawDTO law, int firstOrder) {
            this.law = law;
            this.firstOrder = firstOrder;
        }

        private void add(double articleScore) {
            matches++;
            score += articleScore + Math.max(0, 3 - matches) * 0.08;
        }
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
        private String rewrittenQuery;
        private String searchMode;
        
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

        public String getRewrittenQuery() { return rewrittenQuery; }
        public void setRewrittenQuery(String rewrittenQuery) { this.rewrittenQuery = rewrittenQuery; }

        public String getSearchMode() { return searchMode; }
        public void setSearchMode(String searchMode) { this.searchMode = searchMode; }
    }
}




