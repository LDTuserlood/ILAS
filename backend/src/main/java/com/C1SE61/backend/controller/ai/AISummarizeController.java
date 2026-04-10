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
        try {
            String summary = groqService.generateSummary(
                    req.getLawContent(),
                    req.getArticleTitle(),
                    req.getArticleId()
            );

            return ResponseEntity.ok(Map.of("summary", summary));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("AI summarize failed");
        }
    }
}
