package com.adventist.backend.access;

import com.adventist.backend.users.UserRole;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "access_requests", indexes = {
        @Index(name = "idx_access_requests_email", columnList = "email")
})
public class AccessRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    private String phone;
    private String department;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole requestedRole;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccessRequestStatus status = AccessRequestStatus.PENDING;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected AccessRequest() {
    }

    public AccessRequest(String name, String email, String phone, String department, UserRole requestedRole, String passwordHash) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.department = department;
        this.requestedRole = requestedRole;
        this.passwordHash = passwordHash;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getDepartment() { return department; }
    public UserRole getRequestedRole() { return requestedRole; }
    public AccessRequestStatus getStatus() { return status; }
    public void setStatus(AccessRequestStatus status) { this.status = status; }
    public String getPasswordHash() { return passwordHash; }
    public Instant getCreatedAt() { return createdAt; }
}
