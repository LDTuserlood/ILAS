package com.C1SE61.backend.dto.response.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponseDTO {

    private Integer chatId;
    private String question;
    private String answer;
    private List<String> sources;
    private List<String> chunks;

    public ChatResponseDTO(String question, String answer, List<String> sources, List<String> chunks) {
        this.question = question;
        this.answer = answer;
        this.sources = sources;
        this.chunks = chunks;
    }
}
