package com.adventist.backend.auth;

import com.adventist.backend.users.UserDto;

public record AuthResponse(UserDto user, String token) {
}
