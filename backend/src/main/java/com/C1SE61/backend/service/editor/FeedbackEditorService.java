package com.C1SE61.backend.service.editor;

import com.C1SE61.backend.dto.response.editor.FeedbackEditorResponse;
import com.C1SE61.backend.model.Feedback;
import com.C1SE61.backend.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackEditorService {

    private final FeedbackRepository feedbackRepository;

    private final DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public List<FeedbackEditorResponse> getAll() {
        return feedbackRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt())) 
                .map(f -> {

                    String articleTitle = "Không rõ";
                    if (f.getArticle() != null) {
                        articleTitle = f.getArticle().getArticleTitle();
                    }

                    return FeedbackEditorResponse.builder()
                            .id(f.getFeedbackId())
                            .lawTitle(articleTitle)
                            .userName(f.getUser() != null ? f.getUser().getFullName() : "Ẩn danh")
                            .content(f.getContent())
                            .date(f.getCreatedAt().format(fmt))
                            .status(f.getStatus().name())
                            .build();
                })
                .toList();
    }


    public FeedbackEditorResponse markResolved(Integer id) {
        Feedback f = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        f.setStatus(Feedback.Status.RESOLVED);
        feedbackRepository.save(f);

        String articleTitle = "Không rõ";

        if (f.getArticle() != null) {
            articleTitle = f.getArticle().getArticleTitle();
        }

        return FeedbackEditorResponse.builder()
                .id(f.getFeedbackId())
                .lawTitle(articleTitle)
                .userName(f.getUser() != null ? f.getUser().getFullName() : "")
                .content(f.getContent())
                .date(f.getCreatedAt().format(fmt))
                .status(f.getStatus().name())
                .build();
    }

    

}
