package com.C1SE61.backend.dto.request.ai;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SummarizeRequest {
    private String lawContent;
    private String articleTitle;
    private Integer articleId;
}
