package com.C1SE61.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chatbot_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatbotLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chat_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserAccount user;

    @Column(columnDefinition = "TEXT")
    private String question;

    @Column(columnDefinition = "LONGTEXT")
    private String answer;

    @Column(name = "source_type", length = 50)
    private String sourceType;

    @Column(name = "source_title", columnDefinition = "TEXT")
    private String sourceTitle;

    @Column(name = "question_clean", columnDefinition = "TEXT")
    private String questionClean;

    @Column(name = "source_role", length = 20)
    private String sourceRole;

    @Column(name = "conversation_id", length = 64)
    private String conversationId;

    @Column(name = "feedback_status", length = 20)
    private String feedbackStatus;

    @Column(name = "feedback_reason", columnDefinition = "TEXT")
    private String feedbackReason;

    @Column(name = "feedback_at")
    private LocalDateTime feedbackAt;

    @Column(name = "review_status", length = 20)
    private String reviewStatus;

    @Column(name = "review_note", columnDefinition = "TEXT")
    private String reviewNote;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
