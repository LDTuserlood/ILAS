package com.C1SE61.backend.controller.ai;

import com.C1SE61.backend.dto.request.ai.SummarizeRequest;
import com.C1SE61.backend.service.ai.GroqService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AISummarizeController {

    private final GroqService groqService;

    @PostMapping("/summarize-law")
    public ResponseEntity<?> summarize(@RequestBody SummarizeRequest req) {
        if (req == null || req.getLawContent() == null || req.getLawContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "LAW_CONTENT_EMPTY",
                    "message", "Nội dung điều luật trống, không thể rút gọn."
            ));
        }

        try {
            String summary = groqService.generateSummary(
                    req.getLawContent(),
                    req.getArticleTitle(),
                    req.getArticleId()
            );

            return ResponseEntity.ok(Map.of("summary", summary));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "AI_SUMMARIZE_FAILED",
                    "message", e.getMessage() == null ? "AI summarize failed" : e.getMessage()
            ));
        }
    }
}
