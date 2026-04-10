package com.C1SE61.backend.controller.editor;

import com.C1SE61.backend.dto.request.editor.SimplifiedArticleRequestDTO;
import com.C1SE61.backend.dto.response.editor.SimplifiedArticleResponseDTO;
import com.C1SE61.backend.model.SimplifiedArticle;
import com.C1SE61.backend.service.editor.SimplifiedArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/editor/simplified")
@RequiredArgsConstructor
@CrossOrigin("*")
public class SimplifiedArticleController {

    private final SimplifiedArticleService simplifiedService;

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody SimplifiedArticleRequestDTO req) {
        try {
            SimplifiedArticle sa = simplifiedService.createOrUpdateSimplified(
                    req.getArticleId(),
                    req.getEditorId(),
                    req.getCategory(),
                    req.getContentSimplified()
            );
            return ResponseEntity.ok(sa);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/by-article/{articleId}")
    public ResponseEntity<?> getSimplifiedByArticle(@PathVariable Integer articleId) {
        return simplifiedService.getByArticleId(articleId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/mine/{editorId}")
    public ResponseEntity<List<SimplifiedArticleResponseDTO>> getMine(@PathVariable Integer editorId) {
        return ResponseEntity.ok(simplifiedService.getByEditor(editorId));
    }

    @PutMapping("/{simplifiedId}/approve")
    public ResponseEntity<?> approveOne(
            @PathVariable Integer simplifiedId,
            @RequestParam Integer editorId
    ) {
        try {
            return ResponseEntity.ok(simplifiedService.approveOne(simplifiedId, editorId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/approve-all/{editorId}")
    public ResponseEntity<?> approveAll(@PathVariable Integer editorId) {
        try {
            int updated = simplifiedService.approveAll(editorId);
            return ResponseEntity.ok(Map.of(
                    "updated", updated,
                    "message", "Approved all simplified items successfully"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/hide-all/{editorId}")
    public ResponseEntity<?> hideAll(@PathVariable Integer editorId) {
        try {
            int updated = simplifiedService.hideAllFromUser(editorId);
            return ResponseEntity.ok(Map.of(
                    "updated", updated,
                    "message", "Hidden all simplified items from users successfully"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{simplifiedId}/hide-from-user")
    public ResponseEntity<?> hideFromUser(
            @PathVariable Integer simplifiedId,
            @RequestParam Integer editorId
    ) {
        try {
            return ResponseEntity.ok(simplifiedService.hideFromUser(simplifiedId, editorId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

