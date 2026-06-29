package com.adventist.backend.audit;

import com.adventist.backend.users.AppUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditService {
    private final AuditLogRepository repository;

    public AuditService(AuditLogRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void record(AppUser actor, String action, String resourceType, Long resourceId, String summary) {
        repository.save(new AuditLog(actor, action, resourceType, resourceId, summary));
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> listRecent() {
        return repository.findTop100ByOrderByCreatedAtDesc().stream().map(AuditLogDto::from).toList();
    }
}
