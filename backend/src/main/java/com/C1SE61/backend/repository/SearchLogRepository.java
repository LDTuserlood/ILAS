package com.C1SE61.backend.repository;

import com.C1SE61.backend.model.SearchLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SearchLogRepository extends JpaRepository<SearchLog, Integer> {

    List<SearchLog> findAllByUser_UserIdOrderByCreatedAtDesc(Integer userId);

    @Query("""
        SELECT s.keyword, COUNT(s) as count
        FROM SearchLog s
        WHERE s.keyword IS NOT NULL AND s.keyword <> ''
        GROUP BY s.keyword
        ORDER BY COUNT(s) DESC
    """)
    List<Object[]> findTopSearchKeywords(Pageable pageable);
}

