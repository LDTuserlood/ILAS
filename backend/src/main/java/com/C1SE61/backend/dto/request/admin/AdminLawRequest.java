package com.C1SE61.backend.dto.request.admin;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AdminLawRequest {
    private String title;
    private String code;
    private String lawType;
    private LocalDate issuedDate;
    private LocalDate effectiveDate;
    private String sourceUrl;
    private String status;        // active / inactive / draft...
    private Integer amendedBy;
    private Integer versionNumber;
}



























