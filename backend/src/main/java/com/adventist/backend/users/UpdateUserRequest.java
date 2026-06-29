package com.adventist.backend.users;

public record UpdateUserRequest(String name, String email, UserRole role, String password) {
}
