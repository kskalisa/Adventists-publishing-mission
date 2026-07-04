package com.adventist.backend.auth;

public record LoginRequest(String email, String password, String otp, String challengeId) {
}
