package com.adventist.backend.auth;

import com.adventist.backend.users.AppUser;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "auth_challenges", indexes = {
        @Index(name = "idx_auth_challenges_challenge_id", columnList = "challenge_id", unique = true)
})
public class AuthChallenge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "challenge_id", nullable = false, unique = true, length = 64)
    private String challengeId = UUID.randomUUID().toString();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private AppUser user;

    @Column(nullable = false, length = 12)
    private String otpCode;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant expiresAt;

    protected AuthChallenge() {
    }

    public AuthChallenge(AppUser user, String otpCode, Instant expiresAt) {
        this.user = user;
        this.otpCode = otpCode;
        this.expiresAt = expiresAt;
    }

    public Long getId() { return id; }
    public String getChallengeId() { return challengeId; }
    public AppUser getUser() { return user; }
    public String getOtpCode() { return otpCode; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getExpiresAt() { return expiresAt; }
}
