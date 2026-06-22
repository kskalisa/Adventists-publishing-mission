package com.adventist.backend.auth;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface AuthTokenRepository extends JpaRepository<AuthToken, Long> {
    @EntityGraph(attributePaths = "user")
    Optional<AuthToken> findByToken(String token);

    void deleteByExpiresAtBefore(Instant instant);
}
