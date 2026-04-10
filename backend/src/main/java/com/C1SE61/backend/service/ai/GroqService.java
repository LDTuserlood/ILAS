package com.C1SE61.backend.service.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.Map;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GroqService {

    @Value("${groq.api.key:}")
    private String apiKey;

    private final RestClient rest = RestClient.create();

    public String generateSummary(String content, String title, Integer articleId) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Missing Groq API key. Set GROQ_API_KEY env var or groq.api.key in application.properties");
        }

        if (content != null) content = content.replace("%", "%%");
        if (title != null) title = title.replace("%", "%%");

        String prompt = """
        Bạn là trợ lý pháp lý. Hãy rút gọn điều luật sau thành bản tóm tắt NGẮN – RÕ – ĐÚNG PHÁP LÝ.

        QUY TẮC BẮT BUỘC:
        1) Không được thêm ý mới.
        2) Không mở rộng, không giải thích.
        3) Viết tối đa 6 câu, tối thiểu 3 câu.
        4) Mỗi câu ngắn gọn, dễ hiểu với công nhân.
        5) Viết dạng liệt kê số thứ tự: 1., 2., 3., ...

        Thông tin:
        - Tiêu đề: %s
        - Số điều: %s

        Nội dung gốc:
        %s

        Chỉ trả về bản rút gọn. Không viết gì thêm.
        """.formatted(title, articleId, content);

        try {
            Map response = rest.post()
                    .uri("https://api.groq.com/openai/v1/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .body(Map.of(
                            "model", "llama-3.1-8b-instant",
                            "messages", List.of(
                                    Map.of("role", "user", "content", prompt)
                            )
                    ))
                    .retrieve()
                    .body(Map.class);

            return extract(response);

        } catch (Exception e) {
            System.err.println("❌ Groq API error: " + e.getMessage());
            throw new RuntimeException("Groq API error");
        }
    }

    private String extract(Map<String, Object> response) {
        try {
            List<Object> choices = (List<Object>) response.get("choices");
            Map<String, Object> choice0 = (Map<String, Object>) choices.get(0);
            Map<String, Object> message = (Map<String, Object>) choice0.get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            return "Không thể rút gọn điều luật.";
        }
    }

}
