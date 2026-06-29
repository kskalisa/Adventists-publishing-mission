package com.adventist.backend.users;

import com.adventist.backend.audit.AuditService;
import com.adventist.backend.common.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {
    private final AppUserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public UserService(AppUserRepository repository, PasswordEncoder passwordEncoder, AuditService auditService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    public List<UserDto> listUsers() {
        return repository.findAll().stream().map(UserDto::from).toList();
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request, AppUser actor) {
        requireText(request.name(), "name");
        requireText(request.email(), "email");
        requireText(request.password(), "password");
        if (request.role() == null) {
            throw new IllegalArgumentException("role is required");
        }
        if (repository.existsByEmailIgnoreCase(request.email())) {
            throw new IllegalArgumentException("email is already registered");
        }
        AppUser user = new AppUser(request.name().trim(), request.email().trim().toLowerCase(), request.role(), passwordEncoder.encode(request.password()));
        AppUser saved = repository.save(user);
        auditService.record(actor, "USER_CREATED", "USER", saved.getId(), "Created " + saved.getRole() + " user " + saved.getEmail());
        return UserDto.from(saved);
    }

    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request, AppUser actor) {
        AppUser user = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("user not found"));
        requireText(request.name(), "name");
        requireText(request.email(), "email");
        if (request.role() == null) {
            throw new IllegalArgumentException("role is required");
        }
        String email = request.email().trim().toLowerCase();
        if (repository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new IllegalArgumentException("email is already registered");
        }
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setRole(request.role());
        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        auditService.record(actor, "USER_UPDATED", "USER", user.getId(), "Updated user " + user.getEmail());
        return UserDto.from(user);
    }

    public UserDto getUser(Long id) {
        return UserDto.from(repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("user not found")));
    }

    @Transactional
    public UserDto setActive(Long id, boolean active, AppUser actor) {
        AppUser user = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("user not found"));
        if (actor != null && actor.getId() != null && actor.getId().equals(user.getId()) && !active) {
            throw new IllegalArgumentException("you cannot lock your own account");
        }
        user.setActive(active);
        auditService.record(actor, active ? "USER_UNLOCKED" : "USER_LOCKED", "USER", user.getId(), (active ? "Unlocked " : "Locked ") + user.getEmail());
        return UserDto.from(user);
    }

    @Transactional
    public void deleteUser(Long id, AppUser actor) {
        AppUser user = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("user not found"));
        if (actor != null && actor.getId() != null && actor.getId().equals(user.getId())) {
            throw new IllegalArgumentException("you cannot delete your own account");
        }
        auditService.record(actor, "USER_DELETED", "USER", user.getId(), "Deleted user " + user.getEmail());
        repository.delete(user);
    }

    private void requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
    }
}
