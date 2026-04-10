package com.C1SE61.backend.controller.user;

import com.C1SE61.backend.dto.common.ApiResponse;
import com.C1SE61.backend.dto.response.user.ArticleDTO;
import com.C1SE61.backend.dto.response.user.LawDTO;
import com.C1SE61.backend.dto.response.user.SimplifiedArticleDTO;
import com.C1SE61.backend.model.SimplifiedArticle;
import com.C1SE61.backend.repository.SimplifiedArticleRepository;
import com.C1SE61.backend.service.user.LawService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/laws")
@CrossOrigin(origins = "*")
public class LawController {

    @Autowired
    private LawService lawService;

    @Autowired
    private SimplifiedArticleRepository simplifiedArticleRepository;

    // ======================= LUẬT =======================

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<LawDTO>>> searchLaws(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<LawDTO> laws = lawService.searchLaws(keyword, page, size);
            return ResponseEntity.ok(ApiResponse.success("Tìm kiếm luật thành công!", laws));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi tìm kiếm luật: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<LawDTO>>> getAllLaws(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<LawDTO> laws = lawService.getAllLaws(page, size);
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách luật thành công!", laws));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi lấy danh sách luật: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LawDTO>> getLawById(@PathVariable Integer id) {
        try {
            Optional<LawDTO> law = lawService.getLawById(id);
            return law.map(value ->
                    ResponseEntity.ok(ApiResponse.success("Lấy thông tin luật thành công!", value))
            ).orElseGet(() ->
                    ResponseEntity.ok(ApiResponse.error("Không tìm thấy luật với ID: " + id))
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi lấy thông tin luật: " + e.getMessage()));
        }
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<LawDTO>> getLawByCode(@PathVariable String code) {
        try {
            Optional<LawDTO> law = lawService.getLawByCode(code);
            return law.map(value ->
                    ResponseEntity.ok(ApiResponse.success("Lấy thông tin luật thành công!", value))
            ).orElseGet(() ->
                    ResponseEntity.ok(ApiResponse.error("Không tìm thấy luật với mã: " + code))
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi lấy thông tin luật: " + e.getMessage()));
        }
    }

    // ======================= ĐIỀU LUẬT =======================

    @GetMapping("/articles/search")
    public ResponseEntity<ApiResponse<Page<ArticleDTO>>> searchArticles(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<ArticleDTO> articles = lawService.searchArticles(keyword, page, size);
            return ResponseEntity.ok(ApiResponse.success("Tìm kiếm điều luật thành công!", articles));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi tìm kiếm điều luật: " + e.getMessage()));
        }
    }

    @GetMapping("/{lawId}/articles/search")
    public ResponseEntity<ApiResponse<Page<ArticleDTO>>> searchArticlesInLaw(
            @PathVariable Integer lawId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<ArticleDTO> articles = lawService.searchArticlesInLaw(lawId, keyword, page, size);
            return ResponseEntity.ok(ApiResponse.success("Tìm kiếm điều luật trong văn bản thành công!", articles));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi tìm kiếm điều luật: " + e.getMessage()));
        }
    }

    @GetMapping("/{lawId}/articles")
    public ResponseEntity<ApiResponse<List<ArticleDTO>>> getArticlesByLawId(@PathVariable Integer lawId) {
        try {
            List<ArticleDTO> articles = lawService.getArticlesByLawId(lawId);
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách điều luật thành công!", articles));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi lấy danh sách điều luật: " + e.getMessage()));
        }
    }

