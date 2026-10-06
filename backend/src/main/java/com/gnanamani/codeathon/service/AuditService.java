package com.gnanamani.codeathon.service;

import com.gnanamani.codeathon.domain.AuditLog;
import com.gnanamani.codeathon.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void log(String userEmail, String action, String targetEntity, String details, String ipAddress) {
        String effectiveIp = resolveIpAddress(ipAddress);
        AuditLog log = new AuditLog(userEmail, action, targetEntity, details, effectiveIp);
        auditLogRepository.save(log);
    }

    private String resolveIpAddress(String fallbackIp) {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest req = attributes.getRequest();
                String xfHeader = req.getHeader("X-Forwarded-For");
                if (xfHeader != null && !xfHeader.isBlank()) {
                    return xfHeader.split(",")[0].trim();
                }
                String remoteAddr = req.getRemoteAddr();
                if (remoteAddr != null && !remoteAddr.isBlank()) {
                    return remoteAddr;
                }
            }
        } catch (Exception ignored) {}
        return (fallbackIp != null && !fallbackIp.isBlank()) ? fallbackIp : "127.0.0.1";
    }
}
