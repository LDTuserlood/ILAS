package com.C1SE61.backend.controller.editor;

import com.C1SE61.backend.dto.response.editor.FeedbackStatsResponse;
import com.C1SE61.backend.service.editor.FeedbackStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/editor/feedback-stats")
@RequiredArgsConstructor
public class FeedbackStatsController {

    private final FeedbackStatsService feedbackStatsService;

    @GetMapping("/{editorId}")
    public ResponseEntity<FeedbackStatsResponse> getFeedbackStats(@PathVariable Integer editorId) {
        FeedbackStatsResponse res = feedbackStatsService.getStats(editorId);
        return ResponseEntity.ok(res);
    }
}
