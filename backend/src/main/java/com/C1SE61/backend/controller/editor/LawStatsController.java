package com.C1SE61.backend.controller.editor;

import com.C1SE61.backend.dto.response.editor.LawStatsResponse;
import com.C1SE61.backend.service.editor.LawStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/editor/law-stats")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class LawStatsController {

    private final LawStatsService lawStatsService;

    @GetMapping("/{editorId}")
    public ResponseEntity<LawStatsResponse> getLawStats(@PathVariable Integer editorId) {
        LawStatsResponse res = lawStatsService.getLawStatsData(editorId);
        return ResponseEntity.ok(res);
    }
}
