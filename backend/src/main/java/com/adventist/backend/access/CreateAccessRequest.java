package com.adventist.backend.access;

import com.adventist.backend.users.UserRole;

public record CreateAccessRequest(String name, String email, String phone, String department, UserRole requestedRole, String password) {
}