    @GetMapping("/articles")
    public ResponseEntity<ApiResponse<Page<ArticleDTO>>> getAllArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<ArticleDTO> articles = lawService.getAllArticles(page, size);
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách điều luật thành công!", articles));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi lấy danh sách điều luật: " + e.getMessage()));
        }
    }

    @GetMapping("/articles/{id}")
    public ResponseEntity<ApiResponse<ArticleDTO>> getArticleById(@PathVariable Integer id) {
        try {
            Optional<ArticleDTO> article = lawService.getArticleById(id);
            return article.map(value ->
                    ResponseEntity.ok(ApiResponse.success("Lấy thông tin điều luật thành công!", value))
            ).orElseGet(() ->
                    ResponseEntity.ok(ApiResponse.error("Không tìm thấy điều luật với ID: " + id))
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi lấy điều luật: " + e.getMessage()));
        }
    }

    @GetMapping("/{lawId}/articles/number/{articleNumber}")
    public ResponseEntity<ApiResponse<List<ArticleDTO>>> getArticlesByLawIdAndArticleNumber(
            @PathVariable Integer lawId,
            @PathVariable String articleNumber) {
        try {
            List<ArticleDTO> articles = lawService.getArticlesByLawIdAndArticleNumber(lawId, articleNumber);
            return ResponseEntity.ok(ApiResponse.success("Lấy điều luật theo số thành công!", articles));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi lấy điều luật: " + e.getMessage()));
        }
    }

    // ======================= TÌM KIẾM NÂNG CAO =======================

    @GetMapping("/search-all")
    public ResponseEntity<ApiResponse<LawService.SearchResultDTO>> searchAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            LawService.SearchResultDTO result = lawService.searchAll(keyword, page, size);
            return ResponseEntity.ok(ApiResponse.success("Tìm kiếm tổng hợp thành công!", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi tìm kiếm tổng hợp: " + e.getMessage()));
        }
    }

    // ======================= CÁC LOẠI TÌM KIẾM KHÁC =======================

    @GetMapping("/articles/search-relevance")
    public ResponseEntity<ApiResponse<Page<ArticleDTO>>> searchArticlesWithRelevance(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<ArticleDTO> articles = lawService.searchArticlesWithRelevance(keyword, page, size);
            return ResponseEntity.ok(ApiResponse.success("Tìm kiếm điều luật theo độ liên quan thành công!", articles));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi tìm kiếm điều luật theo độ liên quan: " + e.getMessage()));
        }
    }

    @GetMapping("/articles/number/{articleNumber}")
    public ResponseEntity<ApiResponse<Page<ArticleDTO>>> searchByArticleNumber(
            @PathVariable String articleNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<ArticleDTO> articles = lawService.searchByArticleNumber(articleNumber, page, size);
            return ResponseEntity.ok(ApiResponse.success("Tìm kiếm theo số điều thành công!", articles));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi tìm kiếm theo số điều: " + e.getMessage()));
        }
    }

    @GetMapping("/articles/chapter/{chapterId}")
    public ResponseEntity<ApiResponse<Page<ArticleDTO>>> searchByChapter(
            @PathVariable Integer chapterId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<ArticleDTO> articles = lawService.searchByChapter(chapterId, page, size);
            return ResponseEntity.ok(ApiResponse.success("Tìm kiếm theo chương thành công!", articles));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi tìm kiếm theo chương: " + e.getMessage()));
        }
    }

    @GetMapping("/type/{lawType}")
    public ResponseEntity<ApiResponse<Page<LawDTO>>> searchLawsByType(
            @PathVariable String lawType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<LawDTO> laws = lawService.searchLawsByType(lawType, page, size);
            return ResponseEntity.ok(ApiResponse.success("Tìm kiếm theo loại văn bản thành công!", laws));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi tìm kiếm theo loại văn bản: " + e.getMessage()));
        }
    }

    @GetMapping("/issued-date")
    public ResponseEntity<ApiResponse<Page<LawDTO>>> searchLawsByIssuedDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<LawDTO> laws = lawService.searchLawsByIssuedDateRange(startDate, endDate, page, size);
            return ResponseEntity.ok(ApiResponse.success("Tìm kiếm theo ngày ban hành thành công!", laws));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi tìm kiếm theo ngày ban hành: " + e.getMessage()));
        }
    }

    @GetMapping("/effective-date")
    public ResponseEntity<ApiResponse<Page<LawDTO>>> searchLawsByEffectiveDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<LawDTO> laws = lawService.searchLawsByEffectiveDateRange(startDate, endDate, page, size);
            return ResponseEntity.ok(ApiResponse.success("Tìm kiếm theo ngày có hiệu lực thành công!", laws));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi tìm kiếm theo ngày có hiệu lực: " + e.getMessage()));
        }
    }

    // ======================= GIẢI THÍCH (SIMPLIFIED ARTICLES) =======================

    @GetMapping("/articles/{articleId}/simplified")
    public ResponseEntity<ApiResponse<SimplifiedArticleDTO>> getSimplifiedArticle(@PathVariable Integer articleId) {
        try {
            Optional<SimplifiedArticle> simplified = simplifiedArticleRepository.findApprovedByArticleId(articleId);
            if (simplified.isPresent()) {
                SimplifiedArticleDTO dto = new SimplifiedArticleDTO(simplified.get());
                return ResponseEntity.ok(ApiResponse.success("Lấy giải thích điều luật thành công!", dto));
            } else {
                return ResponseEntity.ok(ApiResponse.success("Không tìm thấy giải thích đã được duyệt cho điều luật này", null));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi lấy giải thích điều luật: " + e.getMessage()));
        }
    }
}
