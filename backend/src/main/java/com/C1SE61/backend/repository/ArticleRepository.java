package com.C1SE61.backend.repository;

import com.C1SE61.backend.model.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Integer> {

    List<Article> findByStatus(String status);

    // Tìm kiếm articles theo keyword (chỉ khi law.status = 'active')
    @Query("SELECT a FROM Article a " +
           "WHERE a.status = 'active' AND a.law.status = 'active' AND (" +
           "LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(a.articleTitle) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Article> searchByKeyword(@Param("keyword") String keyword);


    // Tìm articles theo law ID (chỉ khi law.status = 'active')
    @Query("SELECT a FROM Article a WHERE a.law.lawId = :lawId AND a.status = 'active' AND a.law.status = 'active'")
    List<Article> findByLawId(@Param("lawId") Integer lawId);

    // Lấy articles theo law ID với phân trang (chỉ khi law.status = 'active')
    @Query("SELECT a FROM Article a WHERE a.law.lawId = :lawId AND a.status = 'active' AND a.law.status = 'active'")
    Page<Article> findByLawId(@Param("lawId") Integer lawId, Pageable pageable);

    // Tìm kiếm articles theo nội dung với LIKE search (chỉ status = 'active' và law.status = 'active')
    @Query("SELECT a FROM Article a " +
           "LEFT JOIN FETCH a.law " +
           "LEFT JOIN FETCH a.chapter " +
           "WHERE a.status = 'active' AND a.law.status = 'active' AND (" +
           "LOWER(a.articleTitle) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.articleNumber) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Article> searchArticles(@Param("keyword") String keyword, Pageable pageable);

    // Tìm kiếm articles trong một luật cụ thể (chỉ khi law.status = 'active')
    @Query(value = "SELECT a.* FROM articles a " +
           "INNER JOIN laws l ON a.law_id = l.law_id " +
           "WHERE a.law_id = :lawId AND a.status = 'active' AND l.status = 'active' AND " +
           "(LOWER(a.article_title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.article_number) LIKE LOWER(CONCAT('%', :keyword, '%')))",
           nativeQuery = true)
    Page<Article> searchArticlesInLaw(@Param("lawId") Integer lawId,
                                      @Param("keyword") String keyword,
                                      Pageable pageable);

    // Tìm kiếm articles theo số điều (chỉ khi law.status = 'active')
    @Query("SELECT a FROM Article a WHERE a.articleNumber LIKE CONCAT('%', :articleNumber, '%') AND a.status = 'active' AND a.law.status = 'active'")
    List<Article> findByArticleNumberContaining(@Param("articleNumber") String articleNumber);

    // Tìm kiếm articles theo law ID và số điều chính xác (chỉ khi law.status = 'active')
    @Query("SELECT a FROM Article a WHERE a.law.lawId = :lawId AND a.articleNumber = :articleNumber AND a.status = 'active' AND a.law.status = 'active'")
    List<Article> findByLawIdAndArticleNumber(@Param("lawId") Integer lawId,
                                              @Param("articleNumber") String articleNumber);

    // Tìm kiếm articles theo law ID và số điều (LIKE) (chỉ khi law.status = 'active')
    @Query("SELECT a FROM Article a WHERE a.law.lawId = :lawId AND a.articleNumber LIKE CONCAT('%', :articleNumber, '%') AND a.status = 'active' AND a.law.status = 'active'")
    List<Article> findByLawIdAndArticleNumberContaining(@Param("lawId") Integer lawId,
                                                        @Param("articleNumber") String articleNumber);

    // Tìm kiếm articles theo số điều chính xác (chỉ khi law.status = 'active')
    @Query("SELECT a FROM Article a WHERE a.articleNumber = :articleNumber AND a.status = 'active' AND a.law.status = 'active'")
    Page<Article> findByArticleNumber(@Param("articleNumber") String articleNumber, Pageable pageable);

    // Tìm kiếm articles theo chương (chỉ khi law.status = 'active')
    @Query("SELECT a FROM Article a WHERE a.chapter.chapterId = :chapterId AND a.status = 'active' AND a.law.status = 'active'")
    Page<Article> findByChapterId(@Param("chapterId") Integer chapterId, Pageable pageable);

    /**
     * Lấy tất cả articles với phân trang - chỉ articles active và thuộc luật active
     */
    @Query("SELECT a FROM Article a WHERE a.status = 'active' AND a.law.status = 'active'")
    Page<Article> findAllActive(Pageable pageable);


    // Tìm kiếm theo từ khóa có xếp hạng (chỉ khi law.status = 'active')
    @Query(value = "SELECT a.* FROM articles a " +
           "INNER JOIN laws l ON a.law_id = l.law_id " +
           "WHERE a.status = 'active' AND l.status = 'active' AND (" +
           "LOWER(a.article_title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY " +
           "CASE WHEN LOWER(a.article_title) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 1 ELSE 2 END, " +
           "a.article_title ASC",
           nativeQuery = true)
    Page<Article> searchWithRelevance(@Param("keyword") String keyword, Pageable pageable);
}
