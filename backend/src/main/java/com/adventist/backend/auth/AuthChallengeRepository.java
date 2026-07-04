package com.adventist.backend.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface AuthChallengeRepository extends JpaRepository<AuthChallenge, Long> {
    Optional<AuthChallenge> findByChallengeId(String challengeId);

    void deleteByExpiresAtBefore(Instant instant);

    void deleteByUserId(Long userId);
}
