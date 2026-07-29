package com.rrtechnosoft.lms.service;

import com.rrtechnosoft.lms.entity.AuditLog;
import com.rrtechnosoft.lms.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(UUID actorId, String action, String entityType, UUID entityId, String ipAddress) {
        AuditLog log = AuditLog.builder()
                .actorId(actorId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .ipAddress(ipAddress)
                .build();
        auditLogRepository.save(log);
    }
}
