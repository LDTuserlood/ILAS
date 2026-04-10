package com.C1SE61.backend.service.ai;

import com.C1SE61.backend.dto.response.ai.ChatbotLogAdminDTO;
import com.C1SE61.backend.model.ChatbotLog;
import com.C1SE61.backend.model.ChatbotSettings;
import com.C1SE61.backend.repository.ChatbotLogRepository;
import com.C1SE61.backend.repository.ChatbotSettingsRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatbotAdminService {

    private final ChatbotLogRepository repo;
    private final ChatbotSettingsRepository settingsRepo;


    // ==========================
    // 1) GET STATISTICS
    // ==========================
    public Map<String, Object> getStats() {

        Long total = repo.count();
        Long failed = repo.countFailed();
        Long success = total - failed;

        return Map.of(
                "totalConversations", total,
                "successfulResponses", success,
                "failedResponses", failed,
                "averageResponseTime", "N/A"
        );
    }


    // ==========================
    // 2) GET ALL LOGS FOR ADMIN
    // ==========================
    public List<ChatbotLogAdminDTO> getAllLogs() {
        List<ChatbotLog> logs = repo.findAllLogs();

        return logs.stream()
                .map(l -> new ChatbotLogAdminDTO(
                        l.getId(),
                        l.getUser() != null ? l.getUser().getEmail() : "Guest",
                        l.getQuestion(),
                        l.getAnswer(),
                        l.getCreatedAt().toString(),
                        (l.getSourceType() != null && !l.getSourceType().equals("error")) 
                                ? "success" : "error"
                )).toList();
    }


    // ==========================
    // 3) GET CURRENT SETTINGS
    // ==========================
    public ChatbotSettings getCurrentSettings() {

        ChatbotSettings settings = settingsRepo.findTopByOrderByIdAsc();

        if (settings == null) {
            // Nếu chưa có, tạo mới mặc định
            settings = new ChatbotSettings();
            settingsRepo.save(settings);
        }

        return settings;
    }


    // ==========================
    // 4) SAVE SETTINGS (FROM ADMIN PANEL)
    // ==========================
    public ChatbotSettings saveSettings(ChatbotSettings newSettings) {

        ChatbotSettings settings = settingsRepo.findTopByOrderByIdAsc();

        if (settings == null) {
            settings = new ChatbotSettings();
        }

        // Gán giá trị mới
        settings.setEnabled(newSettings.isEnabled());
        settings.setWelcomeMessage(newSettings.getWelcomeMessage());
        settings.setResponseDelay(newSettings.getResponseDelay());
        settings.setMaxHistory(newSettings.getMaxHistory());
        settings.setDataSource(newSettings.getDataSource());
        settings.setTemperature(newSettings.getTemperature());
        settings.setMaxTokens(newSettings.getMaxTokens());

        return settingsRepo.save(settings);
    }
}
