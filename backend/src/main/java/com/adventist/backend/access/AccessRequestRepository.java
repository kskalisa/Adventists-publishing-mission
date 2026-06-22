package com.adventist.backend.access;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AccessRequestRepository extends JpaRepository<AccessRequest, Long> {
    boolean existsByEmailIgnoreCaseAndStatus(String email, AccessRequestStatus status);
}
