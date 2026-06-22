package com.adventist.backend.access;

import com.adventist.backend.common.ResourceNotFoundException;
import com.adventist.backend.users.AppUser;
import com.adventist.backend.users.AppUserRepository;
import com.adventist.backend.users.UserDto;
import com.adventist.backend.users.UserRole;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AccessRequestService {
    private final AccessRequestRepository accessRequestRepository;
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AccessRequestService(AccessRequestRepository accessRequestRepository, AppUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.accessRequestRepository = accessRequestRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AccessRequestDto requestAccess(CreateAccessRequest request) {
        requireText(request.name(), "name");
        requireText(request.email(), "email");
        requireText(request.password(), "password");
        UserRole requestedRole = request.requestedRole() == null ? UserRole.SALES : request.requestedRole();
        if (requestedRole == UserRole.ADMIN) {
            throw new IllegalArgumentException("admin access cannot be self-requested");
        }
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new IllegalArgumentException("email is already registered");
        }
        if (accessRequestRepository.existsByEmailIgnoreCaseAndStatus(request.email(), AccessRequestStatus.PENDING)) {
            throw new IllegalArgumentException("an access request for this email is already pending");
        }
        AccessRequest accessRequest = new AccessRequest(
                request.name().trim(),
                request.email().trim().toLowerCase(),
                clean(request.phone()),
                clean(request.department()),
                requestedRole,
                passwordEncoder.encode(request.password())
        );
        return AccessRequestDto.from(accessRequestRepository.save(accessRequest));
    }

    @Transactional(readOnly = true)
    public List<AccessRequestDto> listRequests() {
        return accessRequestRepository.findAll().stream().map(AccessRequestDto::from).toList();
    }

    @Transactional
    public UserDto approve(Long id) {
        AccessRequest request = findPending(id);
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new IllegalArgumentException("email is already registered");
        }
        AppUser user = new AppUser(request.getName(), request.getEmail(), request.getRequestedRole(), request.getPasswordHash());
        request.setStatus(AccessRequestStatus.APPROVED);
        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public AccessRequestDto reject(Long id) {
        AccessRequest request = findPending(id);
        request.setStatus(AccessRequestStatus.REJECTED);
        return AccessRequestDto.from(request);
    }

    private AccessRequest findPending(Long id) {
        AccessRequest request = accessRequestRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("access request not found"));
        if (request.getStatus() != AccessRequestStatus.PENDING) {
            throw new IllegalArgumentException("access request is already resolved");
        }
        return request;
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private void requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
    }
}
