package com.adventist.backend.audit;

import com.adventist.backend.users.AppUser;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long actorId;

    @Column(nullable = false)
    private String actorName;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String resourceType;

    private Long resourceId;

    @Column(nullable = false, length = 700)
    private String summary;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected AuditLog() {
    }

    public AuditLog(AppUser actor, String action, String resourceType, Long resourceId, String summary) {
        this.actorId = actor == null ? null : actor.getId();
        this.actorName = actor == null ? "System" : actor.getName();
        this.action = action;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.summary = summary;
    }

    public Long getId() { return id; }
    public Long getActorId() { return actorId; }
    public String getActorName() { return actorName; }
    public String getAction() { return action; }
    public String getResourceType() { return resourceType; }
    public Long getResourceId() { return resourceId; }
    public String getSummary() { return summary; }
    public Instant getCreatedAt() { return createdAt; }
}
