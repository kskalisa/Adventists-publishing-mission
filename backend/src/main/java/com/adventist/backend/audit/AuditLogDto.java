package com.adventist.backend.audit;

import java.time.Instant;

public record AuditLogDto(
        Long id,
        Long actorId,
        String actorName,
        String action,
        String resourceType,
        Long resourceId,
        String summary,
        Instant createdAt
) {
    public static AuditLogDto from(AuditLog log) {
        return new AuditLogDto(
                log.getId(),
                log.getActorId(),
                log.getActorName(),
                log.getAction(),
                log.getResourceType(),
                log.getResourceId(),
                log.getSummary(),
                log.getCreatedAt()
        );
    }
}
