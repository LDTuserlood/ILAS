package com.C1SE61.backend.repository;

import com.C1SE61.backend.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop20ByOrderByCreatedAtDesc();
}


