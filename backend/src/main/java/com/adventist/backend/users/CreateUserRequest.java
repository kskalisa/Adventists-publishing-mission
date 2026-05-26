package com.adventist.backend.users;

public record CreateUserRequest(String name, String email, UserRole role, String password) {
}
