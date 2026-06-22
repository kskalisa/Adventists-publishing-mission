package com.adventist.backend.access;

import com.adventist.backend.users.UserRole;

import java.time.Instant;

public record AccessRequestDto(Long id, String name, String email, String phone, String department, UserRole requestedRole, AccessRequestStatus status, Instant createdAt) {
    public static AccessRequestDto from(AccessRequest request) {
        return new AccessRequestDto(
                request.getId(),
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                request.getDepartment(),
                request.getRequestedRole(),
                request.getStatus(),
                request.getCreatedAt()
        );
    }
}
