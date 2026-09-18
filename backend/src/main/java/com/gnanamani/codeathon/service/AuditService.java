package com.gnanamani.codeathon.service;

import com.gnanamani.codeathon.domain.AuditLog;
import com.gnanamani.codeathon.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void log(String userEmail, String action, String targetEntity, String details, String ipAddress) {
        AuditLog log = new AuditLog(userEmail, action, targetEntity, details, ipAddress);
        auditLogRepository.save(log);
    }
}
