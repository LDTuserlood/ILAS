package com.C1SE61.backend.controller.editor;

import com.C1SE61.backend.dto.response.editor.FeedbackEditorResponse;
import com.C1SE61.backend.service.editor.FeedbackEditorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/editor/feedback-editor")
@RequiredArgsConstructor
public class FeedbackEditorController {

    private final FeedbackEditorService feedbackEditorService;

    @GetMapping
    public List<FeedbackEditorResponse> getAllFeedback() {
        return feedbackEditorService.getAll();
    }

    @PutMapping("/{id}/resolve")
    public FeedbackEditorResponse resolve(@PathVariable Integer id) {
        return feedbackEditorService.markResolved(id);
    }
}
