package com.C1SE61.backend.repository;

import com.C1SE61.backend.model.FormTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FormTemplateRepository extends JpaRepository<FormTemplate, Integer> {
    
    List<FormTemplate> findByEditor_UserId(Integer editorId);
    // Find all templates ordered by creation date
    List<FormTemplate> findAllByOrderByCreatedAtDesc();
    // Find all templates with pagination
    Page<FormTemplate> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // 🔒 Only approved templates for public (user) flows
    Page<FormTemplate> findByStatusOrderByCreatedAtDesc(FormTemplate.Status status, Pageable pageable);

    // Search templates by title or description (approved only)
    @Query("SELECT ft FROM FormTemplate ft WHERE " +
           "ft.status = :status AND (" +
           "LOWER(ft.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(ft.description) LIKE LOWER(CONCAT('%', :keyword, '%')))" +
           " ORDER BY ft.createdAt DESC")
    Page<FormTemplate> searchApprovedTemplates(@Param("keyword") String keyword,
                                               @Param("status") FormTemplate.Status status,
                                               Pageable pageable);
    
    // Find templates by category (derived from title)
    @Query("SELECT ft FROM FormTemplate ft WHERE " +
           "ft.status = :status AND (" +
           "((LOWER(ft.title) LIKE LOWER(CONCAT('%', 'khiếu nại', '%')) OR " +
           "LOWER(ft.title) LIKE LOWER(CONCAT('%', 'tố cáo', '%'))) AND :category = 'Khiếu nại') OR " +
           "(LOWER(ft.title) LIKE LOWER(CONCAT('%', 'xin', '%')) AND :category = 'Đơn xin') OR " +
           "(LOWER(ft.title) LIKE LOWER(CONCAT('%', 'thông báo', '%')) AND :category = 'Thông báo') " +
           ") ORDER BY ft.createdAt DESC")
    Page<FormTemplate> findByCategory(@Param("category") String category,
                                      @Param("status") FormTemplate.Status status,
                                      Pageable pageable);
    
    // Find templates by category with search
    @Query("SELECT ft FROM FormTemplate ft WHERE " +
           "ft.status = :status AND " +
           "(((LOWER(ft.title) LIKE LOWER(CONCAT('%', 'khiếu nại', '%')) OR " +
           "LOWER(ft.title) LIKE LOWER(CONCAT('%', 'tố cáo', '%'))) AND :category = 'Khiếu nại') OR " +
           "(LOWER(ft.title) LIKE LOWER(CONCAT('%', 'xin', '%')) AND :category = 'Đơn xin') OR " +
           "(LOWER(ft.title) LIKE LOWER(CONCAT('%', 'thông báo', '%')) AND :category = 'Thông báo')) AND " +
           "(LOWER(ft.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(ft.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY ft.createdAt DESC")
    Page<FormTemplate> findByCategoryAndSearch(@Param("category") String category, 
                                               @Param("keyword") String keyword,
                                               @Param("status") FormTemplate.Status status,
                                               Pageable pageable);
    
    // Get all unique categories (derived from titles)
    @Query("SELECT DISTINCT CASE " +
           "WHEN LOWER(ft.title) LIKE LOWER(CONCAT('%', 'khiếu nại', '%')) OR LOWER(ft.title) LIKE LOWER(CONCAT('%', 'tố cáo', '%')) THEN 'Khiếu nại' " +
           "WHEN LOWER(ft.title) LIKE LOWER(CONCAT('%', 'xin', '%')) THEN 'Đơn xin' " +
           "WHEN LOWER(ft.title) LIKE LOWER(CONCAT('%', 'thông báo', '%')) THEN 'Thông báo' " +
           "ELSE 'Khác' END " +
           "FROM FormTemplate ft WHERE ft.status = :status ORDER BY 1")
    List<String> findDistinctCategories(@Param("status") FormTemplate.Status status);
    
    // Find by template ID
    Optional<FormTemplate> findByTemplateId(Integer templateId);
    Optional<FormTemplate> findByTemplateIdAndStatus(Integer templateId, FormTemplate.Status status);
    
    // Find recent templates
    @Query("SELECT ft FROM FormTemplate ft WHERE ft.status = :status ORDER BY ft.createdAt DESC")
    Page<FormTemplate> findRecentTemplates(@Param("status") FormTemplate.Status status, Pageable pageable);
    
    // Count templates by status
    long countByStatus(FormTemplate.Status status);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<FormTemplate> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}


