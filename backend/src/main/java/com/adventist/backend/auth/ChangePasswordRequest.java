package com.adventist.backend.auth;

public record ChangePasswordRequest(String currentPassword, String newPassword) {
}
