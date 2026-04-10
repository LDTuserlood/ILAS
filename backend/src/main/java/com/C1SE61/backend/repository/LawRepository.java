package com.C1SE61.backend.repository;

import com.C1SE61.backend.model.Law;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LawRepository extends JpaRepository<Law, Integer> {

    /**
     * Tìm luật theo code
     */
    Optional<Law> findByCode(String code);

    /**
     * Tìm kiếm luật theo title
     */
    List<Law> findByTitleContainingIgnoreCase(String title);

    /**
     * Tìm kiếm luật theo law type
     */
    List<Law> findByLawTypeContainingIgnoreCase(String lawType);

    /**
     * Tìm kiếm luật theo nhiều tiêu chí với FULLTEXT search (fallback to LIKE)
     * Chỉ tìm kiếm luật có trạng thái active
     */
    @Query(value = "SELECT * FROM laws WHERE " +
            "status = 'active' AND (" +
            "LOWER(title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(code) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(law_type) LIKE LOWER(CONCAT('%', :keyword, '%')))",
            nativeQuery = true)
    Page<Law> searchLaws(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Tìm kiếm luật (không giới hạn trạng thái) - dành cho admin
     */
    @Query("SELECT l FROM Law l WHERE " +
            "LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(l.code) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(l.lawType) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Law> searchAllLaws(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Tìm kiếm luật với phân trang - chỉ luật active
     */
    @Query("SELECT l FROM Law l WHERE " +
            "l.status = 'active' AND (" +
            "LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(l.code) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(l.lawType) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Law> searchLawsList(@Param("keyword") String keyword);

    /**
     * Lấy tất cả luật với phân trang - chỉ luật active
     */
    @Query("SELECT l FROM Law l WHERE l.status = 'active'")
    Page<Law> findAllActive(@NonNull Pageable pageable);

    /**
     * Lấy tất cả luật với phân trang (bao gồm cả inactive - cho admin)
     */
    @Override
    @NonNull
    Page<Law> findAll(@NonNull Pageable pageable);

    /**
     * Tìm kiếm luật theo loại văn bản - chỉ luật active
     */
    @Query("SELECT l FROM Law l WHERE l.status = 'active' AND LOWER(l.lawType) LIKE LOWER(CONCAT('%', :lawType, '%'))")
    Page<Law> findByLawTypeContainingIgnoreCase(@Param("lawType") String lawType, Pageable pageable);

    /**
     * Tìm kiếm luật theo khoảng thời gian ban hành - chỉ luật active
     */
    @Query("SELECT l FROM Law l WHERE l.status = 'active' AND l.issuedDate BETWEEN :startDate AND :endDate")
    Page<Law> findByIssuedDateBetween(@Param("startDate") java.time.LocalDate startDate,
                                     @Param("endDate") java.time.LocalDate endDate,
                                     Pageable pageable);

    /**
     * Tìm kiếm luật theo khoảng thời gian có hiệu lực - chỉ luật active
     */
    @Query("SELECT l FROM Law l WHERE l.status = 'active' AND l.effectiveDate BETWEEN :startDate AND :endDate")
    Page<Law> findByEffectiveDateBetween(@Param("startDate") java.time.LocalDate startDate,
                                        @Param("endDate") java.time.LocalDate endDate,
                                        Pageable pageable);
    
}
