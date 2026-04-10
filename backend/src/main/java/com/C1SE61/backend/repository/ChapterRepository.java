package com.C1SE61.backend.repository;

import com.C1SE61.backend.model.Chapter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Integer> {

    /**
     * Tìm chapters theo law ID - chỉ chapters active
     */
    @Query("SELECT c FROM Chapter c WHERE c.law.lawId = :lawId AND c.status = 'active'")
    List<Chapter> findByLawId(@Param("lawId") Integer lawId);

    /**
     * Tìm chapters theo law ID (bao gồm mọi trạng thái) với phân trang - cho admin
     */
    @Query("SELECT c FROM Chapter c WHERE c.law.lawId = :lawId")
    Page<Chapter> findByLawId(@Param("lawId") Integer lawId, Pageable pageable);

    /**
     * Tìm chapter theo law ID và số chương - chỉ chapters active
     */
    @Query("SELECT c FROM Chapter c WHERE c.law.lawId = :lawId AND c.chapterNumber = :chapterNumber AND c.status = 'active'")
    List<Chapter> findByLawIdAndChapterNumber(@Param("lawId") Integer lawId,
                                              @Param("chapterNumber") String chapterNumber);

    /**
     * Tìm tất cả chapters active
     */
    @Query("SELECT c FROM Chapter c WHERE c.status = 'active'")
    List<Chapter> findAllActive();
}
