package com.C1SE61.backend.repository;

import com.C1SE61.backend.model.ChatbotSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatbotSettingsRepository extends JpaRepository<ChatbotSettings, Integer> {

    Optional<ChatbotSettings> findFirstByOrderByIdAsc();
    ChatbotSettings findTopByOrderByIdAsc();
}
