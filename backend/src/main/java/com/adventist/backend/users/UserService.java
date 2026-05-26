package com.adventist.backend.users;

import com.adventist.backend.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {
    private final AppUserRepository repository;

    public UserService(AppUserRepository repository) {
        this.repository = repository;
    }

    public List<UserDto> listUsers() {
        return repository.findAll().stream().map(UserDto::from).toList();
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        requireText(request.name(), "name");
        requireText(request.email(), "email");
        requireText(request.password(), "password");
        if (request.role() == null) {
            throw new IllegalArgumentException("role is required");
        }
        if (repository.existsByEmailIgnoreCase(request.email())) {
            throw new IllegalArgumentException("email is already registered");
        }
        AppUser user = new AppUser(request.name().trim(), request.email().trim().toLowerCase(), request.role(), "{noop}" + request.password());
        return UserDto.from(repository.save(user));
    }

    public UserDto getUser(Long id) {
        return UserDto.from(repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("user not found")));
    }

    private void requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
    }
}
