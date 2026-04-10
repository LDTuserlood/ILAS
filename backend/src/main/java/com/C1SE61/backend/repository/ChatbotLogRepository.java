package com.C1SE61.backend.repository;

import com.C1SE61.backend.dto.response.ai.TopQuestionResponse;
import com.C1SE61.backend.model.ChatbotLog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ChatbotLogRepository extends JpaRepository<ChatbotLog, Integer> {

    List<ChatbotLog> findAllByUser_UserIdOrderByCreatedAtAsc(Integer userId);

    @Query("""
        SELECT new com.C1SE61.backend.dto.response.ai.TopQuestionResponse(
            c.questionClean,
            COUNT(c)
        )
        FROM ChatbotLog c
        WHERE c.questionClean IS NOT NULL AND c.questionClean <> ''
        GROUP BY c.questionClean
        ORDER BY COUNT(c) DESC
    """)
    List<TopQuestionResponse> findTopQuestions();

    // Admin stats
    @Query("SELECT COUNT(c) FROM ChatbotLog c WHERE c.sourceType = 'error' OR c.answer LIKE '%fallback%' ")
    Long countFailed();

    @Query("SELECT c FROM ChatbotLog c ORDER BY c.createdAt DESC")
    List<ChatbotLog> findAllLogs();
        @Query("""
        SELECT c FROM ChatbotLog c
        WHERE c.user.userId = :userId
        ORDER BY c.createdAt DESC
    """)
    List<ChatbotLog> findLatestByUser(Integer userId, Pageable pageable);

}

