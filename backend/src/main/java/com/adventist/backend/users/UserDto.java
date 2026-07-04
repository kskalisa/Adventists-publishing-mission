package com.adventist.backend.users;

import java.time.Instant;

public record UserDto(Long id, String name, String email, UserRole role, boolean active, boolean passwordChangeRequired, Instant createdAt) {
    public static UserDto from(AppUser user) {
        return new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isActive(), user.isPasswordChangeRequired(), user.getCreatedAt());
    }
}
