package com.C1SE61.backend.repository;

import com.C1SE61.backend.model.Feedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {

    // ===================== BASIC CRUD =======================

    @Query("SELECT f FROM Feedback f ORDER BY f.createdAt DESC")
    Page<Feedback> findAllOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT f FROM Feedback f WHERE f.status = :status ORDER BY f.createdAt DESC")
    Page<Feedback> findByStatus(@Param("status") Feedback.Status status, Pageable pageable);

    @Query("SELECT f FROM Feedback f WHERE f.user.userId = :userId ORDER BY f.createdAt DESC")
    List<Feedback> findByUserId(@Param("userId") Integer userId);

    @Query("SELECT f FROM Feedback f WHERE f.law.lawId = :lawId ORDER BY f.createdAt DESC")
    List<Feedback> findByLawId(@Param("lawId") Integer lawId);

    @Query("SELECT f FROM Feedback f WHERE f.article.articleId = :articleId ORDER BY f.createdAt DESC")
    List<Feedback> findByArticleId(@Param("articleId") Integer articleId);

    @Query("SELECT f FROM Feedback f ORDER BY f.createdAt DESC")
    List<Feedback> findFeedbackByEditor(@Param("editorId") Integer editorId);
    
    @Query("SELECT f FROM Feedback f ORDER BY f.createdAt DESC")
    List<Feedback> findAllOrderByLatest();

    @Query("SELECT f FROM Feedback f WHERE f.status = :status ORDER BY f.createdAt DESC")
    List<Feedback> findByStatus(@Param("status") Feedback.Status status);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Feedback> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
