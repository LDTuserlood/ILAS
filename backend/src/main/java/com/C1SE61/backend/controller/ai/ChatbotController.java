package com.C1SE61.backend.controller.ai;

import com.C1SE61.backend.dto.request.ai.ChatRequestDTO;
import com.C1SE61.backend.dto.response.ai.ChatHistoryDTO;
import com.C1SE61.backend.dto.response.ai.ChatResponseDTO;
import com.C1SE61.backend.dto.response.ai.TopQuestionResponse;
import com.C1SE61.backend.model.ChatbotSettings;

import com.C1SE61.backend.repository.ChatbotSettingsRepository;
import com.C1SE61.backend.service.ai.ChatbotService;
import com.C1SE61.backend.service.ai.ChatbotAdminService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final ChatbotAdminService chatbotAdminService;
    private final ChatbotSettingsRepository settingsRepo;


    // ==============================
    // USER — ASK CHATBOT
    // ==============================
    @PostMapping("/ask")
    public ResponseEntity<ChatResponseDTO> ask(@RequestBody ChatRequestDTO req) {
        System.out.println("🟢 ChatbotController.ask received request: userId=" 
                + req.getUserId() + " question=" + req.getQuestion());
        return ResponseEntity.ok(chatbotService.processQuestion(req));
    }

    @GetMapping("/top-questions")
    public List<TopQuestionResponse> getTopQuestions() {
        return chatbotService.getTopQuestions();
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<ChatHistoryDTO>> getHistory(@PathVariable Integer userId) {
        return ResponseEntity.ok(chatbotService.getHistory(userId));
    }


    // ==============================
    // ADMIN — REBUILD AI ENGINE
    // ==============================
    @PostMapping("/admin/rebuild")
    public ResponseEntity<?> rebuildAI() {
        RestTemplate rest = new RestTemplate();
        try {
            rest.postForEntity("http://127.0.0.1:5000/api/admin/rebuild", null, String.class);
            return ResponseEntity.ok(Map.of("message", "Rebuild started"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }


    // ==============================
    // ADMIN — STATS + LOGS
    // ==============================
    @GetMapping("/admin/stats")
    public ResponseEntity<?> getChatbotStats() {
        return ResponseEntity.ok(chatbotAdminService.getStats());
    }

    @GetMapping("/admin/logs")
    public ResponseEntity<?> getAllChatLogs() {
        return ResponseEntity.ok(chatbotAdminService.getAllLogs());
    }


    // ==============================
    // ADMIN — GET CHATBOT SETTINGS
    // ==============================
    @GetMapping("/admin/settings")
    public ResponseEntity<?> getSettings() {

        ChatbotSettings settings = settingsRepo.findFirstByOrderByIdAsc()
                .orElseGet(() -> {
                    ChatbotSettings s = new ChatbotSettings();
                    return settingsRepo.save(s);
                });

        return ResponseEntity.ok(settings);
    }

    // Simple ping to verify routing & CORS during debugging
    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        System.out.println("🟡 ChatbotController.ping called");
        return ResponseEntity.ok(Map.of("status", "ok"));
    }


    // ==============================
    // ADMIN — SAVE CHATBOT SETTINGS
    // ==============================
    @PostMapping("/admin/settings")
    public ResponseEntity<?> saveSettings(@RequestBody ChatbotSettings payload) {

        ChatbotSettings settings = settingsRepo.findFirstByOrderByIdAsc()
                .orElse(new ChatbotSettings());

        settings.setEnabled(payload.isEnabled());
        settings.setWelcomeMessage(payload.getWelcomeMessage());
        settings.setResponseDelay(payload.getResponseDelay());
        settings.setMaxHistory(payload.getMaxHistory());
        settings.setDataSource(payload.getDataSource());
        settings.setTemperature(payload.getTemperature());
        settings.setMaxTokens(payload.getMaxTokens());

        settingsRepo.save(settings);

        return ResponseEntity.ok(Map.of("status", "saved", "settings", settings));
    }

}
