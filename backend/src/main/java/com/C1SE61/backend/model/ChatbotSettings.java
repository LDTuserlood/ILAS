package com.C1SE61.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chatbot_settings")
@Data
public class ChatbotSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private boolean enabled;
    private String welcomeMessage;
    private Integer responseDelay;
    private Integer maxHistory;
    private String dataSource;
    private Double temperature;
    private Integer maxTokens;
}

